
'use client';

import { useEffect } from 'react';
import { useBeforeUnload } from 'react-use';
import { usePathname } from 'next/navigation';
import Router from 'next/router'; // Using the older router for events

const useUnsavedChangesWarning = (
  isDirty: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?'
) => {
  const pathname = usePathname();

  // Standard browser refresh/close tab warning
  useBeforeUnload(isDirty, message);

  // Handle Next.js client-side navigation
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (pathname !== url && isDirty) {
        if (!window.confirm(message)) {
          Router.events.emit('routeChangeError');
          // This is a bit of a hack to stop navigation
          throw 'Route change aborted to prevent data loss.';
        }
      }
    };

    Router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [isDirty, message, pathname]);
};

// This is a placeholder hook for the App Router as `next/navigation` events are not fully mature.
// We'll use a simplified version for now.
const useUnsavedChangesWarningAppRouter = (
  isDirty: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?'
) => {
    useBeforeUnload(isDirty, message);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (isDirty) {
                const target = e.target as HTMLElement;
                const link = target.closest('a');

                // Check if it's an internal navigation link that isn't a submit button
                if (link && link.href && link.target !== '_blank' && new URL(link.href).origin === window.location.origin) {
                     if (!window.confirm(message)) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            }
        };

        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [isDirty, message]);
};


export default useUnsavedChangesWarningAppRouter;
