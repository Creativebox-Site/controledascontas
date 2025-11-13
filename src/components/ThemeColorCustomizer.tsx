import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Upload, RotateCcw, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractColorsFromImage, applyCustomTheme, resetToDefaultTheme, rgbToHsl, hslToCssValue } from "@/lib/colorUtils";

interface ThemeColorCustomizerProps {
  userId?: string;
}

export const ThemeColorCustomizer = ({ userId }: ThemeColorCustomizerProps) => {
  const [color, setColor] = useState("#4F9FFF");
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadThemeColor();
    }
  }, [userId]);

  const loadThemeColor = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("theme_color")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao carregar cor do tema:", error);
      return;
    }

    if (data?.theme_color) {
      setColor(data.theme_color);
      applyColorToTheme(data.theme_color);
    }
  };

  const hexToHsl = (hex: string) => {
    // Remove # se presente
    hex = hex.replace("#", "");
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return rgbToHsl(r, g, b);
  };

  const applyColorToTheme = (hexColor: string) => {
    const hsl = hexToHsl(hexColor);
    const hslValue = hslToCssValue(hsl.h, hsl.s, hsl.l);
    applyCustomTheme(hslValue);
  };

  const handleColorChange = async (newColor: string) => {
    setColor(newColor);
    applyColorToTheme(newColor);

    if (userId) {
      const { error } = await supabase
        .from("profiles")
        .update({ theme_color: newColor })
        .eq("id", userId);

      if (error) {
        console.error("Erro ao salvar cor:", error);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    setIsProcessing(true);
    try {
      const colors = await extractColorsFromImage(file);
      setExtractedColors(colors);
      toast.success("Cores extraídas! Clique em uma cor para aplicar");
    } catch (error) {
      console.error("Erro ao extrair cores:", error);
      toast.error("Erro ao processar imagem");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractedColorClick = (hslColor: string) => {
    // Converter HSL para HEX para o seletor
    const [h, s, l] = hslColor.split(' ').map(v => parseFloat(v));
    
    // Conversão simplificada HSL para RGB
    const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = (l / 100) - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    
    handleColorChange(hex);
    applyCustomTheme(hslColor);
  };

  const handleReset = async () => {
    const defaultColor = "#4F9FFF";
    setColor(defaultColor);
    setExtractedColors([]);
    resetToDefaultTheme();
    
    if (userId) {
      await supabase
        .from("profiles")
        .update({ theme_color: null })
        .eq("id", userId);
    }
    
    toast.success("Tema restaurado ao padrão");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cores do Tema</CardTitle>
        <CardDescription>
          Personalize as cores do aplicativo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de Cor Manual */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Label>Escolher Cor Primária</Label>
          </div>
          <div className="flex flex-col items-center gap-4">
            <HexColorPicker color={color} onChange={handleColorChange} />
            <div className="flex items-center gap-4 w-full">
              <div 
                className="h-12 flex-1 rounded-md border-2 border-border"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-mono text-muted-foreground">
                {color.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Upload de Imagem */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <Label>Extrair Cores de Imagem</Label>
          </div>
          <Button
            variant="outline"
            onClick={() => document.getElementById("theme-image-upload")?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? "Processando..." : "Carregar Imagem"}
          </Button>
          <input
            id="theme-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          
          {extractedColors.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Cores extraídas (clique para aplicar):
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {extractedColors.map((hslColor, index) => {
                  const [h, s, l] = hslColor.split(' ').map(v => parseFloat(v));
                  return (
                    <button
                      key={index}
                      className="h-12 rounded-md border-2 border-border hover:border-primary transition-colors cursor-pointer"
                      style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
                      onClick={() => handleExtractedColorClick(hslColor)}
                      title={`HSL: ${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Botão Reset */}
        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar Tema Padrão
        </Button>
      </CardContent>
    </Card>
  );
};
