import { useEffect, useState } from 'react';
import { BREAKPOINTS } from '../constants';

/**
 * Detects if viewport is desktop-sized
 *
 * Uses window dimensions instead of CSS media queries because the widget
 * runs in an iframe - media queries would check the parent page's viewport.
 */
export function useResponsive(
  breakpoint: number = BREAKPOINTS.DESKTOP,
): boolean {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' && window.innerWidth >= breakpoint,
  );

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, [breakpoint]);

  return isDesktop;
}
