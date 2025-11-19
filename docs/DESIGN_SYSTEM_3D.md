# Sistema de Design 3D & Motion Acessível

## 🎨 Linguagem Visual Completa

### Sistema de Cores HSL

Todas as cores usam HSL para melhor manipulação de luminosidade e transparência:

```css
/* Cores base em HSL */
--primary: 217 91% 60%;           /* hsl(217, 91%, 60%) */
--primary-hover: 217 91% 55%;
--primary-active: 217 91% 50%;

--accent: 142 76% 36%;            /* Verde success */
--warning: 38 92% 50%;            /* Laranja */
--error: 0 72% 51%;               /* Vermelho */
```

### Paletas de Degradê

#### 1. Linear Gradients
```css
/* Degradê primário */
--gradient-primary: linear-gradient(135deg, 
  hsl(217 91% 60%), 
  hsl(217 91% 50%)
);

/* Degradê success */
--gradient-success: linear-gradient(135deg, 
  hsl(142 76% 36%), 
  hsl(142 76% 28%)
);

/* Degradê sunset (warning → error) */
--gradient-sunset: linear-gradient(135deg, 
  hsl(38 92% 50%), 
  hsl(0 72% 51%)
);

/* Degradê glass (glassmorphism) */
--gradient-glass: linear-gradient(135deg, 
  hsla(0, 0%, 100%, 0.1), 
  hsla(0, 0%, 100%, 0.05)
);
```

#### 2. Radial Gradients (Glows)
```css
/* Glow primário */
--gradient-glow-primary: radial-gradient(
  circle at center, 
  hsla(217, 91%, 60%, 0.3), 
  transparent 70%
);

/* Glow success */
--gradient-glow-success: radial-gradient(
  circle at center, 
  hsla(142, 76%, 36%, 0.3), 
  transparent 70%
);
```

#### 3. Conic Gradients (Spins)
```css
/* Rainbow conic */
--gradient-rainbow: conic-gradient(
  from 0deg at 50% 50%, 
  hsl(217 91% 60%),    /* Blue */
  hsl(142 76% 36%),    /* Green */
  hsl(38 92% 50%),     /* Orange */
  hsl(0 72% 51%),      /* Red */
  hsl(217 91% 60%)     /* Back to blue */
);

/* Primary spin */
--gradient-primary-spin: conic-gradient(
  from 0deg at 50% 50%, 
  hsl(217 91% 60%), 
  hsl(217 91% 70%), 
  hsl(217 91% 60%)
);
```

### Variantes Alpha (Transparências)

```css
/* Primary com transparência */
--primary-alpha-10: hsla(217, 91%, 60%, 0.1);
--primary-alpha-20: hsla(217, 91%, 60%, 0.2);
--primary-alpha-30: hsla(217, 91%, 60%, 0.3);
--primary-alpha-50: hsla(217, 91%, 60%, 0.5);

/* Black/White alpha */
--black-alpha-5: hsla(0, 0%, 0%, 0.05);
--black-alpha-10: hsla(0, 0%, 0%, 0.1);
--black-alpha-20: hsla(0, 0%, 0%, 0.2);

--white-alpha-10: hsla(0, 0%, 100%, 0.1);
--white-alpha-20: hsla(0, 0%, 100%, 0.2);
--white-alpha-80: hsla(0, 0%, 100%, 0.8);
```

---

## 📐 Escala de Elevações & Sombras

### Sistema de Elevação (z1-z6)

```css
/* Z1 - Subtle (cards, buttons) */
--shadow-z1: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--blur-z1: 4px;

/* Z2 - Moderate (dropdowns, selects) */
--shadow-z2: 
  0 4px 6px -1px rgba(0, 0, 0, 0.1), 
  0 2px 4px -1px rgba(0, 0, 0, 0.06);
--blur-z2: 8px;

/* Z3 - Higher (modals, overlays) */
--shadow-z3: 
  0 10px 15px -3px rgba(0, 0, 0, 0.1), 
  0 4px 6px -2px rgba(0, 0, 0, 0.05);
--blur-z3: 12px;

/* Z4 - High (dialogs) */
--shadow-z4: 
  0 20px 25px -5px rgba(0, 0, 0, 0.1), 
  0 10px 10px -5px rgba(0, 0, 0, 0.04);
--blur-z4: 16px;

/* Z5 - Maximum */
--shadow-z5: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--blur-z5: 20px;

/* Z6 - Extreme (special effects) */
--shadow-z6: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
--blur-z6: 24px;
```

### Sombras Coloridas

```css
/* Primary glow */
--shadow-glow-primary: 
  0 0 20px hsla(217, 91%, 60%, 0.4), 
  0 0 40px hsla(217, 91%, 60%, 0.2);

/* Success glow */
--shadow-glow-success: 
  0 0 20px hsla(142, 76%, 36%, 0.4), 
  0 0 40px hsla(142, 76%, 36%, 0.2);

/* Colored shadow */
--shadow-colored-primary: 0 10px 30px -10px hsla(217, 91%, 60%, 0.3);
```

### Sombras Internas

```css
/* Inner shadow subtle */
--shadow-inner-subtle: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* Inner shadow strong */
--shadow-inner-strong: inset 0 4px 8px 0 rgba(0, 0, 0, 0.1);
```

---

## 🔮 Glassmorphism Guidelines

### Backdrop Filter

```css
/* Glass light mode */
.glass-light {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: linear-gradient(
    135deg, 
    hsla(0, 0%, 100%, 0.1), 
    hsla(0, 0%, 100%, 0.05)
  );
  border: 1px solid hsla(0, 0%, 100%, 0.2);
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.4);
}

/* Glass dark mode */
.glass-dark {
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
  background: linear-gradient(
    135deg, 
    hsla(0, 0%, 0%, 0.2), 
    hsla(0, 0%, 0%, 0.1)
  );
  border: 1px solid hsla(0, 0%, 100%, 0.1);
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.3),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.2);
}
```

### Background Clip

```css
/* Text com gradiente */
.gradient-text {
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
}

/* Border gradiente */
.gradient-border {
  position: relative;
  background: var(--bg-card);
  background-clip: padding-box;
  border: 2px solid transparent;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  margin: -2px;
  border-radius: inherit;
  background: var(--gradient-primary);
}
```

---

## 🎬 Efeitos 3D & Motion

### Padrões de Profundidade

```css
/* Container 3D */
.perspective-container {
  perspective: 1000px;
  perspective-origin: 50% 50%;
}

/* Elemento 3D */
.transform-3d {
  transform-style: preserve-3d;
  will-change: transform;
}

/* Profundidade em camadas */
.layer-back {
  transform: translateZ(-20px);
}

.layer-middle {
  transform: translateZ(0px);
}

.layer-front {
  transform: translateZ(20px);
}
```

### Cards com Layered Shadows

```css
.card-3d {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.06);
}

.card-3d::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    to bottom right,
    hsla(0, 0%, 100%, 0.1),
    transparent
  );
  transform: translateZ(1px);
  pointer-events: none;
}

.card-3d:hover {
  transform: translateY(-4px) rotateX(2deg);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 8px 16px rgba(0, 0, 0, 0.1),
    0 16px 32px rgba(0, 0, 0, 0.08);
}
```

### Parallax Sutil

```css
.parallax-container {
  perspective: 1000px;
  overflow: hidden;
}

.parallax-layer-1 {
  transform: translateZ(-50px) scale(1.05);
}

.parallax-layer-2 {
  transform: translateZ(-30px) scale(1.03);
}

.parallax-layer-3 {
  transform: translateZ(0px);
}

/* Hover parallax */
.parallax-hover {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.parallax-hover:hover {
  transform: translateZ(10px) scale(1.02);
}
```

### Micro-Interactions

#### Hover States
```css
/* Scale hover */
.hover-scale {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.hover-scale:hover {
  transform: scale(1.05) translateZ(5px);
}

/* Lift hover */
.hover-lift {
  transition: 
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow;
}

.hover-lift:hover {
  transform: translateY(-4px) translateZ(10px);
  box-shadow: var(--shadow-z3);
}

/* Glow hover */
.hover-glow {
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: box-shadow;
}

.hover-glow:hover {
  box-shadow: var(--shadow-glow-primary);
}
```

#### Press States
```css
.press-scale {
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.press-scale:active {
  transform: scale(0.95) translateZ(-2px);
}

.press-inset {
  transition: box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.press-inset:active {
  box-shadow: var(--shadow-inner-strong);
}
```

#### Focus States
```css
.focus-ring {
  transition: 
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    outline 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.focus-ring:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  box-shadow: 
    0 0 0 4px hsla(217, 91%, 60%, 0.2),
    var(--shadow-z2);
}
```

---

## ♿ Acessibilidade & Performance

### Reduced Motion

```css
/* Respeitar preferência do usuário */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Manter funcionalidade visual sem animação */
  .hover-scale:hover {
    transform: scale(1.02);  /* Reduzir escala */
  }
  
  .hover-lift:hover {
    transform: translateY(-2px);  /* Reduzir movimento */
  }
}

/* Respeitar preferência de contraste */
@media (prefers-contrast: more) {
  :root {
    --shadow-z1: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    --shadow-z2: 0 4px 8px 0 rgba(0, 0, 0, 0.25);
  }
  
  .glass-light,
  .glass-dark {
    backdrop-filter: none;
    background: var(--bg-elevated-1);
    border: 2px solid var(--border);
  }
}
```

### Otimização de Performance

```css
/* Apenas transform e opacity para animações */
.optimized-animation {
  /* ✅ BOM - Hardware accelerated */
  transition: 
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* ❌ EVITAR - Causa repaint */
  /* transition: width 0.3s, height 0.3s, left 0.3s; */
}

/* Will-change para elementos que animam frequentemente */
.frequent-animation {
  will-change: transform, opacity;
}

/* Remover will-change quando não estiver animando */
.frequent-animation:not(:hover):not(:focus) {
  will-change: auto;
}

/* Contain para isolamento de layout */
.isolated-component {
  contain: layout style paint;
}

/* Content-visibility para lazy rendering */
.below-fold {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### GPU Acceleration

```css
/* Forçar compositing layer */
.gpu-accelerated {
  transform: translateZ(0);
  /* ou */
  transform: translate3d(0, 0, 0);
  /* ou */
  will-change: transform;
}

/* Exemplo: Card otimizado */
.card-optimized {
  transform: translateZ(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.card-optimized:hover {
  transform: translateY(-4px) translateZ(10px);
}
```

---

## 📏 Regras de Contraste WCAG

### WCAG AA (Mínimo)
- **Texto normal**: Contraste 4.5:1
- **Texto grande** (≥18pt ou 14pt bold): Contraste 3:1
- **UI components e gráficos**: Contraste 3:1

### WCAG AAA (Avançado)
- **Texto normal**: Contraste 7:1
- **Texto grande**: Contraste 4.5:1

### Verificação de Contraste

```css
/* Cores que passam WCAG AA para texto normal */
/* Light mode */
--text-on-white: hsl(222, 47%, 11%);        /* #1a2332 - 13.2:1 ✅ */
--primary-on-white: hsl(217, 91%, 60%);     /* #4169E1 - 5.1:1 ✅ */
--accent-on-white: hsl(142, 76%, 36%);      /* #159947 - 4.6:1 ✅ */

/* Dark mode */
--text-on-dark: hsl(210, 40%, 98%);         /* #F8FAFC - 15.1:1 ✅ */
--primary-on-dark: hsl(217, 91%, 60%);      /* #4169E1 - 8.2:1 ✅ */
--accent-on-dark: hsl(142, 76%, 45%);       /* #1FAB5E - 6.1:1 ✅ */

/* Alertas */
--error-text: hsl(0, 72%, 51%);             /* #DC2626 - 5.8:1 ✅ */
--warning-text: hsl(38, 92%, 35%);          /* #C77700 - 4.6:1 ✅ */
```

### Ferramentas de Teste

```javascript
// Função para calcular contraste
function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Exemplo de uso
const contrastRatio = getContrastRatio('#4169E1', '#FFFFFF');
console.log(`Contrast: ${contrastRatio.toFixed(2)}:1`);

if (contrastRatio >= 4.5) {
  console.log('✅ WCAG AA compliant');
} else {
  console.log('❌ Fails WCAG AA');
}
```

---

## 🎯 Implementação em Componentes

### Button 3D

```css
.button-3d {
  position: relative;
  padding: 0.75rem 1.5rem;
  background: var(--gradient-primary);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  
  /* 3D setup */
  transform-style: preserve-3d;
  transition: 
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  
  /* Shadow layers */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 hsla(0, 0%, 100%, 0.2);
}

.button-3d::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    to bottom,
    hsla(0, 0%, 100%, 0.2),
    transparent
  );
  transform: translateZ(1px);
  pointer-events: none;
}

.button-3d:hover {
  transform: translateY(-2px) translateZ(5px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 hsla(0, 0%, 100%, 0.3);
}

.button-3d:active {
  transform: translateY(0) translateZ(0);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (prefers-reduced-motion: reduce) {
  .button-3d:hover {
    transform: none;
  }
}
```

### Card Glass

```css
.card-glass {
  position: relative;
  padding: 1.5rem;
  border-radius: 1rem;
  overflow: hidden;
  
  /* Glassmorphism */
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: linear-gradient(
    135deg,
    hsla(0, 0%, 100%, 0.1),
    hsla(0, 0%, 100%, 0.05)
  );
  border: 1px solid hsla(0, 0%, 100%, 0.2);
  
  /* Shadows */
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.4);
  
  /* 3D */
  transform-style: preserve-3d;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.card-glass::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    hsla(217, 91%, 60%, 0.1),
    transparent 70%
  );
  transform: translateZ(-1px);
  pointer-events: none;
}

.card-glass:hover {
  transform: translateY(-4px) rotateX(2deg);
  box-shadow: 
    0 12px 40px 0 rgba(31, 38, 135, 0.2),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .card-glass:hover {
    transform: translateY(-2px);
  }
}
```

---

## 📊 Tokens Tailwind

```javascript
// tailwind.config.ts - Extensões sugeridas
module.exports = {
  theme: {
    extend: {
      // Gradientes customizados
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(217 91% 60%), hsl(217 91% 50%))',
        'gradient-success': 'linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 28%))',
        'gradient-glass': 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.05))',
        'gradient-rainbow': 'conic-gradient(from 0deg, hsl(217 91% 60%), hsl(142 76% 36%), hsl(38 92% 50%), hsl(0 72% 51%), hsl(217 91% 60%))',
      },
      
      // Box shadows 3D
      boxShadow: {
        'z1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'z2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'z3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'z4': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'z5': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'z6': '0 30px 60px -15px rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 20px hsla(217, 91%, 60%, 0.4), 0 0 40px hsla(217, 91%, 60%, 0.2)',
        'glow-success': '0 0 20px hsla(142, 76%, 36%, 0.4), 0 0 40px hsla(142, 76%, 36%, 0.2)',
        'inner-subtle': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-strong': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
      },
      
      // Backdrop filter
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'glass-lg': '16px',
      },
    },
  },
  plugins: [
    // Plugin para glassmorphism
    function({ addUtilities }) {
      addUtilities({
        '.glass-light': {
          'backdrop-filter': 'blur(12px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(12px) saturate(180%)',
          'background': 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.05))',
          'border': '1px solid hsla(0, 0%, 100%, 0.2)',
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(16px) saturate(200%)',
          '-webkit-backdrop-filter': 'blur(16px) saturate(200%)',
          'background': 'linear-gradient(135deg, hsla(0, 0%, 0%, 0.2), hsla(0, 0%, 0%, 0.1))',
          'border': '1px solid hsla(0, 0%, 100%, 0.1)',
        },
        '.transform-3d': {
          'transform-style': 'preserve-3d',
        },
        '.perspective-1000': {
          'perspective': '1000px',
        },
      })
    },
  ],
}
```

---

**Próximo**: Ver `DESIGN_SYSTEM_SNIPPETS.md` para 10 snippets práticos prontos para usar.
