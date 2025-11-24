import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CoverImageCropper } from "./CoverImageCropper";
import coverFinance1 from "@/assets/cover-finance-1.jpg";
import coverFinance2 from "@/assets/cover-finance-2.jpg";
import coverFinance3 from "@/assets/cover-finance-3.jpg";
import coverFinance4 from "@/assets/cover-finance-4.jpg";

interface CoverImageProps {
  userId?: string;
}

const coverGradients = [
  { id: "gradient-1", name: "Azul Oceano", class: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" },
  { id: "gradient-2", name: "Verde Floresta", class: "bg-gradient-to-r from-green-500 via-green-600 to-emerald-600" },
  { id: "gradient-3", name: "Roxo Noturno", class: "bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600" },
  { id: "gradient-4", name: "Laranja Sunset", class: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" },
  { id: "gradient-5", name: "Cinza Profissional", class: "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800" },
  { id: "gradient-6", name: "Turquesa Tropical", class: "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" },
  { id: "gradient-7", name: "Rosa Moderno", class: "bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" },
  { id: "gradient-8", name: "Dourado Luxo", class: "bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600" },
];

const coverImages = [
  { id: "image-1", name: "Gráficos Financeiros", url: coverFinance1 },
  { id: "image-2", name: "Crescimento", url: coverFinance2 },
  { id: "image-3", name: "Poupança", url: coverFinance3 },
  { id: "image-4", name: "Investimentos", url: coverFinance4 },
];

export const CoverImage = ({ userId }: CoverImageProps) => {
  const [open, setOpen] = useState(false);
  const [coverImage, setCoverImage] = useState("gradient-1");
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(userId);

  // Auth Fallback: Resolve userId from session if not provided
  useEffect(() => {
    const resolveUserId = async () => {
      if (userId) {
        setResolvedUserId(userId);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setResolvedUserId(user.id);
      }
    };

    resolveUserId();
  }, [userId]);

  useEffect(() => {
    if (resolvedUserId) {
      loadCover();
    }
  }, [resolvedUserId]);

  const loadCover = async () => {
    if (!resolvedUserId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("cover_image")
      .eq("id", resolvedUserId)
      .single();

    if (error) {
      console.error("Erro ao carregar capa:", error);
      return;
    }

    if (data?.cover_image) {
      setCoverImage(data.cover_image);
      
      // Se for uma cor customizada
      if (data.cover_image.startsWith("#")) {
        setCustomColor(data.cover_image);
      }
      
      // Se for uma URL de imagem do storage
      if (data.cover_image.startsWith("http") || data.cover_image.includes("profiles/")) {
        setUploadedImage(data.cover_image);
      }
    }
  };

  const handleSelectCover = async (coverValue: string) => {
    if (!resolvedUserId) {
      toast.error("Erro: usuário não identificado");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ cover_image: coverValue })
      .eq("id", resolvedUserId);

    if (error) {
      toast.error("Erro ao salvar capa");
      return;
    }

    setCoverImage(coverValue);
    toast.success("Capa atualizada!");
    setOpen(false);
  };

  const handleCustomColor = async () => {
    await handleSelectCover(customColor);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Apenas imagens JPG, PNG ou WebP são permitidas");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCroppingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (!croppingImage || !userId) return;

    try {
      const croppedBlob = await getCroppedImg(croppingImage, croppedAreaPixels);
      
      const fileName = `${userId}/cover-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(fileName, croppedBlob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        toast.error("Erro ao fazer upload da imagem");
        console.error(uploadError);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("profiles")
        .getPublicUrl(fileName);

      await handleSelectCover(publicUrl);
      setUploadedImage(publicUrl);
      setCroppingImage(null);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar imagem");
    }
  };

  const getCoverStyle = () => {
    // Se for uma cor hex customizada
    if (coverImage.startsWith("#")) {
      return { backgroundColor: coverImage };
    }
    
    // Se for uma URL de imagem
    if (coverImage.startsWith("http") || coverImage.includes("profiles/")) {
      return {
        backgroundImage: `url(${coverImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    // Se for uma imagem predefinida
    const predefinedImage = coverImages.find((img) => img.id === coverImage);
    if (predefinedImage) {
      return {
        backgroundImage: `url(${predefinedImage.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    // Se for um gradiente
    const gradient = coverGradients.find((g) => g.id === coverImage);
    return gradient ? {} : {};
  };

  const getCoverClass = () => {
    if (coverImage.startsWith("#") || coverImage.startsWith("http") || coverImage.includes("profiles/")) {
      return "";
    }
    
    const predefinedImage = coverImages.find((img) => img.id === coverImage);
    if (predefinedImage) {
      return "";
    }

    const gradient = coverGradients.find((g) => g.id === coverImage);
    return gradient?.class || coverGradients[0].class;
  };

  return (
    <>
      <div className={`relative h-32 w-full ${getCoverClass()}`} style={getCoverStyle()}>
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Escolha uma Capa</DialogTitle>
            </DialogHeader>

            {croppingImage ? (
              <CoverImageCropper
                imageSrc={croppingImage}
                onCropComplete={handleCropComplete}
                onCancel={() => setCroppingImage(null)}
              />
            ) : (
              <Tabs defaultValue="gradients" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="gradients">Gradientes</TabsTrigger>
                  <TabsTrigger value="images">Imagens</TabsTrigger>
                  <TabsTrigger value="custom">Cor Própria</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="gradients" className="space-y-4">
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
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {coverImages.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => handleSelectCover(image.id)}
                        className={`relative h-32 rounded-lg overflow-hidden hover:opacity-80 transition-opacity ${
                          coverImage === image.id ? "ring-4 ring-primary" : ""
                        }`}
                        style={{
                          backgroundImage: `url(${image.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <span className="absolute bottom-2 left-2 text-white font-medium text-sm bg-black/30 px-2 py-1 rounded">
                          {image.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-color">Escolha sua cor</Label>
                      <div className="flex gap-2">
                        <Input
                          id="custom-color"
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-20 h-20 cursor-pointer"
                        />
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type="text"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            placeholder="#3b82f6"
                            className="font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className="h-32 rounded-lg"
                      style={{ backgroundColor: customColor }}
                    />
                    <Button onClick={handleCustomColor} className="w-full">
                      <Palette className="w-4 h-4 mr-2" />
                      Aplicar Cor Personalizada
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        Envie sua própria imagem
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Você poderá ajustar o zoom e posição após o upload
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Escolher Arquivo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        JPG, PNG ou WebP • Máximo 5MB
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
