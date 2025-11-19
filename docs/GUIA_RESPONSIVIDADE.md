# Guia Rápido de Responsividade

## 🚀 Como Usar os Novos Componentes

### 1. Hook useMediaQuery
```tsx
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/use-media-query';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

### 2. ResponsiveContainer
```tsx
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

function MyPage() {
  return (
    <ResponsiveContainer maxWidth="lg">
      <h1>Meu Conteúdo</h1>
      {/* Padding e max-width automáticos */}
    </ResponsiveContainer>
  );
}
```

### 3. ResponsiveCard
```tsx
import { ResponsiveCard } from '@/components/ResponsiveCard';
import { Button } from '@/components/ui/button';

function FinanceCard() {
  return (
    <ResponsiveCard 
      title="Receitas Mensais"
      description="Últimos 30 dias"
      dense // Usa padding menor em mobile
      headerAction={
        <Button size="sm">Editar</Button>
      }
    >
      <p>R$ 5.000,00</p>
    </ResponsiveCard>
  );
}
```

### 4. OptimizedImage
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

function Hero() {
  return (
    <OptimizedImage
      src="/assets/cover-finance-1.jpg"
      alt="Dashboard financeiro"
      aspectRatio="video"
      priority // Para imagens above-the-fold
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
```

### 5. ResponsiveTable
```tsx
import { ResponsiveTable } from '@/components/ResponsiveTable';

function TransactionTable({ transactions }) {
  return (
    <ResponsiveTable
      columns={[
        { key: 'description', label: 'Descrição' },
        { key: 'amount', label: 'Valor' },
        { key: 'date', label: 'Data', hideOnMobile: true },
        { key: 'category', label: 'Categoria', hideOnTablet: true },
      ]}
      data={transactions}
      renderCell={(item, col) => {
        if (col.key === 'amount') {
          return formatCurrency(item.amount);
        }
        return item[col.key];
      }}
      renderMobileCard={(item) => (
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">{item.description}</span>
            <span className="text-lg">{formatCurrency(item.amount)}</span>
          </div>
          <div className="text-sm text-muted-foreground">{item.date}</div>
        </div>
      )}
    />
  );
}
```

---

## 🎨 Tokens CSS - Como Usar

### Tipografia Fluida
```tsx
// Antes (tamanho fixo)
<h1 className="text-3xl">Título</h1>

// Depois (tamanho fluido - ajusta entre 30-40px)
<h1 className="text-3xl leading-tight">Título</h1>
```

### Espaçamentos Responsivos
```tsx
// Antes (espaçamento fixo)
<div className="space-y-6">

// Depois (espaçamento fluido - 24-40px)
<div className="space-y-section">

// Outros espaçamentos
<div className="space-y-card-gap">  // 16-24px
<div className="space-y-element">   // 12-20px
```

### Padding Responsivo
```tsx
// Antes
<Card className="p-6">

// Depois
<Card className="p-responsive">  // 16px mobile → 24px desktop
```

### Touch Targets
```tsx
// Garante 44x44px mínimo
<Button className="touch-target">
  Clique Aqui
</Button>

// 48x48px para maior conforto
<Button className="touch-target-comfortable">
  Ação Principal
</Button>
```

---

## 📏 Breakpoints do Projeto

```typescript
const breakpoints = {
  xs: 475px,   // Smartphones pequenos em paisagem
  sm: 640px,   // Smartphones grandes
  md: 768px,   // Tablets
  lg: 1024px,  // Laptops
  xl: 1280px,  // Desktops
  2xl: 1536px  // Telas grandes
};
```

### Como Usar
```tsx
// Classes do Tailwind
<div className="grid-cols-1 md:grid-cols-3 xl:grid-cols-5">

// No CSS
@media (min-width: 768px) {
  /* Estilos para tablet+ */
}
```

---

## ✅ Checklist de Responsividade

Antes de fazer commit, verifique:

- [ ] **Tipografia**: Usei classes de fonte fluida (`text-*` com tokens CSS)
- [ ] **Touch Targets**: Botões têm pelo menos 44×44px
- [ ] **Padding**: Usei `p-responsive` ou tokens de espaçamento
- [ ] **Grids**: Testei em pelo menos 3 breakpoints (mobile, tablet, desktop)
- [ ] **Imagens**: Usei `OptimizedImage` com lazy loading
- [ ] **Tabelas**: Usei `ResponsiveTable` ou adicionei scroll horizontal
- [ ] **Overflow**: Nenhum conteúdo cortado horizontalmente
- [ ] **Teste**: Verifiquei no Chrome DevTools em 320px e 1920px

---

## 🐛 Problemas Comuns e Soluções

### Problema: Texto muito pequeno em mobile
**Solução**: Use tokens fluidos
```tsx
// ❌ Errado
<p className="text-sm">Texto</p>

// ✅ Correto
<p className="text-sm sm:text-base">Texto</p>
// Ou melhor ainda, deixe o token fazer o trabalho:
<p className="text-base">Texto</p> // Já é fluido!
```

### Problema: Botões muito pequenos para tocar
**Solução**: Use touch targets
```tsx
// ❌ Errado
<Button size="sm">Ação</Button>  // 36px de altura

// ✅ Correto
<Button size="sm" className="min-h-touch">Ação</Button>  // 44px mínimo
```

### Problema: Cards muito apertados em mobile
**Solução**: Use `ResponsiveCard` com `dense`
```tsx
// ❌ Errado
<Card className="p-6">  // Muito padding em mobile

// ✅ Correto
<ResponsiveCard dense>  // 12px mobile → 24px desktop
```

### Problema: Grid fica muito estreito em tablet
**Solução**: Use breakpoint intermediário
```tsx
// ❌ Errado
<div className="grid-cols-1 lg:grid-cols-5">  // Salto brusco

// ✅ Correto
<div className="grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
```

### Problema: Tabela não rola em mobile
**Solução**: Use `ResponsiveTable`
```tsx
// ❌ Errado
<table>...</table>  // Conteúdo cortado

// ✅ Correto
<ResponsiveTable
  columns={...}
  data={...}
  renderCell={...}
/>
```

---

## 📊 Testes Rápidos

### No Chrome DevTools
1. Abra DevTools (F12)
2. Ative o Device Toolbar (Ctrl+Shift+M)
3. Teste estes dispositivos:
   - iPhone SE (320×568)
   - iPhone 12 Pro (390×844)
   - iPad (768×1024)
   - Desktop (1920×1080)

### Comandos Úteis
```bash
# Ver no navegador em diferentes tamanhos
# Adicione ao package.json:
"scripts": {
  "dev:mobile": "vite --host",
  "test:responsive": "lighthouse http://localhost:5173 --view"
}
```

---

## 📚 Documentação Completa

Para análise detalhada, consulte:
- [`AUDITORIA_RESPONSIVIDADE.md`](./AUDITORIA_RESPONSIVIDADE.md) - Relatório completo
- [Tailwind Docs](https://tailwindcss.com/docs/responsive-design)
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

## 🤝 Contribuindo

Ao adicionar novos componentes:

1. **Use tokens CSS** ao invés de valores hardcoded
2. **Teste em 3+ breakpoints** antes de fazer commit
3. **Documente** comportamentos especiais
4. **Adicione exemplos** neste guia se necessário

---

**Última atualização**: 19/11/2025
