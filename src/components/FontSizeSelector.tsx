import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FontSize = "small" | "medium" | "large";

const fontSizeLabels = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

const fontSizePreviewClasses = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

export const FontSizeSelector = () => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem("fontSize");
    return (saved as FontSize) || "medium";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing font size classes
    root.classList.remove("font-size-small", "font-size-medium", "font-size-large");
    
    // Add current font size class
    root.classList.add(`font-size-${fontSize}`);
    
    // Save preference
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const handleFontSizeChange = (newSize: FontSize) => {
    setFontSize(newSize);
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Type className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Alterar o tamanho da fonte</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-[240px]">
          {(Object.keys(fontSizeLabels) as FontSize[]).map((size) => (
            <DropdownMenuItem
              key={size}
              onClick={() => handleFontSizeChange(size)}
              className={cn(
                "cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 py-3",
                fontSize === size && "bg-accent font-semibold"
              )}
            >
              <span className="flex items-center gap-2">
                {fontSizeLabels[size]}
                {size === "medium" && <span className="text-muted-foreground text-xs">(padrão)</span>}
              </span>
              <span className={cn("text-muted-foreground", fontSizePreviewClasses[size])}>
                Aa
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};
