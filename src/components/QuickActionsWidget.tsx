import React, { useState } from "react";
import { Plus, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { ButtonPremium } from "@/components/ui/button-premium";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export const QuickActionsWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <ButtonPremium
            variant="primary"
            size="lg"
            effect="strong"
            className="h-14 w-14 rounded-full shadow-glow-primary"
          >
            <Plus className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
          </ButtonPremium>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background">
          <DropdownMenuItem 
            onClick={() => navigate("/dashboard/income")}
            className="cursor-pointer py-3"
          >
            <TrendingUp className="mr-2 h-5 w-5 text-success" />
            <span className="font-medium">Adicionar Receita</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate("/dashboard/expenses")}
            className="cursor-pointer py-3"
          >
            <TrendingDown className="mr-2 h-5 w-5 text-destructive" />
            <span className="font-medium">Adicionar Despesa</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate("/dashboard/investments")}
            className="cursor-pointer py-3"
          >
            <PiggyBank className="mr-2 h-5 w-5 text-primary" />
            <span className="font-medium">Investir Agora</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
