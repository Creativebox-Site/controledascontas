import { Moon, Sun, Monitor, Eye, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type Theme = "light" | "dark" | "system" | "colorblind" | "custom";

export const ThemeToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "colorblind", "custom");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Apply custom colors if theme is custom
    if (theme === "custom") {
      const savedColors = localStorage.getItem("customColors");
      if (savedColors) {
        try {
          const colors = JSON.parse(savedColors);
          const hexToHsl = (hex: string): string => {
            hex = hex.replace(/^#/, '');
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

          const primaryHsl = hexToHsl(colors.primary);
          const secondaryHsl = hexToHsl(colors.secondary);
          const accentHsl = hexToHsl(colors.accent);

          root.style.setProperty('--primary', primaryHsl);
          root.style.setProperty('--secondary', secondaryHsl);
          root.style.setProperty('--accent', accentHsl);
          root.style.setProperty('--ring', primaryHsl);
          root.style.setProperty('--chart-1', primaryHsl);
          root.style.setProperty('--chart-2', secondaryHsl);
          root.style.setProperty('--chart-3', accentHsl);
          root.style.setProperty('--sidebar-primary', primaryHsl);
          root.style.setProperty('--sidebar-ring', primaryHsl);
        } catch (error) {
          console.error("Error applying custom colors:", error);
        }
      }
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Se escolher tema personalizado e não estiver na página de settings
    if (newTheme === "custom" && !location.pathname.includes("/dashboard/settings")) {
      navigate("/dashboard/settings");
      // Aguardar navegação e scroll até o editor
      setTimeout(() => {
        const colorEditor = document.getElementById("color-editor");
        if (colorEditor) {
          colorEditor.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    } else if (newTheme === "custom") {
      // Já está na página, apenas scroll
      setTimeout(() => {
        const colorEditor = document.getElementById("color-editor");
        if (colorEditor) {
          colorEditor.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Temas Padrão</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          Sistema
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Temas Especiais</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange("colorblind")}>
          <Eye className="mr-2 h-4 w-4" />
          Daltônicos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("custom")}>
          <Palette className="mr-2 h-4 w-4" />
          Personalizado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
