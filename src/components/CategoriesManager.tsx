import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Upload } from "lucide-react";
import { BulkImport } from "@/components/BulkImport";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  parent_id: string | null;
}

interface CategoriesManagerProps {
  userId?: string;
}

export const CategoriesManager = ({ userId }: CategoriesManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterParentId, setFilterParentId] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: "#10b981",
    parent_id: null as string | null,
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
      .order("parent_id", { ascending: true, nullsFirst: true })
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
        .update({
          name: formData.name,
          type: formData.type,
          color: formData.color,
          parent_id: formData.parent_id,
        })
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
          name: formData.name,
          type: formData.type,
          color: formData.color,
          parent_id: formData.parent_id,
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
      color: "#10b981",
      parent_id: null,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || "#10b981",
      parent_id: category.parent_id,
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
      color: row.cor || "#10b981",
    }));

    const { error } = await supabase
      .from("categories")
      .insert(categoriesToInsert);

    if (error) {
      toast.error("Erro ao importar categorias");
      throw error;
    } else {
      toast.success(`${data.length} categorias importadas!`);
      loadCategories();
    }
  };

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  // Aplicar filtros
  const filteredParentCategories = parentCategories.filter((c) => {
    if (filterType !== "all" && c.type !== filterType) return false;
    if (filterParentId !== "all" && c.id !== filterParentId) return false;
    return true;
  });

  const expenseCategories = filteredParentCategories.filter((c) => c.type === "expense");
  const incomeCategories = filteredParentCategories.filter((c) => c.type === "income");
  const investmentCategories = filteredParentCategories.filter((c) => c.type === "investment");

  // Categorias disponíveis para o filtro de categoria (baseado no tipo selecionado)
  const availableParentCategories = filterType === "all" 
    ? parentCategories 
    : parentCategories.filter(c => c.type === filterType);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Categoria</Label>
              <Select value={filterType} onValueChange={(value) => {
                setFilterType(value);
                setFilterParentId("all"); // Reset categoria ao mudar tipo
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">Todas</Badge>
                      <span className="text-muted-foreground">({parentCategories.length})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="font-normal">Despesas</Badge>
                      <span className="text-muted-foreground">({parentCategories.filter(c => c.type === "expense").length})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-success font-normal">Receitas</Badge>
                      <span className="text-muted-foreground">({parentCategories.filter(c => c.type === "income").length})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="investment">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">Investimentos</Badge>
                      <span className="text-muted-foreground">({parentCategories.filter(c => c.type === "investment").length})</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria Específica</Label>
              <Select value={filterParentId} onValueChange={setFilterParentId} disabled={filterType === "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todas as categorias
                  </SelectItem>
                  {availableParentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                        <Badge variant="outline" className="ml-auto">
                          {getSubcategories(category.id).length}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filterType !== "all" || filterParentId !== "all") && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary">
                {filterType !== "all" && (
                  <span>
                    {filterType === "expense" ? "Despesas" : filterType === "income" ? "Receitas" : "Investimentos"}
                  </span>
                )}
                {filterType !== "all" && filterParentId !== "all" && " • "}
                {filterParentId !== "all" && (
                  <span>{availableParentCategories.find(c => c.id === filterParentId)?.name}</span>
                )}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setFilterParentId("all");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button onClick={() => setShowForm(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
        <Button onClick={() => setShowBulkImport(true)} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar em Lote
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome da categoria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value, parent_id: null })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Categoria Pai (Opcional)</Label>
              <Select
                value={formData.parent_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma (Categoria Principal)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (Categoria Principal)</SelectItem>
                  {parentCategories
                    .filter((c) => c.type === formData.type && c.id !== editingId)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#10b981"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <BulkImport
            type="categories"
            onImport={handleBulkImport}
            onClose={() => setShowBulkImport(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Despesas
              <Badge variant="secondary">{expenseCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((category) => {
                const subcategories = getSubcategories(category.id);
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                        {subcategories.length > 0 && (
                          <Badge variant="secondary">{subcategories.length}</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {subcategories.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-2 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: sub.color }}
                              />
                              <span className="text-sm">{sub.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(sub)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(sub.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Receitas
              <Badge variant="secondary">{incomeCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomeCategories.map((category) => {
                const subcategories = getSubcategories(category.id);
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                        {subcategories.length > 0 && (
                          <Badge variant="secondary">{subcategories.length}</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {subcategories.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-2 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: sub.color }}
                              />
                              <span className="text-sm">{sub.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(sub)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(sub.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Investimentos
              <Badge variant="secondary">{investmentCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investmentCategories.map((category) => {
                const subcategories = getSubcategories(category.id);
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                        {subcategories.length > 0 && (
                          <Badge variant="secondary">{subcategories.length}</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {subcategories.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-2 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: sub.color }}
                              />
                              <span className="text-sm">{sub.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(sub)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(sub.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};