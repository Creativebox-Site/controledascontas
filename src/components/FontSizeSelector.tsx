import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <Button variant="outline" size="icon">
          <Type className="h-5 w-5" />
          <span className="sr-only">Ajustar tamanho da fonte</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(fontSizeLabels) as FontSize[]).map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => handleFontSizeChange(size)}
            className={fontSize === size ? "bg-accent" : ""}
          >
            {fontSizeLabels[size]}
            {size === "medium" && " (padrão)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
