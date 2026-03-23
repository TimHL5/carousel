import type { SlideProps } from '@/types/carousel';
import HookSlide from './HookSlide';
import StepSlide from './StepSlide';
import SplitSlide from './SplitSlide';
import ResultSlide from './ResultSlide';
import ConceptSlide from './ConceptSlide';
import CloseSlide from './CloseSlide';
import CloseCTASlide from './CloseCTASlide';
import QuoteSlide from './QuoteSlide';
import TextSlide from './TextSlide';

// Dispatcher — selects the right slide component by slide.type
// Falls through to TextSlide for any unrecognized type
export default function SlideRenderer(props: SlideProps) {
  switch (props.slide.type) {
    case 'hook':
      return <HookSlide {...props} />;
    case 'step':
      return <StepSlide {...props} />;
    case 'split':
      return <SplitSlide {...props} />;
    case 'result':
      return <ResultSlide {...props} />;
    case 'concept':
      return <ConceptSlide {...props} />;
    case 'close':
      return <CloseSlide {...props} />;
    case 'close-cta':
      return <CloseCTASlide {...props} />;
    case 'quote':
      return <QuoteSlide {...props} />;
    case 'text':
    default:
      return <TextSlide {...props} />;
  }
}
