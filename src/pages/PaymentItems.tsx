import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { PaymentItemForm } from "@/components/PaymentItemForm";
import { PaymentItemsList } from "@/components/PaymentItemsList";

interface PaymentItemsProps {
  userId?: string;
  currency: string;
}

export const PaymentItems = ({ userId, currency }: PaymentItemsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Contas a Pagar</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie pagamentos futuros com lembretes automáticos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Pagamento
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Pagamento</DialogTitle>
          </DialogHeader>
          <PaymentItemForm
            userId={userId}
            currency={currency}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setRefreshKey((k) => k + 1);
              setShowForm(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <PaymentItemsList userId={userId} currency={currency} refreshKey={refreshKey} />
    </div>
  );
};
