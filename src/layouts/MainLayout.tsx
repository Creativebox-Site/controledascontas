import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ProfileMenu } from "@/components/ProfileMenu";
import { AppearanceCustomizer } from "@/components/AppearanceCustomizer";
import { CoverImage } from "@/components/CoverImage";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useCurrency } from "@/contexts/CurrencyContext";
import logoCreativeBox from "@/assets/logo-creative-box.png";

export const MainLayout = () => {
  const navigate = useNavigate();
  const { user, loading, currency, setCurrency } = useCurrency();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar se o email foi confirmado
  if (user && !user.email_confirmed_at) {
    return <EmailVerificationBanner email={user.email || ""} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Header fixo */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <img 
                    src={logoCreativeBox} 
                    alt="Creative Box" 
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                  <h1 className="text-base sm:text-xl font-bold truncate">App Contas</h1>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                <CurrencySelector
                  value={currency}
                  onChange={setCurrency}
                />
                <AppearanceCustomizer />
                <ProfileMenu />
              </div>
            </div>
          </header>

          {/* Imagem de capa */}
          <CoverImage userId={user?.id} />

          {/* Área de conteúdo - renderiza as páginas filhas */}
          <main className="flex-1 w-full px-4 sm:px-6 md:px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </SidebarProvider>
  );
};
