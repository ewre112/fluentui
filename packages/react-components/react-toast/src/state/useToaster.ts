import * as React from 'react';
import { Toaster } from './vanilla/toaster';
import { useForceUpdate } from '@fluentui/react-utilities';
import { Toast, ToastPosition, ToasterOptions } from './types';
import { ToasterProps } from '../components/Toaster';

export function useToaster<TElement extends HTMLElement>(options: ToasterProps = {}) {
  const forceRender = useForceUpdate();
  const toasterOptions = useToasterOptions(options);
  const toasterRef = React.useRef<TElement>(null);
  const [toaster] = React.useState(() => new Toaster());

  React.useEffect(() => {
    if (toasterRef.current) {
      toaster.connectToDOM(toasterRef.current, toasterOptions);
      toaster.onUpdate = forceRender;
    }

    return () => toaster.disconnect();
  }, [toaster, forceRender, toasterOptions]);

  const getToastsToRender = React.useCallback(
    <T>(cb: (position: ToastPosition, toasts: Toast[]) => T) => {
      if (!toaster) {
        return [];
      }

      const toRender = new Map<ToastPosition, Toast[]>();
      const toasts = Array.from(toaster.toasts.values());

      toasts.forEach(toast => {
        const { position } = toast;
        toRender.has(position) || toRender.set(position, []);
        toRender.get(position)!.push(toast);
      });

      return Array.from(toRender, ([position, toastsToRender]) => {
        if (position.startsWith('top')) {
          toastsToRender.reverse();
        }

        return cb(position, toastsToRender);
      });
    },
    [toaster],
  );

  return {
    toasterRef,
    isToastVisible: toaster.isToastVisible,
    getToastsToRender,
  };
}

function useToasterOptions(options: ToasterProps): Partial<ToasterOptions> {
  const { pauseOnHover, pauseOnWindowBlur, position, timeout, limit, toasterId } = options;

  return React.useMemo<Partial<ToasterOptions>>(
    () => ({
      pauseOnHover,
      pauseOnWindowBlur,
      position,
      timeout,
      limit,
      toasterId,
    }),
    [pauseOnHover, pauseOnWindowBlur, position, timeout, limit, toasterId],
  );
}
