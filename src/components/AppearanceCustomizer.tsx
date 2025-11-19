import { useState } from "react";
import { Paintbrush, Sun, Moon, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLOR_SWATCHES = [
  { name: "Zinc", value: "zinc" as const, color: "bg-zinc-500" },
  { name: "Azul", value: "blue" as const, color: "bg-blue-500" },
  { name: "Rosa", value: "rose" as const, color: "bg-rose-500" },
  { name: "Laranja", value: "orange" as const, color: "bg-orange-500" },
  { name: "Verde", value: "green" as const, color: "bg-green-500" },
  { name: "Roxo", value: "purple" as const, color: "bg-purple-500" },
];

const FONT_SIZE_MAP = {
  0: "small" as const,
  1: "medium" as const,
  2: "large" as const,
  3: "xl" as const,
};

const FONT_SIZE_LABELS = {
  small: "Pequeno (14px)",
  medium: "Médio (16px)",
  large: "Grande (18px)",
  xl: "Extra Grande (20px)",
};

export const AppearanceCustomizer = () => {
  const {
    theme,
    colorSchema,
    fontSize,
    setTheme,
    setColorSchema,
    setFontSize,
    customColors,
    setCustomColors,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [localCustomColors, setLocalCustomColors] = useState(customColors);

  const fontSizeIndex = Object.entries(FONT_SIZE_MAP).find(
    ([, value]) => value === fontSize
  )?.[0] as string;

  const handleFontSizeChange = (value: number[]) => {
    const size = FONT_SIZE_MAP[value[0] as keyof typeof FONT_SIZE_MAP];
    setFontSize(size);
  };

  const handleCustomColorChange = (key: keyof typeof customColors, value: string) => {
    const newColors = { ...localCustomColors, [key]: value };
    setLocalCustomColors(newColors);
    setCustomColors(newColors);
    if (colorSchema !== "custom") {
      setColorSchema("custom");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Paintbrush className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Personalizar aparência</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Aparência</SheetTitle>
          <SheetDescription>
            Personalize o tema, cores e tamanho da fonte do aplicativo
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Modo (Tema) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Modo</Label>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(value) => value && setTheme(value as typeof theme)}
              className="justify-start gap-2"
            >
              <ToggleGroupItem
                value="light"
                aria-label="Modo claro"
                className="flex-1 gap-2"
              >
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Claro</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                aria-label="Modo escuro"
                className="flex-1 gap-2"
              >
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Escuro</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="system"
                aria-label="Modo sistema"
                className="flex-1 gap-2"
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Sistema</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          {/* Cor de Destaque */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Cor de Destaque</Label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  onClick={() => setColorSchema(swatch.value)}
                  className={cn(
                    "relative h-12 w-full rounded-md transition-all hover:scale-105",
                    swatch.color,
                    colorSchema === swatch.value && "ring-2 ring-offset-2 ring-foreground"
                  )}
                  title={swatch.name}
                >
                  {colorSchema === swatch.value && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-lg" />
                  )}
                </button>
              ))}
            </div>

            {/* Cores Personalizadas */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Cores Personalizadas
                </Label>
                {colorSchema === "custom" && (
                  <span className="text-xs text-primary font-medium">Ativo</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="primary-color" className="text-xs">
                    Primária
                  </Label>
                  <div className="flex gap-2">
                    <div
                      className="h-9 w-9 rounded border shrink-0"
                      style={{ backgroundColor: localCustomColors.primary }}
                    />
                    <Input
                      id="primary-color"
                      type="color"
                      value={localCustomColors.primary}
                      onChange={(e) =>
                        handleCustomColorChange("primary", e.target.value)
                      }
                      className="h-9 w-full cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="secondary-color" className="text-xs">
                    Secundária
                  </Label>
                  <div className="flex gap-2">
                    <div
                      className="h-9 w-9 rounded border shrink-0"
                      style={{ backgroundColor: localCustomColors.secondary }}
                    />
                    <Input
                      id="secondary-color"
                      type="color"
                      value={localCustomColors.secondary}
                      onChange={(e) =>
                        handleCustomColorChange("secondary", e.target.value)
                      }
                      className="h-9 w-full cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="accent-color" className="text-xs">
                    Destaque
                  </Label>
                  <div className="flex gap-2">
                    <div
                      className="h-9 w-9 rounded border shrink-0"
                      style={{ backgroundColor: localCustomColors.accent }}
                    />
                    <Input
                      id="accent-color"
                      type="color"
                      value={localCustomColors.accent}
                      onChange={(e) =>
                        handleCustomColorChange("accent", e.target.value)
                      }
                      className="h-9 w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tamanho do Texto */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Tamanho do Texto</Label>
            
            {/* Preview */}
            <div className="rounded-lg border bg-muted/50 p-4 transition-all duration-300">
              <p className="font-medium transition-all duration-300">
                Texto de exemplo
              </p>
              <p className="text-sm text-muted-foreground transition-all duration-300">
                Este é um exemplo de como o texto aparecerá
              </p>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <Slider
                value={[parseInt(fontSizeIndex)]}
                onValueChange={handleFontSizeChange}
                max={3}
                step={1}
                className="cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>A-</span>
                <span className="font-medium text-foreground">
                  {FONT_SIZE_LABELS[fontSize]}
                </span>
                <span>A+</span>
              </div>
            </div>

            {/* Botões de tamanho rápido */}
            <div className="grid grid-cols-4 gap-2">
              {(["small", "medium", "large", "xl"] as const).map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFontSize(size)}
                  className="transition-all duration-200"
                >
                  <span
                    className={cn(
                      "font-medium",
                      size === "small" && "text-xs",
                      size === "medium" && "text-sm",
                      size === "large" && "text-base",
                      size === "xl" && "text-lg"
                    )}
                  >
                    Aa
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
