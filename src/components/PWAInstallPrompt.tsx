import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ButtonPremium } from '@/components/ui/button-premium';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return;

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (iOS && !isInStandaloneMode) {
      setIsIOS(true);
      // Show iOS prompt after 1 second
      const timer = setTimeout(() => setShowPrompt(true), 1000);
      return () => clearTimeout(timer);
    }

    // Listen for install prompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 1 second
      setTimeout(() => setShowPrompt(true), 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Navigate to install page for detailed instructions
      setShowPrompt(false);
      navigate('/install');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-4">
      <Alert className="border-primary/50 bg-background/95 backdrop-blur-lg shadow-xl">
        <Download className="h-5 w-5 text-primary" />
        <AlertDescription className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <p className="font-semibold">Instale o App!</p>
            <p className="text-sm text-muted-foreground">
              {isIOS 
                ? 'Adicione à tela inicial para acesso rápido'
                : 'Instale o app para acesso rápido e experiência completa'}
            </p>
            <div className="flex gap-2">
              <ButtonPremium 
                onClick={handleInstallClick}
                size="sm"
                className="text-xs"
              >
                {isIOS ? 'Ver Como' : 'Instalar'}
              </ButtonPremium>
              <ButtonPremium 
                onClick={handleDismiss}
                variant="glass"
                size="sm"
                className="text-xs"
              >
                Agora Não
              </ButtonPremium>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
