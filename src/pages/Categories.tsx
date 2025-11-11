import { CategoriesManager } from "@/components/CategoriesManager";

interface CategoriesProps {
  userId?: string;
}

export const Categories = ({ userId }: CategoriesProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Categorias</h2>
      <CategoriesManager userId={userId} />
    </div>
  );
};
