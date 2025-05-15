import { useState, useCallback } from "react";
import { toast } from "../../helpers/toast";

export function useLocalStorage(key, initialValue) {
	
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      toast.error(error.message || "Failed to retrieve item from localStorage.");
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = typeof value === "function" ? value(storedValue) : value;

        setStoredValue(valueToStore);

        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        toast.error(error.message || "Failed to save item to localStorage.");
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
