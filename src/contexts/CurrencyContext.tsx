import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<string>("BRL");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Não redirecionar em rotas públicas
      const publicRoutes = ['/auth', '/install'];
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (!session && !isPublicRoute) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Não redirecionar em rotas públicas
      const publicRoutes = ['/auth', '/install'];
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (!session && !isPublicRoute) {
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
    const { data } = await supabase
      .from('profiles')
      .select('preferred_currency')
      .eq('id', user.id)
      .single();

    if (data?.preferred_currency) {
      setCurrency(data.preferred_currency);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, user, session, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
