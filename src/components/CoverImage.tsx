import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CoverImageProps {
  userId?: string;
}

const coverGradients = [
  { id: "gradient-1", name: "Azul Oceano", class: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" },
  { id: "gradient-2", name: "Verde Floresta", class: "bg-gradient-to-r from-green-500 via-green-600 to-emerald-600" },
  { id: "gradient-3", name: "Roxo Noturno", class: "bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600" },
  { id: "gradient-4", name: "Laranja Sunset", class: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" },
  { id: "gradient-5", name: "Cinza Profissional", class: "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800" },
];

export const CoverImage = ({ userId }: CoverImageProps) => {
  const [open, setOpen] = useState(false);
  const [coverImage, setCoverImage] = useState("gradient-1");

  useEffect(() => {
    if (userId) {
      loadCover();
    }
  }, [userId]);

  const loadCover = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("cover_image")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao carregar capa:", error);
      return;
    }

    if (data?.cover_image) {
      setCoverImage(data.cover_image);
    }
  };

  const handleSelectCover = async (gradientId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ cover_image: gradientId })
      .eq("id", userId);

    if (error) {
      toast.error("Erro ao salvar capa");
      return;
    }

    setCoverImage(gradientId);
    toast.success("Capa atualizada!");
    setOpen(false);
  };

  const currentGradient = coverGradients.find((g) => g.id === coverImage) || coverGradients[0];

  return (
    <>
      <div className={`relative h-32 w-full ${currentGradient.class}`}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <Image className="w-4 h-4 mr-2" />
              Alterar Capa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Escolha uma Capa</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {coverGradients.map((gradient) => (
                <button
                  key={gradient.id}
                  onClick={() => handleSelectCover(gradient.id)}
                  className={`relative h-32 rounded-lg ${gradient.class} hover:opacity-80 transition-opacity ${
                    coverImage === gradient.id ? "ring-4 ring-primary" : ""
                  }`}
                >
                  <span className="absolute bottom-2 left-2 text-white font-medium text-sm bg-black/30 px-2 py-1 rounded">
                    {gradient.name}
                  </span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
