'use client';

import { useState, useCallback } from 'react';

export interface EditorState {
  selectedElementId: string | null;
  isDragging: boolean;
  isEditing: boolean; // inline text editing
  dragStart: { slideX: number; slideY: number; offsetX: number; offsetY: number } | null;
}

export interface EditorActions {
  selectElement: (elementId: string) => void;
  deselectAll: () => void;
  startEditing: () => void;
  stopEditing: () => void;
}

export function useEditorState(): [EditorState, EditorActions] {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState<EditorState['dragStart']>(null);

  const selectElement = useCallback((elementId: string) => {
    setSelectedElementId(elementId);
    setIsEditing(false);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedElementId(null);
    setIsEditing(false);
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const startEditing = useCallback(() => {
    if (selectedElementId) setIsEditing(true);
  }, [selectedElementId]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return [
    { selectedElementId, isDragging, isEditing, dragStart },
    { selectElement, deselectAll, startEditing, stopEditing },
  ];
}
