import { useEffect, useState } from 'react';
import { Download, Smartphone, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ButtonPremium } from '@/components/ui/button-premium';
import { CardGlass, CardGlassContent, CardGlassHeader, CardGlassTitle } from '@/components/ui/card-glass';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIOS && !isInStandaloneMode) {
      setShowIOSInstructions(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <ResponsiveContainer maxWidth="lg" className="py-8 md:py-12">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-sm">
                <Smartphone className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Instale o App no seu Dispositivo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tenha acesso rápido ao Controle Financeiro direto da tela inicial do seu celular
            </p>
          </div>

          {/* Installation Status */}
          {isInstalled ? (
            <Alert className="border-success/50 bg-success/10">
              <Check className="h-5 w-5 text-success" />
              <AlertDescription className="text-success-foreground">
                <strong>App já instalado!</strong> Você pode acessá-lo pela tela inicial do seu dispositivo.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* Chrome/Android Installation */}
              {deferredPrompt && !showIOSInstructions && (
                <CardGlass>
                  <CardGlassHeader>
                    <CardGlassTitle>Instalação Rápida</CardGlassTitle>
                  </CardGlassHeader>
                  <CardGlassContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Clique no botão abaixo para instalar o app em um clique!
                    </p>
                    <ButtonPremium 
                      onClick={handleInstallClick}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Instalar Agora
                    </ButtonPremium>
                  </CardGlassContent>
                </CardGlass>
              )}

              {/* iOS Safari Instructions */}
              {showIOSInstructions && (
                <CardGlass>
                  <CardGlassHeader>
                    <CardGlassTitle>Instruções para iOS (Safari)</CardGlassTitle>
                  </CardGlassHeader>
                  <CardGlassContent className="space-y-4">
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                      <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra inferior</li>
                      <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                      <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
                      <li>O app aparecerá na sua tela inicial!</li>
                    </ol>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-center">
                        📱 Certifique-se de estar usando o <strong>Safari</strong> para instalar
                      </p>
                    </div>
                  </CardGlassContent>
                </CardGlass>
              )}

              {/* Chrome Desktop/Android Instructions */}
              {!deferredPrompt && !showIOSInstructions && (
                <CardGlass>
                  <CardGlassHeader>
                    <CardGlassTitle>Instruções para Chrome (Android/Desktop)</CardGlassTitle>
                  </CardGlassHeader>
                  <CardGlassContent className="space-y-4">
                    <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                      <li>Toque no menu <strong>⋮</strong> (três pontos) no canto superior direito</li>
                      <li>Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                      <li>Confirme tocando em <strong>"Instalar"</strong></li>
                      <li>O app estará disponível na sua tela inicial!</li>
                    </ol>
                  </CardGlassContent>
                </CardGlass>
              )}
            </div>
          )}

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4">
            <CardGlass className="text-center">
              <CardGlassContent className="space-y-3 p-6">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-success/10">
                    <Check className="h-6 w-6 text-success" />
                  </div>
                </div>
                <h3 className="font-semibold">Acesso Rápido</h3>
                <p className="text-sm text-muted-foreground">
                  Abra direto da tela inicial, sem precisar buscar no navegador
                </p>
              </CardGlassContent>
            </CardGlass>

            <CardGlass className="text-center">
              <CardGlassContent className="space-y-3 p-6">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold">Experiência Nativa</h3>
                <p className="text-sm text-muted-foreground">
                  Interface otimizada que funciona como um app nativo
                </p>
              </CardGlassContent>
            </CardGlass>

            <CardGlass className="text-center">
              <CardGlassContent className="space-y-3 p-6">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Download className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold">Funciona Offline</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse seus dados mesmo sem conexão com a internet
                </p>
              </CardGlassContent>
            </CardGlass>
          </div>

          {/* Back Button */}
          <div className="text-center space-y-2">
            <ButtonPremium 
              variant="glass" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </ButtonPremium>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
