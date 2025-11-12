import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Upload } from "lucide-react";
import { BulkImport } from "@/components/BulkImport";

interface Category {
  id: string;
  name: string;
  type: string;
  is_essential: boolean;
  color: string;
}

interface CategoriesManagerProps {
  userId?: string;
}

export const CategoriesManager = ({ userId }: CategoriesManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    is_essential: false,
    color: "#10b981",
  });

  useEffect(() => {
    if (userId) {
      loadCategories();
    }
  }, [userId]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("type", { ascending: false })
      .order("name");

    if (error) {
      toast.error("Erro ao carregar categorias");
      return;
    }

    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Digite o nome da categoria");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("categories")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast.error("Erro ao atualizar categoria");
      } else {
        toast.success("Categoria atualizada!");
        resetForm();
        loadCategories();
      }
    } else {
      const { error } = await supabase.from("categories").insert([
        {
          ...formData,
          user_id: userId,
        },
      ]);

      if (error) {
        toast.error("Erro ao criar categoria");
      } else {
        toast.success("Categoria criada!");
        resetForm();
        loadCategories();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "expense",
      is_essential: false,
      color: "#10b981",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type,
      is_essential: category.is_essential,
      color: category.color || "#10b981",
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir categoria");
    } else {
      toast.success("Categoria excluída!");
      loadCategories();
    }
  };

  const handleBulkImport = async (data: any[]) => {
    if (!userId) return;

    const categoriesToInsert = data.map(row => ({
      user_id: userId,
      name: row.nome,
      type: row.tipo === "receita" ? "income" : "expense",
      is_essential: row.essencial,
      color: row.cor || "#6b7280"
    }));

    const { error } = await supabase
      .from("categories")
      .insert(categoriesToInsert);

    if (error) {
      throw error;
    }

    loadCategories();
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const investmentCategories = categories.filter((c) => c.type === "investment");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkImport(!showBulkImport)}>
            <Upload className="w-4 h-4 mr-2" />
            Inserir Dados em Lote
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {showBulkImport && (
        <BulkImport
          type="categories"
          onImport={handleBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Alimentação"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Essencial</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_essential}
                      onChange={(e) =>
                        setFormData({ ...formData, is_essential: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <label className="text-sm">Despesa essencial</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-success">Receitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma categoria de receita
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Despesas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{category.name}</span>
                    {category.is_essential && (
                      <span className="text-xs text-muted-foreground">Essencial</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma categoria de despesa
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Investimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {investmentCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {investmentCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma categoria de investimento
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};