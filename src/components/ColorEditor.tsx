import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
}

const hexToHsl = (hex: string): string => {
  // Remove o # se existir
  hex = hex.replace(/^#/, '');
  
  // Converte hex para RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

const hslToHex = (hsl: string): string => {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
  
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = lDecimal;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;

    r = hue2rgb(p, q, hDecimal + 1/3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const DEFAULT_COLORS: CustomColors = {
  primary: "#7c3aed",
  secondary: "#ec4899",
  accent: "#14b8a6",
};

export const ColorEditor = () => {
  const { toast } = useToast();
  const [colors, setColors] = useState<CustomColors>(() => {
    const saved = localStorage.getItem("customColors");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_COLORS;
      }
    }
    return DEFAULT_COLORS;
  });

  const applyCustomColors = (customColors: CustomColors) => {
    const root = document.documentElement;
    const primaryHsl = hexToHsl(customColors.primary);
    const secondaryHsl = hexToHsl(customColors.secondary);
    const accentHsl = hexToHsl(customColors.accent);

    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--ring', primaryHsl);
    root.style.setProperty('--chart-1', primaryHsl);
    root.style.setProperty('--chart-2', secondaryHsl);
    root.style.setProperty('--chart-3', accentHsl);
    root.style.setProperty('--sidebar-primary', primaryHsl);
    root.style.setProperty('--sidebar-ring', primaryHsl);
  };

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "custom") {
      applyCustomColors(colors);
    }
  }, [colors]);

  const handleColorChange = (colorKey: keyof CustomColors, value: string) => {
    const newColors = { ...colors, [colorKey]: value };
    setColors(newColors);
    localStorage.setItem("customColors", JSON.stringify(newColors));
    
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "custom") {
      applyCustomColors(newColors);
    }
  };

  const handleReset = () => {
    setColors(DEFAULT_COLORS);
    localStorage.setItem("customColors", JSON.stringify(DEFAULT_COLORS));
    
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "custom") {
      applyCustomColors(DEFAULT_COLORS);
    }
    
    toast({
      title: "Cores restauradas",
      description: "As cores foram restauradas para os valores padrão.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Editor de Cores Personalizado</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Escolha suas cores favoritas. As mudanças são aplicadas automaticamente quando o tema "Personalizado" está ativo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="primary-color" className="text-sm">Cor Primária</Label>
            <div className="flex gap-2 items-center">
              <input
                id="primary-color"
                type="color"
                value={colors.primary}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                className="h-12 w-full rounded-md border border-input cursor-pointer"
              />
              <div className="text-xs text-muted-foreground font-mono min-w-[70px]">
                {colors.primary.toUpperCase()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Botões e elementos principais</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color" className="text-sm">Cor Secundária</Label>
            <div className="flex gap-2 items-center">
              <input
                id="secondary-color"
                type="color"
                value={colors.secondary}
                onChange={(e) => handleColorChange("secondary", e.target.value)}
                className="h-12 w-full rounded-md border border-input cursor-pointer"
              />
              <div className="text-xs text-muted-foreground font-mono min-w-[70px]">
                {colors.secondary.toUpperCase()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Elementos secundários e destaque</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color" className="text-sm">Cor de Acento</Label>
            <div className="flex gap-2 items-center">
              <input
                id="accent-color"
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="h-12 w-full rounded-md border border-input cursor-pointer"
              />
              <div className="text-xs text-muted-foreground font-mono min-w-[70px]">
                {colors.accent.toUpperCase()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Sucesso e confirmações</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar Padrão
          </Button>
          <p className="text-xs text-muted-foreground flex items-center">
            Dica: Ative o tema "Personalizado" para ver suas cores em ação
          </p>
        </div>

        {/* Preview das cores */}
        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Prévia das cores</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" style={{ backgroundColor: colors.primary, borderColor: colors.primary }}>
              Primária
            </Button>
            <Button size="sm" variant="secondary" style={{ backgroundColor: colors.secondary, borderColor: colors.secondary, color: 'white' }}>
              Secundária
            </Button>
            <Button size="sm" variant="outline" style={{ borderColor: colors.accent, color: colors.accent }}>
              Acento
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
