import { useEffect, useState } from "react";
import { CategoriesManager } from "@/components/CategoriesManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CategoriesProps {
  userId?: string;
}

export const Categories = ({ userId }: CategoriesProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);

  useEffect(() => {
    const initializeCategories = async () => {
      let userIdToUse = userId;
      
      // If userId not provided, get current user
      if (!userIdToUse) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userIdToUse = user.id;
          setCurrentUserId(user.id);
        }
      } else {
        setCurrentUserId(userId);
      }

      // Only proceed if we have a userId
      if (!userIdToUse) return;
        
      // Check if user has categories
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userIdToUse)
        .limit(1);

      // If no categories, create default ones
      if (!error && (!data || data.length === 0)) {
        const { error: createError } = await supabase.rpc('create_default_categories', {
          p_user_id: userIdToUse
        });

        if (createError) {
          console.error('Error creating default categories:', createError);
          toast.error('Erro ao criar categorias padrão');
        } else {
          toast.success('Categorias padrão criadas!');
        }
      }
    };

    initializeCategories();
  }, [userId, currentUserId]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Categorias</h2>
      <CategoriesManager userId={currentUserId} />
    </div>
  );
};
