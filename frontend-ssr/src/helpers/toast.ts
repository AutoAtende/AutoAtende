import { enqueueSnackbar, SnackbarMessage, OptionsObject } from 'notistack';

interface ToastHelpers {
  success: (message: SnackbarMessage, options?: OptionsObject) => void;
  error: (message: SnackbarMessage, options?: OptionsObject) => void;
  warning: (message: SnackbarMessage, options?: OptionsObject) => void;
  info: (message: SnackbarMessage, options?: OptionsObject) => void;
}

export const toast: ToastHelpers = {
  success: (message: SnackbarMessage, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'success', ...options });
  },
  error: (message: SnackbarMessage, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'error', ...options });
  },
  warning: (message: SnackbarMessage, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'warning', ...options });
  },
  info: (message: SnackbarMessage, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'info', ...options });
  },
};