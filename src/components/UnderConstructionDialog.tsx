import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface UnderConstructionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UnderConstructionDialog = ({ open, onOpenChange }: UnderConstructionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-warning" />
            Em Construção
          </DialogTitle>
          <DialogDescription className="pt-4">
            Esta funcionalidade está em desenvolvimento e estará disponível em breve.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
