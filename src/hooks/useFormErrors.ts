import { useState, useCallback } from "react";

/**
 * Manages form field validation errors as a keyed map.
 * Simplifies patterns where multiple individual error states exist.
 *
 * @template ErrorKeys - Union of valid field names with errors
 */
export function useFormErrors<T extends Record<string, any>>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const setError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setErrors_ = useCallback((updates: Partial<Record<keyof T, string>>) => {
    setErrors((prev) => ({ ...prev, ...updates }));
  }, []);

  const getError = useCallback((field: keyof T): string | undefined => {
    return errors[field];
  }, [errors]);

  const hasError = useCallback(
    (field?: keyof T): boolean => {
      if (field) {
        return !!errors[field];
      }
      return Object.keys(errors).length > 0;
    },
    [errors]
  );

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    setErrors: setErrors_,
    getError,
    hasError,
  };
}
