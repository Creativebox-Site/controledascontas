import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Category {
  id: string;
  name: string;
  is_essential: boolean;
}

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  categories: Category[];
  onSave: (updates: any) => void;
  type?: "transaction" | "investment";
}

export const BulkEditDialog = ({
  open,
  onOpenChange,
  selectedCount,
  categories,
  onSave,
  type = "transaction"
}: BulkEditDialogProps) => {
  const [updateFields, setUpdateFields] = useState({
    category_id: false,
    is_essential: false,
    description: false,
    amount: false,
    date: false,
  });

  const [formData, setFormData] = useState({
    category_id: "",
    is_essential: false,
    description: "",
    amount: "",
    date: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: any = {};
    
    if (updateFields.category_id && formData.category_id) {
      updates.category_id = formData.category_id;
    }
    
    if (updateFields.is_essential && type === "transaction") {
      updates.is_essential = formData.is_essential;
    }
    
    if (updateFields.description && formData.description) {
      updates.description = formData.description;
    }
    
    if (updateFields.amount && formData.amount) {
      updates.amount = parseFloat(formData.amount);
    }
    
    if (updateFields.date && formData.date) {
      updates.date = formData.date;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    onSave(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar {selectedCount} {type === "investment" ? "investimento" : "transação"}(ões) em massa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Selecione os campos que deseja atualizar para todos os itens selecionados:
          </p>

          <div className="space-y-3">
            {/* Categoria */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={updateFields.category_id}
                onChange={(e) =>
                  setUpdateFields({ ...updateFields, category_id: e.target.checked })
                }
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                  disabled={!updateFields.category_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Essencial - apenas para transactions */}
            {type === "transaction" && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={updateFields.is_essential}
                  onChange={(e) =>
                    setUpdateFields({ ...updateFields, is_essential: e.target.checked })
                  }
                  className="mt-2"
                />
                <div className="flex-1 space-y-2">
                  <Label>Esta despesa é essencial?</Label>
                  <RadioGroup
                    value={formData.is_essential ? "true" : "false"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, is_essential: value === "true" })
                    }
                    disabled={!updateFields.is_essential}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="bulk-essential-yes" />
                      <Label htmlFor="bulk-essential-yes" className="cursor-pointer">
                        ✅ Sim, é essencial
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="bulk-essential-no" />
                      <Label htmlFor="bulk-essential-no" className="cursor-pointer">
                        ❌ Não, não é essencial
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Descrição */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={updateFields.description}
                onChange={(e) =>
                  setUpdateFields({ ...updateFields, description: e.target.checked })
                }
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nova descrição"
                  disabled={!updateFields.description}
                />
              </div>
            </div>

            {/* Valor */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={updateFields.amount}
                onChange={(e) =>
                  setUpdateFields({ ...updateFields, amount: e.target.checked })
                }
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Novo valor"
                  disabled={!updateFields.amount}
                />
              </div>
            </div>

            {/* Data */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={updateFields.date}
                onChange={(e) =>
                  setUpdateFields({ ...updateFields, date: e.target.checked })
                }
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  disabled={!updateFields.date}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Atualizar {selectedCount} {type === "investment" ? "investimento" : "transação"}(ões)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
