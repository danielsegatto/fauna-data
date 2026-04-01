import { useState, useCallback } from "react";

/**
 * Generic form state management hook.
 * Handles initial form state, field updates, and loading state.
 *
 * @template T - The shape of the form data
 * @param initialForm - Initial form state
 */
export function useForm<T extends Record<string, any>>(initialForm: T) {
  const [form, setForm] = useState<T>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateForm = useCallback((updater: Partial<T> | ((prev: T) => T)) => {
    setForm((prev) => {
      if (typeof updater === "function") {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  }, []);

  const resetForm = useCallback((nextForm: T = initialForm) => {
    setForm(nextForm);
  }, [initialForm]);

  return {
    form,
    isSaving,
    setField,
    updateForm,
    resetForm,
    setIsSaving,
  };
}
