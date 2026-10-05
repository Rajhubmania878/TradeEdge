import { useEffect } from 'react';

/**
 * useLockBodyScroll
 * Locks document.body and root layout scroll when an overlay / modal is active,
 * preventing mousewheel and touch scroll leaks to background content.
 */
export const useLockBodyScroll = (isLocked: boolean = true): void => {
  useEffect(() => {
    if (!isLocked) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isLocked]);
};

export default useLockBodyScroll;
