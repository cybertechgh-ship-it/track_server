import { useCallback } from 'react';
import { useSnackbar, type SnackbarKey, type VariantType } from 'notistack';

interface ToastOptions {
  message: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

export function useToast() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const toast = useCallback(
    (variant: VariantType, options: ToastOptions) => {
      return enqueueSnackbar(options.message, {
        variant,
        autoHideDuration: options.duration ?? 5000,
        anchorOrigin: variant === 'error'
          ? { vertical: 'bottom', horizontal: 'right' }
          : { vertical: 'top', horizontal: 'right' },
        action: options.action ?? (
          <button
            onClick={() => closeSnackbar()}
            style={{
              background: 'none', border: 'none', color: 'inherit',
              cursor: 'pointer', padding: 4, fontSize: 16, opacity: 0.7,
            }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        ),
      });
    },
    [enqueueSnackbar, closeSnackbar],
  );

  return {
    success: (msg: string, opts?: Partial<ToastOptions>) =>
      toast('success', { message: msg, ...opts }),
    error: (msg: string, opts?: Partial<ToastOptions>) =>
      toast('error', { message: msg, ...opts }),
    warning: (msg: string, opts?: Partial<ToastOptions>) =>
      toast('warning', { message: msg, ...opts }),
    info: (msg: string, opts?: Partial<ToastOptions>) =>
      toast('info', { message: msg, ...opts }),
    default: (msg: string, opts?: Partial<ToastOptions>) =>
      toast('default', { message: msg, ...opts }),
    close: (key?: SnackbarKey) => closeSnackbar(key),
  };
}
