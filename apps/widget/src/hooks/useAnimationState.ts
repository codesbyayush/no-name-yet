import { useState } from 'react';
import { ANIMATION_DURATION } from '../constants';

interface AnimationState {
  isOpen: boolean;
  isClosing: boolean;
  isOpening: boolean;
  isFabBouncing: boolean;
}

interface AnimationActions {
  open: () => void;
  startClose: () => void;
  close: () => void;
  triggerFabBounce: () => void;
}

/**
 * Manages widget open/close animation states and timing
 */
export function useAnimationState(): AnimationState & AnimationActions {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isFabBouncing, setIsFabBouncing] = useState(false);

  const open = () => {
    setIsOpening(true);
    setIsOpen(true);
    window.setTimeout(() => setIsOpening(false), ANIMATION_DURATION.ICON_SWAP);
  };

  const startClose = () => {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
    }, ANIMATION_DURATION.CLOSE);
  };

  const close = () => {
    setIsOpen(false);
  };

  const triggerFabBounce = () => {
    setIsFabBouncing(false);
    document.body.offsetHeight; // Force reflow
    setIsFabBouncing(true);
    setTimeout(() => setIsFabBouncing(false), ANIMATION_DURATION.FAB_BOUNCE);
  };

  return {
    isOpen,
    isClosing,
    isOpening,
    isFabBouncing,
    open,
    startClose,
    close,
    triggerFabBounce,
  };
}
