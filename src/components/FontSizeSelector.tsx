import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type FontSize = "small" | "medium" | "large";

const fontSizeLabels = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <Type className="h-4 w-4" />
          <span>Alterar tamanho da fonte</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {(Object.keys(fontSizeLabels) as FontSize[]).map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => handleFontSizeChange(size)}
            className={cn(
              "cursor-pointer transition-all duration-200",
              fontSize === size && "bg-accent font-semibold"
            )}
          >
            <span className="flex items-center gap-2 w-full">
              {fontSizeLabels[size]}
              {size === "medium" && <span className="text-muted-foreground text-xs">(padrão)</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
