import {
  autoUpdate,
  ExtendedRefs,
  flip,
  offset as offsetMiddleware,
  Placement,
  ReferenceType,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import React from 'react';
import { popoverRootId, Portal } from '../lib/utils.js';

type IUsePopupProps = {
  isOpen: boolean;
  setIsOpen: (isOpen) => void;
  offset?: number;
  placement?: Placement;
};

type IPopupProps = {
  children: any;
  strategy: any;
  x: number | null;
  y: number | null;
  refs: ExtendedRefs<ReferenceType>;
  getFloatingProps: any;
  context: any;
  shouldSkipCloseAnimation?: boolean;
  canUseReferenceWidth?: boolean;
};

export const usePopup = (props: IUsePopupProps) => {
  const { isOpen, setIsOpen, offset = 10, placement = 'bottom-start' } = props;

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offsetMiddleware(offset), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const popupProps = { x, y, strategy, refs, getFloatingProps, context };

  return { refs, getReferenceProps, popupProps };
};

export const Popup = (props: IPopupProps) => {
  const tooltipRootSelector = `#${popoverRootId}`;
  const {
    children,
    x,
    y,
    strategy,
    refs,
    getFloatingProps,
    context,
    shouldSkipCloseAnimation = false,
    canUseReferenceWidth = false,
  } = props;

  const [referenceWidth, setReferenceWidth] = React.useState('max-content');

  const { isMounted, styles } = useTransitionStyles(context, {
    duration: {
      open: 200,
      close: shouldSkipCloseAnimation ? 0 : 200,
    },
    initial: ({ side }) => {
      switch (side) {
        case 'left':
          return { opacity: 0, transform: `translate(12px, 0)` };
        case 'right':
          return { opacity: 0, transform: `translate(-12px, 0)` };
        case 'bottom':
          return { opacity: 0, transform: `translate(0, -12px)` };
        case 'top':
        default:
          return { opacity: 0, transform: `translate(0, 12px)` };
      }
    },
  });

  React.useEffect(() => {
    const reference: any = refs.reference.current;
    if (canUseReferenceWidth) {
      setReferenceWidth(`${reference.offsetWidth}px`);
    }
  }, []);

  return (
    <Portal selector={tooltipRootSelector}>
      {isMounted && (
        <div
          style={{
            ...styles,
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: referenceWidth,
          }}
          ref={refs.setFloating}
          {...getFloatingProps()}
        >
          {children}
        </div>
      )}
    </Portal>
  );
};
