import { useState, useEffect } from "react";

// Standard TypeScript interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function useInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect if the device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 2. Detect if the app is already running in standalone mode (installed)
    const checkIsInstalled = () => {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator && (window.navigator as any).standalone === true)
      ) {
        setIsInstalled(true);
      }
    };
    checkIsInstalled();

    // 3. Capture install prompt availability for optional custom UI
    const handleBeforeInstallPrompt = (e: Event) => {
      // Stash the event so it can be triggered later via the custom button.
      // We intentionally do not call preventDefault so the browser can still
      // show its native install banner when appropriate.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    // 4. Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPromptEvent) return;
    
    // Show the installation prompt
    await installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === "accepted") {
      setInstallPromptEvent(null);
    }
  };

  return { installPromptEvent, isInstalled, isIOS, promptInstall };
}