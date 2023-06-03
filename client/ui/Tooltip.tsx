import {
  autoUpdate,
  flip,
  offset as offsetMiddleware,
  shift,
  Side,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import cn from 'classnames';
import React from 'react';
import { Portal, TooltipContext, tooltipRootId } from '../lib/utils.js';
import s from './Tooltip.module.css';

type ITooltipProps = {
  className?: string;
  offset?: number;
  placement?: Side;
  theme?: 'primary' | 'outline';
  children: any;
};

export const Tooltip = ({
  className = '',
  offset = 0,
  placement = 'top',
  theme = 'primary',
  children,
}: ITooltipProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    x,
    y,
    strategy,
    refs,
    context,
    placement: updatedPlacement,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offsetMiddleware(offset), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement,
  });
  const hover = useHover(context, { move: false });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss]);

  const ctx = {
    x,
    y,
    strategy,
    refs,
    context,
    getReferenceProps,
    getFloatingProps,
    placement: updatedPlacement as Side,
    className,
    theme,
  };

  return <TooltipContext.Provider value={ctx}>{children}</TooltipContext.Provider>;
};

export const TTrigger = ({ children }) => {
  const { refs, getReferenceProps, className } = React.useContext(TooltipContext);
  return (
    <div className={className || 'inline-block'} ref={refs.setReference} {...getReferenceProps()}>
      {children}
    </div>
  );
};

export const TContent = ({ children }) => {
  const tooltipRootSelector = `#${tooltipRootId}`;
  const [caretOffset, setCaretOffset] = React.useState(0);
  const [transitionDuration, setTransitionDuration] = React.useState(0);

  const { x, y, refs, strategy, context, getFloatingProps, placement, theme } =
    React.useContext(TooltipContext);

  const { isMounted, styles: tooltipStyles } = useTransitionStyles(context, {
    duration: transitionDuration,
    open: ({ side }) => {
      switch (side) {
        case 'left':
          return { transform: `translate(-${caretOffset}px, 0)` };
        case 'right':
          return { transform: `translate(${caretOffset}px, 0)` };
        case 'bottom':
          return { transform: `translate(0, ${caretOffset}px)` };
        case 'top':
        default:
          return { transform: `translate(0, -${caretOffset}px)` };
      }
    },
    initial: ({ side }) => {
      switch (side) {
        case 'left':
          return { opacity: 0, transform: `translate(10px, 0)` };
        case 'right':
          return { opacity: 0, transform: `translate(-10px, 0)` };
        case 'bottom':
          return { opacity: 0, transform: `translate(0, -10px)` };
        case 'top':
        default:
          return { opacity: 0, transform: `translate(0, 10px)` };
      }
    },
  });

  const { styles: caretStyles } = useTransitionStyles(context, {
    duration: Math.round(transitionDuration * 0.67),
    initial: { opacity: 0 },
  });

  React.useEffect(() => {
    const newCaretOffset = getComputedStyle(
      document.querySelector(tooltipRootSelector)!
    ).getPropertyValue('--tooltipCaretHeight');
    const newTransitionDuration = getComputedStyle(
      document.querySelector(tooltipRootSelector)!
    ).getPropertyValue('--tooltipTransitionDuration');
    setCaretOffset(Number(newCaretOffset.replace('px', '')));
    setTransitionDuration(Number(newTransitionDuration.replace('s', '')) * 1000);
  }, []);

  if (!isMounted) return null;

  return (
    <Portal selector={tooltipRootSelector}>
      <div
        className={s.tooltip}
        ref={refs.setFloating}
        style={{
          ...tooltipStyles,
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: 'max-content',
        }}
        {...getFloatingProps()}
      >
        <div className={cn(s.content, { [s.content_outline]: theme === 'outline' })}>
          {children}
        </div>
        <div className={s.carets} style={caretStyles}>
          <i
            className={cn(s.caretInner, {
              [s.caretInner_top]: placement === 'top',
              [s.caretInner_bottom]: placement === 'bottom',
              [s.caretInner_left]: placement === 'left',
              [s.caretInner_right]: placement === 'right',
            })}
          ></i>
          <i
            className={cn(s.caretOuter, {
              [s.caretOuter_outline]: theme === 'outline',
              [s.caretOuter_top]: placement === 'top',
              [s.caretOuter_bottom]: placement === 'bottom',
              [s.caretOuter_left]: placement === 'left',
              [s.caretOuter_right]: placement === 'right',
            })}
          ></i>
        </div>
      </div>
    </Portal>
  );
};
