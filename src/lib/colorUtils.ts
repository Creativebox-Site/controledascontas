// Converter RGB para HSL
export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// Converter HSL para formato CSS
export const hslToCssValue = (h: number, s: number, l: number): string => {
  return `${h} ${s}% ${l}%`;
};

// Extrair cores dominantes de uma imagem
export const extractColorsFromImage = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Redimensionar para processar mais rápido
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Coletar cores
      const colorMap = new Map<string, number>();
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Ignorar pixels muito transparentes
        if (a < 128) continue;

        // Quantizar cores para agrupar similares
        const qr = Math.round(r / 10) * 10;
        const qg = Math.round(g / 10) * 10;
        const qb = Math.round(b / 10) * 10;
        
        const key = `${qr},${qg},${qb}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Ordenar por frequência
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Converter para HSL
      const colors = sortedColors.map(([color]) => {
        const [r, g, b] = color.split(',').map(Number);
        const hsl = rgbToHsl(r, g, b);
        return hslToCssValue(hsl.h, hsl.s, hsl.l);
      });

      resolve(colors);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Aplicar tema personalizado
export const applyCustomTheme = (primaryColor: string) => {
  const root = document.documentElement;
  
  // Parse HSL color
  const [h, s, l] = primaryColor.split(' ').map(v => parseFloat(v));
  
  // Atualizar variáveis do tema
  root.style.setProperty('--primary', primaryColor);
  root.style.setProperty('--ring', primaryColor);
  
  // Criar variações para accent baseado na cor primária
  const accentHsl = hslToCssValue(h, Math.min(s + 10, 100), Math.max(l - 10, 20));
  root.style.setProperty('--accent', accentHsl);
  
  // Atualizar cores dos gráficos
  root.style.setProperty('--chart-3', primaryColor);
  root.style.setProperty('--sidebar-ring', primaryColor);
};

// Resetar para tema padrão
export const resetToDefaultTheme = () => {
  const root = document.documentElement;
  const defaultPrimary = '217 91% 60%';
  
  root.style.removeProperty('--primary');
  root.style.removeProperty('--ring');
  root.style.removeProperty('--accent');
  root.style.removeProperty('--chart-3');
  root.style.removeProperty('--sidebar-ring');
};
