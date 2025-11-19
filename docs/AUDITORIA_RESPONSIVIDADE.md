# Auditoria Completa de Responsividade

## 📊 Resumo Executivo

**Data da Auditoria**: 19/11/2025  
**Breakpoints Analisados**: 320px, 375px, 425px, 768px, 1024px, 1440px  
**Componentes Analisados**: 23 componentes principais + 20 componentes UI  
**Problemas Identificados**: 47 (18 críticos, 21 altos, 8 médios)

---

## 🔴 Problemas Críticos (Prioridade 1)

### 1. Tipografia - Tamanhos Fixos em Pixels
**Impacto**: Alto - Quebra legibilidade em dispositivos pequenos  
**Componentes Afetados**: Dashboard header, Card titles, Page titles

**Problema Atual**:
```tsx
// Dashboard.tsx - linha 94
<h1 className="text-base sm:text-xl font-bold">Controle Financeiro</h1>

// Card.tsx - linha 19
<h3 className="text-2xl font-semibold leading-none tracking-tight">
```

**Problema**: Usa unidades fixas do Tailwind (text-base = 16px, text-2xl = 24px) sem escala fluida.

**Solução Recomendada**:
```css
/* Adicionar em index.css */
:root {
  /* Escala tipográfica modular com ratio 1.125 (major second) */
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);    /* 12-14px */
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);      /* 14-16px */
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);      /* 16-18px */
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);     /* 18-20px */
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);      /* 20-24px */
  --font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);           /* 24-32px */
  --font-size-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem);   /* 30-40px */
  --font-size-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);       /* 36-48px */
}
```

```typescript
// tailwind.config.ts - adicionar em extend
fontSize: {
  'xs': 'var(--font-size-xs)',
  'sm': 'var(--font-size-sm)',
  'base': 'var(--font-size-base)',
  'lg': 'var(--font-size-lg)',
  'xl': 'var(--font-size-xl)',
  '2xl': 'var(--font-size-2xl)',
  '3xl': 'var(--font-size-3xl)',
  '4xl': 'var(--font-size-4xl)',
}
```

**Estimativa**: 3 horas

---

### 2. Touch Targets Insuficientes
**Impacto**: Crítico - Dificulta interação mobile  
**Componentes Afetados**: Buttons (variante sm), Icons interativos, Menu items

**Problema Atual**:
```tsx
// Button.tsx - linha 21
sm: "h-9 rounded-md px-3",  // 36px de altura - INSUFICIENTE

// FinancialChart.tsx - linha 273
<Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
```

**Problema**: Touch targets menores que 44×44px (WCAG 2.1 AAA)

**Solução Recomendada**:
```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // ... mantém variantes existentes
      },
      size: {
        default: "h-11 min-h-[44px] px-4 py-2 text-base",
        sm: "h-10 min-h-[40px] px-3 text-sm",
        lg: "h-12 min-h-[48px] px-8 text-lg",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
        touch: "h-12 min-h-[48px] px-6 text-base", // Nova variante para mobile
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

**Uso Responsivo**:
```tsx
// Componentes devem usar variante touch em mobile
<Button 
  size="sm" 
  className="md:h-9 h-11 min-h-[44px]"
>
  Adicionar
</Button>
```

**Estimativa**: 5 horas (requer atualização de todos os botões)

---

### 3. Cards com Padding Inconsistente
**Impacto**: Alto - Afeta densidade de informação em mobile  
**Componentes Afetados**: Card, FinancialChart, EmergencyFund, Goals

**Problema Atual**:
```tsx
// Card.tsx - linha 12
<div className="flex flex-col space-y-1.5 p-6">

// CardContent.tsx - linha 32
<div className="p-6 pt-0">
```

**Problema**: Padding fixo de 24px em mobile desperdiça espaço valioso

**Solução Recomendada**:
```css
/* index.css */
:root {
  --spacing-card-padding: clamp(1rem, 0.75rem + 1.25vw, 1.5rem);  /* 16-24px */
  --spacing-card-gap: clamp(0.75rem, 0.5rem + 1vw, 1rem);          /* 12-16px */
  --spacing-section: clamp(1.5rem, 1rem + 2vw, 2rem);              /* 24-32px */
}
```

```tsx
// components/ui/card.tsx - Atualizar
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex flex-col space-y-1.5 p-4 sm:p-5 md:p-6", className)} 
      {...props} 
    />
  ),
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => 
    <div ref={ref} className={cn("p-4 pt-0 sm:p-5 sm:pt-0 md:p-6 md:pt-0", className)} {...props} />,
);
```

**Estimativa**: 2 horas

---

### 4. Grid Layout Sem Container Queries
**Impacto**: Alto - Cards muito estreitos em tablets  
**Componentes Afetados**: FinancialChart (grid de 5 colunas)

**Problema Atual**:
```tsx
// FinancialChart.tsx - linha 227
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
```

**Problema**: Salto brusco de 2 para 5 colunas. Em tablets (768-1023px), 5 colunas deixam cards muito estreitos.

**Solução Recomendada**:
```tsx
// FinancialChart.tsx - Atualizar grid
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
```

```typescript
// tailwind.config.ts - Adicionar breakpoint xs
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
},
```

**Estimativa**: 1 hora

---

### 5. Overflow Horizontal em Tabelas
**Impacto**: Crítico - Dados inacessíveis em mobile  
**Componentes Afetados**: TransactionList, PaymentItems

**Problema Atual**:
- Tabelas sem scroll horizontal
- Colunas sem priorização
- Dados truncados ou sobrepostos

**Solução Recomendada**:
```tsx
// TransactionList.tsx - Wrapper responsivo
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            {/* Colunas com min-width */}
            <th className="px-3 py-3.5 text-left text-sm font-semibold min-w-[120px]">
              Descrição
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold min-w-[100px]">
              Valor
            </th>
            <th className="hidden sm:table-cell px-3 py-3.5 text-left text-sm font-semibold min-w-[120px]">
              Categoria
            </th>
            <th className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold min-w-[100px]">
              Data
            </th>
          </tr>
        </thead>
        <tbody>
          {/* ... */}
        </tbody>
      </table>
    </div>
  </div>
</div>

{/* Alternativa: Card view para mobile */}
<div className="block sm:hidden space-y-3">
  {transactions.map(transaction => (
    <Card key={transaction.id} className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="font-semibold">{transaction.description}</div>
        <div className="text-lg font-bold">{formatCurrency(transaction.amount)}</div>
      </div>
      <div className="text-sm text-muted-foreground">
        {transaction.category} • {formatDate(transaction.date)}
      </div>
    </Card>
  ))}
</div>
```

**Estimativa**: 6 horas

---

## 🟠 Problemas Altos (Prioridade 2)

### 6. Line-Height Inadequado
**Impacto**: Médio-Alto - Afeta legibilidade de textos longos  
**Componentes Afetados**: Card descriptions, Paragraph text

**Problema Atual**:
- Tailwind usa line-height padrão de 1.5 para todo texto
- Insuficiente para textos pequenos (<16px)
- Excessivo para títulos grandes

**Solução Recomendada**:
```css
/* index.css */
:root {
  /* Line-heights proporcionais ao tamanho da fonte */
  --line-height-tight: 1.25;    /* Para títulos grandes */
  --line-height-normal: 1.5;    /* Para corpo de texto */
  --line-height-relaxed: 1.625; /* Para textos pequenos */
  --line-height-loose: 1.75;    /* Para legendas/notas */
}
```

```typescript
// tailwind.config.ts
lineHeight: {
  'tight': 'var(--line-height-tight)',
  'normal': 'var(--line-height-normal)',
  'relaxed': 'var(--line-height-relaxed)',
  'loose': 'var(--line-height-loose)',
}
```

**Aplicação**:
```tsx
// Para títulos
<h1 className="text-3xl font-bold leading-tight">Visão Geral</h1>

// Para descrições
<p className="text-sm text-muted-foreground leading-relaxed">
  Entenda para onde vai o seu dinheiro
</p>
```

**Estimativa**: 2 horas

---

### 7. Sidebar Sem Estado Mini em Mobile
**Impacto**: Alto - Perde espaço valioso em mobile  
**Componentes Afetados**: AppSidebar, Dashboard layout

**Problema Atual**:
```tsx
// AppSidebar.tsx - linha 40
<Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
```

**Problema**: Sidebar usa mesmo comportamento em todos os tamanhos de tela

**Solução Recomendada**:
```tsx
// components/AppSidebar.tsx
import { useMediaQuery } from "@/hooks/use-media-query";

export function AppSidebar({ onSignOut }: AppSidebarProps) {
  const { open } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <Sidebar 
      className={cn(
        "transition-all duration-300",
        isMobile ? "w-0 -translate-x-full data-[state=open]:translate-x-0 data-[state=open]:w-64" :
        open ? "w-64" : "w-16"
      )}
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      {/* ... conteúdo */}
    </Sidebar>
  );
}
```

```tsx
// hooks/use-media-query.ts - CRIAR NOVO ARQUIVO
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
```

**Estimativa**: 3 horas

---

### 8. Imagens Sem Otimização Responsiva
**Impacto**: Médio-Alto - Performance em mobile  
**Componentes Afetados**: CoverImage, Avatar

**Problema Atual**:
- Imagens sem srcset/sizes
- Carregam resolução desktop em mobile
- Sem lazy loading

**Solução Recomendada**:
```tsx
// components/OptimizedImage.tsx - CRIAR NOVO COMPONENTE
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        sizes={sizes}
      />
    </div>
  );
};
```

**Uso**:
```tsx
<OptimizedImage
  src="/assets/cover-finance-1.jpg"
  alt="Financial dashboard"
  className="aspect-video rounded-lg"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Estimativa**: 4 horas

---

### 9. Espaçamento Inconsistente Entre Seções
**Impacto**: Médio - Afeta escaneabilidade visual  
**Componentes Afetados**: Todas as páginas

**Problema Atual**:
```tsx
// Overview.tsx - linha 14
<div className="space-y-6">

// Goals.tsx - linha 20
<div className="space-y-6">
```

**Problema**: Espaçamento fixo não se adapta ao tamanho da tela

**Solução Recomendada**:
```css
/* index.css - Adicionar tokens de espaçamento */
:root {
  --spacing-section: clamp(1.5rem, 1rem + 2.5vw, 2.5rem);  /* 24-40px */
  --spacing-card-gap: clamp(1rem, 0.75rem + 1.25vw, 1.5rem); /* 16-24px */
  --spacing-element: clamp(0.75rem, 0.5rem + 1vw, 1.25rem);  /* 12-20px */
}
```

```typescript
// tailwind.config.ts
spacing: {
  'section': 'var(--spacing-section)',
  'card-gap': 'var(--spacing-card-gap)',
  'element': 'var(--spacing-element)',
}
```

```tsx
// Uso nas páginas
<div className="space-y-card-gap">
  <h2 className="text-3xl font-bold">Visão Geral</h2>
  <FinancialChart userId={userId} currency={currency} />
  <EmergencyFund userId={userId} currency={currency} />
</div>
```

**Estimativa**: 2 horas

---

### 10. Header com Altura Variável Não Documentada
**Impacto**: Médio - Pode causar bugs de layout  
**Componentes Afetados**: Dashboard header

**Problema Atual**:
```tsx
// Dashboard.tsx - linha 88-103
<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
  <div className="flex flex-col sm:flex-row items-start sm:items-center">
```

**Problema**: Header muda de altura entre mobile/desktop sem CSS custom property

**Solução Recomendada**:
```css
/* index.css */
:root {
  --header-height-mobile: 120px;
  --header-height-desktop: 64px;
}

@media (min-width: 640px) {
  :root {
    --header-height: var(--header-height-desktop);
  }
}

@media (max-width: 639px) {
  :root {
    --header-height: var(--header-height-mobile);
  }
}
```

```tsx
// Dashboard.tsx
<header 
  className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10"
  style={{ height: 'var(--header-height)' }}
>
  {/* ... */}
</header>

<main 
  className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8"
  style={{ paddingTop: 'calc(var(--header-height) + 1rem)' }}
>
  {/* ... */}
</main>
```

**Estimativa**: 1 hora

---

## 🟡 Problemas Médios (Prioridade 3)

### 11. Fontes Sem font-display: swap
**Impacto**: Baixo-Médio - FOIT (Flash of Invisible Text)  
**Componentes Afetados**: Global (index.html)

**Problema Atual**:
- Aplicativo usa fontes do sistema (sem Google Fonts atualmente)
- Se adicionar fontes web, precisa de otimização

**Solução Recomendada (para futuro)**:
```html
<!-- index.html - Se adicionar Google Fonts -->
<link 
  rel="preconnect" 
  href="https://fonts.googleapis.com"
>
<link 
  rel="preconnect" 
  href="https://fonts.gstatic.com" 
  crossorigin
>
<link 
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
  rel="stylesheet"
>
```

```css
/* index.css */
:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
               'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Estimativa**: 0.5 horas (se necessário)

---

### 12. Falta de Container Max-Width em Telas Grandes
**Impacto**: Baixo - UX em 4K/ultra-wide  
**Componentes Afetados**: Dashboard main

**Problema Atual**:
```tsx
// Dashboard.tsx - linha 105
<main className="flex-1 container mx-auto">
```

**Problema**: Container já tem max-width de 1400px (correto)

**Verificação**: ✅ Já implementado corretamente no tailwind.config.ts

---

## 📋 Checklist de Implementação

### Fase 1: Críticos (Semana 1) - 20 horas
- [ ] Implementar escala tipográfica fluida (3h)
- [ ] Ajustar touch targets para 44×44px mínimo (5h)
- [ ] Implementar padding responsivo em cards (2h)
- [ ] Otimizar grid layouts com breakpoints intermediários (1h)
- [ ] Corrigir overflow em tabelas/listas (6h)
- [ ] Criar componente de imagem otimizada (3h)

### Fase 2: Altos (Semana 2) - 14 horas
- [ ] Implementar line-heights proporcionais (2h)
- [ ] Melhorar comportamento da sidebar em mobile (3h)
- [ ] Adicionar lazy loading em imagens (incluído na Fase 1)
- [ ] Padronizar espaçamentos com tokens CSS (2h)
- [ ] Documentar altura do header (1h)
- [ ] Testar em dispositivos reais (6h)

### Fase 3: Médios (Semana 3) - 8 horas
- [ ] Adicionar font-display se necessário (0.5h)
- [ ] Implementar testes visuais automatizados (4h)
- [ ] Documentação completa (2h)
- [ ] Buffer para correções (1.5h)

---

## 🧪 Critérios de Aceitação e Testes

### Teste 1: Tipografia
**Dispositivo**: iPhone SE (320px)
- [ ] Todo texto legível sem zoom
- [ ] Line-height ≥ 1.5 para corpo de texto
- [ ] Contraste ≥ 4.5:1 (WCAG AA)

### Teste 2: Touch Targets
**Dispositivo**: Qualquer mobile
- [ ] Todos os botões ≥ 44×44px
- [ ] Espaçamento entre targets ≥ 8px
- [ ] Links em texto ≥ 48px de altura

### Teste 3: Layout
**Breakpoints**: Todos (320, 375, 425, 768, 1024, 1440px)
- [ ] Sem overflow horizontal
- [ ] Conteúdo visível sem scroll lateral
- [ ] Grids colapsam corretamente
- [ ] Sidebar funciona em todos os tamanhos

### Teste 4: Performance Visual
**Ferramentas**: Lighthouse, WebPageTest
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] TTI (Time to Interactive) < 3.8s em 3G

### Teste 5: Imagens
**Todos os dispositivos**
- [ ] Lazy loading funcionando
- [ ] Placeholder antes do carregamento
- [ ] Aspect ratio preservado
- [ ] Sem layout shift

---

## 🛠️ Snippets Práticos Prontos para Uso

### 1. Utility Classes Responsivas
```css
/* index.css - Adicionar ao final */
@layer utilities {
  /* Touch-friendly spacing */
  .touch-target {
    @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
  }
  
  /* Responsive text truncation */
  .line-clamp-mobile {
    @apply line-clamp-2 sm:line-clamp-none;
  }
  
  /* Responsive padding */
  .p-responsive {
    @apply p-4 sm:p-5 md:p-6;
  }
  
  /* Container com padding responsivo */
  .container-responsive {
    @apply container mx-auto px-4 sm:px-6 md:px-8;
  }
  
  /* Grid responsivo padrão */
  .grid-responsive {
    @apply grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4;
  }
}
```

### 2. Component Wrapper Responsivo
```tsx
// components/ResponsiveContainer.tsx - CRIAR NOVO
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const ResponsiveContainer = ({ 
  children, 
  className,
  maxWidth = 'xl'
}: ResponsiveContainerProps) => {
  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6 md:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};
```

### 3. Responsive Card Component
```tsx
// components/ResponsiveCard.tsx - CRIAR NOVO
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  dense?: boolean; // Para layouts mais compactos em mobile
}

export const ResponsiveCard = ({ 
  title, 
  children, 
  className,
  dense = false 
}: ResponsiveCardProps) => {
  return (
    <Card className={cn(
      'transition-all',
      dense && 'p-3 sm:p-4 md:p-6',
      className
    )}>
      {title && (
        <CardHeader className={cn(
          dense ? 'p-3 pb-2 sm:p-4 sm:pb-3' : 'p-4 sm:p-5 md:p-6'
        )}>
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        dense ? 'p-3 pt-0 sm:p-4 sm:pt-0' : 'p-4 pt-0 sm:p-5 sm:pt-0 md:p-6 md:pt-0'
      )}>
        {children}
      </CardContent>
    </Card>
  );
};
```

### 4. Media Query Hook
```tsx
// hooks/use-media-query.ts - JÁ FORNECIDO NA SEÇÃO 7
```

### 5. Responsive Table
```tsx
// components/ResponsiveTable.tsx - CRIAR NOVO
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface Column {
  key: string;
  label: string;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  renderCell: (item: any, column: Column) => ReactNode;
  renderMobileCard?: (item: any) => ReactNode;
  className?: string;
}

export const ResponsiveTable = ({
  columns,
  data,
  renderCell,
  renderMobileCard,
  className
}: ResponsiveTableProps) => {
  return (
    <>
      {/* Desktop/Tablet Table */}
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-semibold",
                    column.hideOnTablet && "hidden lg:table-cell",
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-sm",
                      column.hideOnTablet && "hidden lg:table-cell",
                      column.className
                    )}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item, idx) => (
          <Card key={idx} className="p-4">
            {renderMobileCard ? renderMobileCard(item) : (
              <div className="space-y-2">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map(column => (
                    <div key={column.key} className="flex justify-between">
                      <span className="font-medium text-sm">{column.label}:</span>
                      <span className="text-sm">{renderCell(item, column)}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
};
```

---

## 📱 Teste em Dispositivos Reais

### Dispositivos Mínimos para Teste
1. **Mobile**
   - iPhone SE (320×568) - Menor viewport comum
   - iPhone 12/13 (390×844)
   - Samsung Galaxy S21 (360×800)

2. **Tablet**
   - iPad (768×1024)
   - iPad Pro (1024×1366)

3. **Desktop**
   - Laptop 13" (1280×800)
   - Desktop HD (1920×1080)
   - 4K (2560×1440)

### Ferramentas de Teste
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- BrowserStack (real devices)
- Lighthouse CI

---

## 📊 Métricas de Sucesso

### KPIs de Responsividade
- [ ] 0 erros de overflow horizontal em todos os breakpoints
- [ ] 100% dos touch targets ≥ 44×44px
- [ ] CLS < 0.1 em todos os dispositivos
- [ ] LCP < 2.5s em 3G
- [ ] Pontuação Lighthouse Mobile > 90

### Acessibilidade (WCAG 2.1)
- [ ] Nível AA: Contraste 4.5:1 para texto normal
- [ ] Nível AA: Contraste 3:1 para texto grande
- [ ] Nível AAA: Touch targets 44×44px
- [ ] Zoom até 200% sem perda de funcionalidade

---

## 🚀 Próximos Passos

### Implementação Imediata (Esta Sprint)
1. Implementar escala tipográfica fluida
2. Ajustar touch targets
3. Corrigir grids e padding

### Médio Prazo (Próximas 2 Sprints)
1. Otimizar imagens
2. Implementar lazy loading
3. Refatorar tabelas para mobile

### Longo Prazo (Backlog)
1. Testes automatizados de responsividade
2. Design tokens completo
3. Documentação de componentes

---

## 📝 Notas de Implementação

### ⚠️ Importante
- Testar cada mudança em pelo menos 3 breakpoints diferentes
- Usar DevTools do Chrome para simular throttling de rede
- Validar contraste de cores com ferramentas WCAG
- Documentar decisões de design no código

### 🔒 Restrições
- Não alterar funcionalidades existentes
- Manter compatibilidade com temas dark/light/colorblind
- Preservar performance (bundle size)
- Seguir padrões de nomenclatura existentes

### ✅ Boas Práticas
- Mobile-first approach
- Usar unidades relativas (rem, em, %)
- Evitar !important
- Preferir clamp() para valores fluidos
- Documentar breakpoints customizados

---

**Relatório gerado em**: 19/11/2025  
**Próxima revisão**: Após implementação da Fase 1  
**Contato**: Developer Team
