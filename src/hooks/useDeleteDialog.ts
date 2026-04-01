import { useState, useCallback } from "react";

/**
 * Manages delete confirmation dialog state.
 * Handles opening/closing dialog and tracking which item is selected for deletion.
 *
 * @template T - The ID type of items being deleted (usually string)
 */
export function useDeleteDialog<T = string>() {
  const [isOpen, setIsOpen] = useState(false);
  const [itemId, setItemId] = useState<T | null>(null);

  const open = useCallback((id: T) => {
    setItemId(id);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItemId(null);
  }, []);

  const confirm = useCallback((callback: (id: T) => void | Promise<void>) => {
    if (itemId !== null) {
      return callback(itemId);
    }
  }, [itemId]);

  return {
    isOpen,
    itemId,
    open,
    close,
    confirm,
  };
}
