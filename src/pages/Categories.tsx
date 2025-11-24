import { useEffect, useState } from "react";
import { CategoriesManager } from "@/components/CategoriesManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CategoriesProps {
  userId?: string;
}

export const Categories = ({ userId }: CategoriesProps) => {
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(userId);

  useEffect(() => {
    const initializeCategories = async () => {
      console.log("🎬 Categories.tsx initializeCategories iniciado:", { 
        propUserId: userId, 
        resolvedUserId 
      });
      
      let userIdToUse = userId;
      
      // Auth Fallback: If userId not provided, get current user
      if (!userIdToUse) {
        console.log("🔍 Buscando usuário autenticado da sessão...");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("✅ Usuário encontrado na sessão:", user.id);
          userIdToUse = user.id;
          setResolvedUserId(user.id);
        } else {
          console.warn("⚠️ Nenhum usuário autenticado encontrado");
          toast.error("Erro: usuário não autenticado");
        }
      } else {
        console.log("✅ userId recebido via props:", userId);
        setResolvedUserId(userId);
      }

      // Only proceed if we have a userId
      if (!userIdToUse) {
        console.error("❌ Não foi possível obter userId - abortando inicialização");
        return;
      }
        
      console.log("🔄 Verificando categorias existentes para userId:", userIdToUse);
      
      // IMPORTANTE: Usar o MESMO userId para verificação e criação
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userIdToUse)
        .limit(1);

      console.log("📊 Resultado verificação categorias:", { 
        userId: userIdToUse,
        data, 
        error, 
        hasCategories: data && data.length > 0 
      });

      // If no categories, create default ones (usando o MESMO userId)
      if (!error && (!data || data.length === 0)) {
        console.log("🚀 Criando categorias padrão para userId:", userIdToUse);
        
        const { error: createError } = await supabase.rpc('create_default_categories', {
          p_user_id: userIdToUse
        });

        if (createError) {
          console.error('❌ Erro ao criar categorias padrão:', createError);
          toast.error('Erro ao criar categorias padrão: ' + createError.message);
        } else {
          console.log('✅ Categorias padrão criadas com sucesso para userId:', userIdToUse);
          toast.success('Categorias padrão criadas!');
        }
      } else if (data && data.length > 0) {
        console.log("✅ Usuário já possui categorias");
      }
    };

    initializeCategories();
  }, [userId]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Categorias</h2>
      <CategoriesManager userId={resolvedUserId} />
    </div>
  );
};
