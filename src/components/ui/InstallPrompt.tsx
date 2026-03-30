import { useState } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/Button";

export function InstallPrompt() {
  const { installPromptEvent, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (!isIOS && !installPromptEvent) {
    return null;
  }

  return (
    <>
      <Button
        onClick={isIOS ? () => setShowIosInstructions(true) : promptInstall}
        size="lg"
        className="w-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
        icon={<Download className="w-5 h-5" />}
      >
        Instalar aplicativo
      </Button>

      {showIosInstructions && isIOS && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative animate-in slide-in-from-bottom-8 duration-300">
            <button
              onClick={() => setShowIosInstructions(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Install Fauna Data</h3>
              <p className="text-gray-600 text-sm">
                Install this application on your home screen for quick access and offline field use.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 space-y-5 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200">
                  <Share className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-gray-700">
                  1. Tap the <strong>Share</strong> button in the Safari menu bar.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200">
                  <PlusSquare className="w-6 h-6 text-gray-700" />
                </div>
                <p className="text-sm text-gray-700">
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowIosInstructions(false)}
              variant="secondary"
              className="w-full mt-6"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}