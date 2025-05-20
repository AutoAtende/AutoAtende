import { useRef, useCallback } from 'react';

const useDebounced = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debounced = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debounced;
};

export default useDebounced;