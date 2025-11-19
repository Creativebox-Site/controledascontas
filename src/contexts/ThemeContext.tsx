import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type ColorSchema = "zinc" | "blue" | "rose" | "orange" | "green" | "purple" | "custom";
type FontSize = "small" | "medium" | "large" | "xl";

interface ThemeContextType {
  theme: Theme;
  colorSchema: ColorSchema;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setColorSchema: (schema: ColorSchema) => void;
  setFontSize: (size: FontSize) => void;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  setCustomColors: (colors: { primary: string; secondary: string; accent: string }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

const COLOR_SCHEMAS = {
  zinc: {
    primary: "240 5.9% 10%",
    secondary: "240 4.8% 95.9%",
    accent: "240 4.8% 95.9%",
  },
  blue: {
    primary: "221.2 83.2% 53.3%",
    secondary: "210 40% 96.1%",
    accent: "210 40% 96.1%",
  },
  rose: {
    primary: "346.8 77.2% 49.8%",
    secondary: "330 40% 96.1%",
    accent: "330 40% 96.1%",
  },
  orange: {
    primary: "24.6 95% 53.1%",
    secondary: "33 100% 96.5%",
    accent: "33 100% 96.5%",
  },
  green: {
    primary: "142.1 76.2% 36.3%",
    secondary: "138.5 76.5% 96.7%",
    accent: "138.5 76.5% 96.7%",
  },
  purple: {
    primary: "262.1 83.3% 57.8%",
    secondary: "270 100% 98%",
    accent: "270 100% 98%",
  },
};

const FONT_SIZES = {
  small: "14px",
  medium: "16px",
  large: "18px",
  xl: "20px",
};

const hexToHsl = (hex: string): string => {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "system";
  });

  const [colorSchema, setColorSchemaState] = useState<ColorSchema>(() => {
    const stored = localStorage.getItem("colorSchema") as ColorSchema;
    return stored || "purple";
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const stored = localStorage.getItem("fontSize") as FontSize;
    return stored || "medium";
  });

  const [customColors, setCustomColorsState] = useState(() => {
    const saved = localStorage.getItem("customColors");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { primary: "#7c3aed", secondary: "#ec4899", accent: "#14b8a6" };
      }
    }
    return { primary: "#7c3aed", secondary: "#ec4899", accent: "#14b8a6" };
  });

  // Aplicar tema (light/dark)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Aplicar esquema de cores
  useEffect(() => {
    const root = document.documentElement;

    if (colorSchema === "custom") {
      const primaryHsl = hexToHsl(customColors.primary);
      const secondaryHsl = hexToHsl(customColors.secondary);
      const accentHsl = hexToHsl(customColors.accent);

      root.style.setProperty("--primary", primaryHsl);
      root.style.setProperty("--secondary", secondaryHsl);
      root.style.setProperty("--accent", accentHsl);
      root.style.setProperty("--ring", primaryHsl);
      root.style.setProperty("--chart-1", primaryHsl);
      root.style.setProperty("--chart-2", secondaryHsl);
      root.style.setProperty("--chart-3", accentHsl);
      root.style.setProperty("--sidebar-primary", primaryHsl);
      root.style.setProperty("--sidebar-ring", primaryHsl);
    } else {
      const colors = COLOR_SCHEMAS[colorSchema];
      root.style.setProperty("--primary", colors.primary);
      root.style.setProperty("--secondary", colors.secondary);
      root.style.setProperty("--accent", colors.accent);
      root.style.setProperty("--ring", colors.primary);
      root.style.setProperty("--chart-1", colors.primary);
      root.style.setProperty("--chart-2", colors.secondary);
      root.style.setProperty("--chart-3", colors.accent);
      root.style.setProperty("--sidebar-primary", colors.primary);
      root.style.setProperty("--sidebar-ring", colors.primary);
    }

    localStorage.setItem("colorSchema", colorSchema);
  }, [colorSchema, customColors]);

  // Aplicar tamanho da fonte
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = FONT_SIZES[fontSize];
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setColorSchema = (schema: ColorSchema) => {
    setColorSchemaState(schema);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const setCustomColors = (colors: { primary: string; secondary: string; accent: string }) => {
    setCustomColorsState(colors);
    localStorage.setItem("customColors", JSON.stringify(colors));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorSchema,
        fontSize,
        setTheme,
        setColorSchema,
        setFontSize,
        customColors,
        setCustomColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
