import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CoverImage } from "@/components/CoverImage";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { Overview } from "@/pages/Overview";
import { Transactions } from "@/pages/Transactions";
import { Income } from "@/pages/Income";
import { Expenses } from "@/pages/Expenses";
import { Investments } from "@/pages/Investments";
import { Categories } from "@/pages/Categories";
import { Insights } from "@/pages/Insights";
import { Goals } from "@/pages/Goals";
import { Financing } from "@/pages/Financing";
import { Settings } from "@/pages/Settings";
import { Profile } from "@/pages/Profile";
import { PaymentItems } from "@/pages/PaymentItems";
import { PremiumComponentsDemo } from "@/components/demos/PremiumComponentsDemo";
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrency] = useState<string>("BRL");
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);
  const loadUserPreferences = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('profiles').select('preferred_currency').eq('id', user.id).single();
    if (data?.preferred_currency) {
      setPreferredCurrency(data.preferred_currency);
    }
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/auth");
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }

  // Verificar se o email foi confirmado
  if (user && !user.email_confirmed_at) {
    return <EmailVerificationBanner email={user.email || ""} />;
  }
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col w-full">
          
          
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-4 py-3">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <h1 className="text-base sm:text-xl font-bold truncate">Controle Financeiro</h1>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                <CurrencySelector value={preferredCurrency} onChange={setPreferredCurrency} userId={user?.id} />
                <ThemeToggle />
                <ProfileMenu userId={user?.id} />
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 bg-gradient-to-br from-background via-primary/5 to-accent/5">
            <Routes>
              <Route index element={<Overview userId={user?.id} currency={preferredCurrency} />} />
              <Route path="income" element={<Income userId={user?.id} currency={preferredCurrency} />} />
              <Route path="expenses" element={<Expenses userId={user?.id} currency={preferredCurrency} />} />
              <Route path="transactions" element={<Transactions userId={user?.id} currency={preferredCurrency} />} />
              <Route path="investments" element={<Investments userId={user?.id} currency={preferredCurrency} />} />
              <Route path="goals" element={<Goals userId={user?.id} currency={preferredCurrency} />} />
              <Route path="insights" element={<Insights userId={user?.id} currency={preferredCurrency} />} />
              <Route path="payment-items" element={<PaymentItems userId={user?.id} currency={preferredCurrency} />} />
              <Route path="categories" element={<Categories userId={user?.id} />} />
              <Route path="financing" element={<Financing currency={preferredCurrency} />} />
              <Route path="profile" element={<Profile userId={user?.id} />} />
              <Route path="settings" element={<Settings userId={user?.id} />} />
              <Route path="premium-demo" element={<PremiumComponentsDemo />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>;
};
export default Dashboard;