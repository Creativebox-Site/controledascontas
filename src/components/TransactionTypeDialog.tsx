import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TransactionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionTypeDialog = ({ open, onOpenChange }: TransactionTypeDialogProps) => {
  const navigate = useNavigate();

  const handleSelect = (type: "income" | "expense") => {
    onOpenChange(false);
    if (type === "income") {
      navigate("/dashboard/income");
    } else {
      navigate("/dashboard/expenses");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Selecione o tipo de transação que deseja lançar</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3 border-2 border-success hover:bg-success hover:text-success-foreground"
            onClick={() => handleSelect("income")}
          >
            <TrendingUp className="h-10 w-10 text-success" />
            <span className="text-lg font-semibold">Receita</span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3 border-2 border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleSelect("expense")}
          >
            <TrendingDown className="h-10 w-10 text-destructive" />
            <span className="text-lg font-semibold">Despesa</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
