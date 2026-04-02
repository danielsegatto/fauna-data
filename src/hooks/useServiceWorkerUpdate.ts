import { useCallback, useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

type UpdateListener = (available: boolean) => void;

const updateListeners = new Set<UpdateListener>();
let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | null = null;
let isInitialized = false;
let isUpdateAvailable = false;

const notifyListeners = () => {
  updateListeners.forEach((listener) => listener(isUpdateAvailable));
};

const markUpdateAvailable = () => {
  if (isUpdateAvailable) return;
  isUpdateAvailable = true;
  notifyListeners();
};

const markUpdateDismissed = () => {
  if (!isUpdateAvailable) return;
  isUpdateAvailable = false;
  notifyListeners();
};

const initializeServiceWorkerUpdates = () => {
  if (isInitialized || typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  isInitialized = true;

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      markUpdateAvailable();
    },
  });

  // Helps iOS/home-screen contexts where update checks are less predictable.
  const checkForUpdates = () => {
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.update())
      .catch(() => {
        // Ignore update check failures; SW can still update on next navigation.
      });
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkForUpdates();
    }
  });

  window.setInterval(checkForUpdates, 30 * 60 * 1000);
};

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(isUpdateAvailable);

  useEffect(() => {
    initializeServiceWorkerUpdates();

    const listener: UpdateListener = (available) => {
      setUpdateAvailable(available);
    };

    updateListeners.add(listener);
    return () => {
      updateListeners.delete(listener);
    };
  }, []);

  const dismissUpdate = useCallback(() => {
    markUpdateDismissed();
  }, []);

  const reloadToUpdate = useCallback(async () => {
    try {
      if (updateServiceWorker) {
        await updateServiceWorker(true);
        return;
      }
    } catch {
      // Fall back to a hard reload when update activation fails.
    }

    window.location.reload();
  }, []);

  return {
    isUpdateAvailable: updateAvailable,
    dismissUpdate,
    reloadToUpdate,
  };
}
