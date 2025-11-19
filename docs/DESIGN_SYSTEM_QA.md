# Checklist de QA & Plano de Rollout

## ✅ Checklist de Qualidade

### 1. Contraste & Acessibilidade

#### WCAG AA (Mínimo) - Obrigatório
- [ ] Texto normal tem contraste ≥ 4.5:1 com fundo
- [ ] Texto grande (≥18pt ou 14pt bold) tem contraste ≥ 3:1
- [ ] Componentes UI (botões, inputs) têm contraste ≥ 3:1
- [ ] Ícones e gráficos têm contraste ≥ 3:1
- [ ] Estados de foco são claramente visíveis
- [ ] Estados de hover têm indicação visual clara

#### WCAG AAA (Recomendado) - Opcional
- [ ] Texto normal tem contraste ≥ 7:1 com fundo
- [ ] Texto grande tem contraste ≥ 4.5:1 com fundo

#### Ferramentas de Teste
```bash
# Chrome DevTools
1. Inspecionar elemento
2. Lighthouse → Accessibility
3. Verificar "Contrast ratio"

# Firefox DevTools
1. Inspecionar elemento
2. Accessibility Inspector
3. Check for Accessibility Issues

# Extensões
- WAVE (Web Accessibility Evaluation Tool)
- axe DevTools
- Contrast Checker
```

**Casos Críticos de Contraste:**
| Elemento | Light Mode | Dark Mode | Status |
|----------|------------|-----------|--------|
| Texto primário | 13.2:1 ✅ | 15.1:1 ✅ | Pass |
| Primary button | 5.1:1 ✅ | 8.2:1 ✅ | Pass |
| Accent/Success | 4.6:1 ✅ | 6.1:1 ✅ | Pass |
| Error text | 5.8:1 ✅ | 7.2:1 ✅ | Pass |
| Texto secundário | 4.7:1 ✅ | 5.8:1 ✅ | Pass |

---

### 2. Touch Targets

- [ ] Todos os botões têm ≥ 44×44px (WCAG 2.1 AAA)
- [ ] Espaçamento entre targets ≥ 8px
- [ ] Links em texto têm ≥ 48px de altura (com padding)
- [ ] Checkbox/radio buttons são ≥ 44×44px (incluindo label)
- [ ] Ícones interativos são ≥ 44×44px
- [ ] Elementos em mobile são maiores ou têm padding extra

**Medições:**
```javascript
// Script para verificar touch targets
document.querySelectorAll('button, a, input, [role="button"]').forEach(el => {
  const rect = el.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  if (width < 44 || height < 44) {
    console.warn('Touch target too small:', el, `${width}x${height}px`);
  }
});
```

---

### 3. Performance Visual

#### Core Web Vitals
- [ ] **LCP (Largest Contentful Paint)** < 2.5s
  - Otimizar imagens above-the-fold
  - Preload fonts críticas
  - Minimizar render-blocking resources

- [ ] **FID (First Input Delay)** < 100ms
  - Usar `will-change` com moderação
  - Evitar JavaScript pesado no main thread
  - Debounce/throttle event handlers

- [ ] **CLS (Cumulative Layout Shift)** < 0.1
  - Definir dimensões de imagens
  - Reservar espaço para conteúdo dinâmico
  - Evitar inserção de conteúdo above-the-fold

#### Animation Performance
- [ ] Animações usam apenas `transform` e `opacity`
- [ ] `will-change` é usado apenas quando necessário
- [ ] Elementos animados têm `contain: layout style paint`
- [ ] GPU acceleration ativada com `translateZ(0)`
- [ ] Não há repaint/reflow em scroll

**Ferramentas:**
```bash
# Chrome DevTools
1. Performance tab → Record
2. Verificar FPS (deve ser 60fps)
3. Layers → ver composite layers
4. Rendering → Paint flashing

# Lighthouse
npx lighthouse https://your-site.com --view
# Verificar Performance score > 90
```

---

### 4. Reduced Motion

- [ ] `@media (prefers-reduced-motion: reduce)` implementado
- [ ] Animações são desabilitadas ou simplificadas
- [ ] Transições são reduzidas para < 100ms
- [ ] Parallax/scroll effects são desabilitados
- [ ] Funcionalidade permanece intacta

**Teste:**
```css
/* Verificar implementação */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Teste Manual:**
```bash
# macOS
System Preferences → Accessibility → Display → Reduce motion

# Windows
Settings → Ease of Access → Display → Show animations

# Browser DevTools
Chrome: Rendering → Emulate CSS media feature prefers-reduced-motion
```

---

### 5. Responsividade

#### Breakpoints Testados
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12/13)
- [ ] 425px (Large phone)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro / Laptop)
- [ ] 1440px (Desktop)
- [ ] 1920px (Large desktop)

#### Verificações
- [ ] Nenhum overflow horizontal em qualquer breakpoint
- [ ] Texto legível sem zoom em 320px
- [ ] Imagens responsivas com `srcset` ou `clamp()`
- [ ] Grids colapsam corretamente
- [ ] Sidebar funciona em mobile (offcanvas ou hidden)
- [ ] Tabelas têm scroll horizontal ou view alternativa
- [ ] Cards/modais têm padding responsivo

**Script de Teste:**
```javascript
// Tester de breakpoints
const breakpoints = [320, 375, 425, 768, 1024, 1440, 1920];
breakpoints.forEach(width => {
  window.resizeTo(width, 800);
  console.log(`Testing ${width}px`);
  // Verificar overflow
  const overflow = document.body.scrollWidth > window.innerWidth;
  if (overflow) {
    console.error(`Horizontal overflow at ${width}px!`);
  }
});
```

---

### 6. Glassmorphism & Backdrop Filter

- [ ] `backdrop-filter` tem fallback para browsers antigos
- [ ] Contraste adequado em elementos glass
- [ ] Não há texto ilegível em backgrounds glass
- [ ] Performance aceitável (não causa lag)
- [ ] Funciona em dark mode

**Fallback:**
```css
.glass {
  background: hsla(0, 0%, 100%, 0.9);
}

@supports (backdrop-filter: blur(12px)) {
  .glass {
    backdrop-filter: blur(12px) saturate(180%);
    background: hsla(0, 0%, 100%, 0.7);
  }
}
```

---

### 7. Dark Mode

- [ ] Todas as cores têm versão dark mode
- [ ] Contraste adequado em dark mode
- [ ] Glassmorphism funciona em dark mode
- [ ] Shadows visíveis em dark mode
- [ ] Transição suave entre modos
- [ ] Estado persistido (localStorage)

**Teste:**
```javascript
// Toggle dark mode para teste
document.documentElement.classList.toggle('dark');

// Verificar contraste
const elements = document.querySelectorAll('[class*="text-"]');
elements.forEach(el => {
  const color = getComputedStyle(el).color;
  const bg = getComputedStyle(el).backgroundColor;
  // Calcular contraste
});
```

---

### 8. Keyboard Navigation

- [ ] Todos os elementos interativos são focáveis
- [ ] Ordem de tab lógica
- [ ] Estados de foco claramente visíveis
- [ ] Modais podem ser fechados com ESC
- [ ] Dropdowns navegáveis com setas
- [ ] Skip links implementados

**Teste:**
```bash
# Navegar apenas com teclado
Tab      # Próximo elemento
Shift+Tab # Elemento anterior
Enter    # Ativar link/botão
Space    # Ativar checkbox/button
Esc      # Fechar modal/dropdown
↑↓       # Navegar dropdown/select
```

---

## 📋 Plano de Rollout por Componentes

### Fase 1: Low Risk (Semana 1) - 8 horas

**Componentes sem impacto crítico:**

#### 1.1 Badges (1h)
- [ ] Implementar badge-glow
- [ ] Testar variantes (success, warning, error)
- [ ] Verificar contraste
- **Rollback**: Revert para badge simples

#### 1.2 Tooltips (2h)
- [ ] Implementar tooltip-3d
- [ ] Testar posicionamento (top, bottom, left, right)
- [ ] Verificar acessibilidade (aria-label)
- **Rollback**: Usar tooltip padrão do browser

#### 1.3 Progress Bars (1h)
- [ ] Implementar animação smooth
- [ ] Testar indeterminate state
- [ ] Verificar performance
- **Rollback**: Barra estática

#### 1.4 Accordions (2h)
- [ ] Implementar smooth collapse
- [ ] Testar múltiplos items
- [ ] Verificar acessibilidade (aria-expanded)
- **Rollback**: Accordion básico

#### 1.5 Testes (2h)
- [ ] Teste manual em 3 browsers
- [ ] Lighthouse score
- [ ] Feedback da equipe

---

### Fase 2: Medium Risk (Semana 2) - 12 horas

**Componentes com impacto moderado:**

#### 2.1 Buttons (3h)
- [ ] Migrar para button-premium
- [ ] Atualizar todas as instâncias (buscar: `<Button`)
- [ ] Testar estados (hover, active, focus, disabled)
- [ ] Verificar touch targets
- **Rollback**: CSS override temporário

#### 2.2 Cards (3h)
- [ ] Migrar para card-glass
- [ ] Atualizar componentes Card existentes
- [ ] Testar parallax effect
- [ ] Verificar performance em listas longas
- **Rollback**: Card simples com shadow

#### 2.3 Inputs (3h)
- [ ] Implementar input-premium
- [ ] Migrar forms
- [ ] Testar validation states
- [ ] Verificar autofill styling
- **Rollback**: Input padrão com border

#### 2.4 Testes (3h)
- [ ] Teste em dispositivos reais
- [ ] A/B test se possível
- [ ] Métricas de performance
- [ ] User feedback

---

### Fase 3: High Risk (Semana 3) - 16 horas

**Componentes críticos:**

#### 3.1 Navbar (4h)
- [ ] Implementar navbar-glass
- [ ] Testar scroll behavior
- [ ] Verificar z-index com modals
- [ ] Performance em scroll
- **Rollback**: Navbar sólido

#### 3.2 Modals (4h)
- [ ] Implementar modal com backdrop blur
- [ ] Testar focus trap
- [ ] Verificar scroll lock
- [ ] Acessibilidade (aria-modal, role="dialog")
- **Rollback**: Modal padrão

#### 3.3 Dropdowns (4h)
- [ ] Implementar dropdown-3d
- [ ] Testar posicionamento automático
- [ ] Verificar keyboard navigation
- [ ] Click outside to close
- **Rollback**: Dropdown básico

#### 3.4 Testes & Deploy (4h)
- [ ] Smoke tests completos
- [ ] Cross-browser testing
- [ ] Performance benchmarks
- [ ] Deploy gradual (feature flag)

---

## 🚀 Estratégia de Rollout

### 1. Feature Flags

```typescript
// feature-flags.ts
export const DESIGN_SYSTEM_FLAGS = {
  PREMIUM_BUTTONS: true,
  GLASS_CARDS: true,
  GLASS_NAVBAR: false, // Gradual rollout
  BACKDROP_BLUR_MODALS: false,
  DROPDOWN_3D: false,
};

// Uso
import { DESIGN_SYSTEM_FLAGS } from './feature-flags';

export const Button = (props) => {
  return DESIGN_SYSTEM_FLAGS.PREMIUM_BUTTONS 
    ? <ButtonPremium {...props} />
    : <ButtonLegacy {...props} />;
};
```

### 2. A/B Testing

```typescript
// ab-testing.ts
export const useABTest = (testName: string) => {
  const userId = useUserId();
  const variant = userId % 2 === 0 ? 'A' : 'B';
  
  return {
    variant,
    isVariantA: variant === 'A',
    isVariantB: variant === 'B',
  };
};

// Uso
const { isVariantA } = useABTest('glass-cards');
return isVariantA ? <CardGlass /> : <CardLegacy />;
```

### 3. Monitoramento

```typescript
// analytics.ts
export const trackDesignSystemEvent = (
  component: string,
  action: string,
  properties?: Record<string, any>
) => {
  analytics.track('Design System Event', {
    component,
    action,
    timestamp: Date.now(),
    ...properties,
  });
};

// Uso
trackDesignSystemEvent('Button', 'Click', { variant: 'premium' });
trackDesignSystemEvent('Card', 'Hover', { type: 'glass' });
```

---

## 📊 Métricas de Sucesso

### Performance
| Métrica | Antes | Meta | Atual |
|---------|-------|------|-------|
| LCP | 3.2s | < 2.5s | - |
| FID | 120ms | < 100ms | - |
| CLS | 0.15 | < 0.1 | - |
| Lighthouse Performance | 78 | > 90 | - |

### Acessibilidade
| Métrica | Antes | Meta | Atual |
|---------|-------|------|-------|
| Lighthouse Accessibility | 85 | 100 | - |
| WCAG Compliance | AA parcial | AA completo | - |
| Keyboard Navigation | 70% | 100% | - |

### User Experience
| Métrica | Antes | Meta | Atual |
|---------|-------|------|-------|
| Time to Interactive | 4.5s | < 3.5s | - |
| Bounce Rate | 35% | < 30% | - |
| User Satisfaction | 7.2/10 | > 8.5/10 | - |

---

## 🔧 Troubleshooting

### Problema: Backdrop filter não funciona

**Causa**: Browser não suporta ou GPU desabilitada

**Solução:**
```css
.glass {
  background: hsla(0, 0%, 100%, 0.9);
}

@supports (backdrop-filter: blur(12px)) {
  .glass {
    backdrop-filter: blur(12px);
    background: hsla(0, 0%, 100%, 0.7);
  }
}
```

### Problema: Animações causam lag

**Causa**: Too many elements animating, repaint/reflow

**Solução:**
```css
/* Reduzir número de elementos animados */
/* Usar contain para isolamento */
.animated {
  contain: layout style paint;
  will-change: transform, opacity; /* Apenas quando necessário */
}

/* Remover will-change quando não estiver animando */
.animated:not(:hover):not(:focus) {
  will-change: auto;
}
```

### Problema: Contraste insuficiente

**Causa**: Cores muito próximas, glassmorphism mal configurado

**Solução:**
```css
/* Aumentar opacidade do background */
.glass {
  background: hsla(0, 0%, 100%, 0.95); /* De 0.7 para 0.95 */
}

/* Ajustar cor do texto */
.glass-text {
  color: hsl(222, 47%, 11%); /* Texto mais escuro */
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); /* Shadow para legibilidade */
}
```

### Problema: Touch targets muito pequenos

**Causa**: Padding insuficiente, tamanho fixo

**Solução:**
```css
/* Aumentar área clicável */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem; /* Em vez de valores fixos */
}

/* Usar pseudo-elemento para expandir área */
.icon-button::before {
  content: '';
  position: absolute;
  inset: -8px;
}
```

---

## ✅ Checklist Final Antes de Deploy

### Pre-Deploy
- [ ] Todos os testes de QA passaram
- [ ] Code review aprovado
- [ ] Performance benchmarks aceitáveis
- [ ] Acessibilidade validada (axe, WAVE)
- [ ] Cross-browser testing completo
- [ ] Mobile testing em dispositivos reais
- [ ] Feature flags configuradas
- [ ] Rollback plan documentado
- [ ] Monitoramento configurado

### Post-Deploy
- [ ] Verificar métricas de erro (Sentry, etc.)
- [ ] Monitorar Core Web Vitals
- [ ] Coletar user feedback
- [ ] Análise de A/B test (se aplicável)
- [ ] Ajustar baseado em dados
- [ ] Documentar learnings

---

**Última atualização**: 19/11/2025  
**Responsável**: Development Team  
**Review**: A cada fase completada
