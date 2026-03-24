import { useReducer, useCallback, useEffect } from 'react';
import type { HistoryState } from '@/types/carousel';

type UndoAction = { type: 'UNDO' } | { type: 'REDO' };

// Actions that should NOT push to undo history (high-frequency or transient)
type SkipHistoryAction = { _skipHistory?: boolean };

const MAX_HISTORY = 50;

export function useUndoReducer<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  /** Action types that bypass undo history (e.g., per-keystroke text changes) */
  skipHistoryTypes: string[] = [],
): [HistoryState<S>, (action: A | UndoAction) => void, { canUndo: boolean; canRedo: boolean }] {
  const historyReducer = useCallback(
    (history: HistoryState<S>, action: A | UndoAction): HistoryState<S> => {
      if ((action as UndoAction).type === 'UNDO') {
        if (history.past.length === 0) return history;
        const previous = history.past[history.past.length - 1];
        return {
          past: history.past.slice(0, -1),
          present: previous,
          future: [history.present, ...history.future],
        };
      }

      if ((action as UndoAction).type === 'REDO') {
        if (history.future.length === 0) return history;
        const next = history.future[0];
        return {
          past: [...history.past, history.present],
          present: next,
          future: history.future.slice(1),
        };
      }

      // Normal action — forward to inner reducer
      const newPresent = reducer(history.present, action as A);
      if (newPresent === history.present) return history; // no change

      // Skip history for high-frequency actions (keystrokes, slider drags)
      const shouldSkip = skipHistoryTypes.includes((action as A).type);
      if (shouldSkip) {
        return { ...history, present: newPresent };
      }

      return {
        past: [...history.past.slice(-MAX_HISTORY + 1), history.present],
        present: newPresent,
        future: [], // new action clears redo stack
      };
    },
    [reducer, skipHistoryTypes],
  );

  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  // Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
  // Skip when focused in textarea/input (let native undo handle it)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable) {
          return; // let native text undo handle it
        }
        e.preventDefault();
        dispatch(e.shiftKey ? { type: 'REDO' } : { type: 'UNDO' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return [
    history,
    dispatch,
    { canUndo: history.past.length > 0, canRedo: history.future.length > 0 },
  ];
}
