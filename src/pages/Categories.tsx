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
      if (userId) {
        setCurrentUserId(userId);
        
        // Check if user has categories
        const { data, error } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        // If no categories, create default ones
        if (!error && (!data || data.length === 0)) {
          const { error: createError } = await supabase.rpc('create_default_categories', {
            p_user_id: userId
          });

          if (createError) {
            console.error('Error creating default categories:', createError);
            toast.error('Erro ao criar categorias padrão');
          } else {
            toast.success('Categorias padrão criadas!');
          }
        }
      } else {
        // Fallback: get current user if userId not provided
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      }
    };

    initializeCategories();
  }, [userId]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Categorias</h2>
      <CategoriesManager userId={currentUserId} />
    </div>
  );
};
