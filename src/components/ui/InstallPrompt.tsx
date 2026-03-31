import { useState } from "react";
import { Download, Share, PlusSquare, X, CheckCircle2 } from "lucide-react";
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instalar Fauna Data</h3>
              <p className="text-gray-500 text-sm">
                Siga os 3 passos abaixo para instalar o aplicativo direto no seu celular — sem precisar da App Store.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 space-y-5 border border-gray-100">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 shrink-0">
                  <Share className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Passo 1 — Toque em Compartilhar</p>
                  <p className="text-sm text-gray-600">
                    Na parte de baixo da tela do Safari, toque no ícone de <strong>quadrado com uma seta para cima</strong> (botão Compartilhar). Ele fica na barra de ferramentas do navegador.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 shrink-0">
                  <PlusSquare className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Passo 2 — Adicionar à Tela de Início</p>
                  <p className="text-sm text-gray-600">
                    No menu que abrir, role a lista de opções para baixo até encontrar <strong>"Adicionar à Tela de Início"</strong> e toque nessa opção.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Passo 3 — Confirmar</p>
                  <p className="text-sm text-gray-600">
                    Uma tela de confirmação vai aparecer com o nome do aplicativo. Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto! O ícone do app aparecerá na sua tela inicial.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4 px-2">
              Após instalado, o aplicativo funciona mesmo sem conexão com a internet.
            </p>
            
            <Button 
              onClick={() => setShowIosInstructions(false)}
              variant="secondary"
              className="w-full mt-4"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}