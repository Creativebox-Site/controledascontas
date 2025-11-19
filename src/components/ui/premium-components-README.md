# Componentes Premium

Componentes React com efeitos 3D, glassmorphism e animações baseados nos snippets do DESIGN_SYSTEM_SNIPPETS.md.

## Componentes Disponíveis

### 1. ButtonPremium

Botão com efeitos 3D, gradientes e animações suaves.

**Props:**
- `variant`: "primary" | "success" | "sunset" | "ocean" | "glass"
- `size`: "sm" | "md" | "lg"
- `effect`: "subtle" | "default" | "strong"
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode

**Exemplo:**
```tsx
import { ButtonPremium } from "@/components/ui/button-premium";
import { Sparkles } from "lucide-react";

<ButtonPremium 
  variant="primary" 
  size="md" 
  effect="default"
  leftIcon={<Sparkles className="h-4 w-4" />}
>
  Click Me
</ButtonPremium>
```

---

### 2. CardGlass

Card com efeito glassmorphism, backdrop blur e animações 3D.

**Props:**
- `variant`: "light" | "dark" | "strong" | "gradient"
- `elevation`: "flat" | "low" | "medium" | "high" | "highest"
- `effect`: "none" | "subtle" | "default" | "strong"
- `padding`: "none" | "sm" | "md" | "lg"

**Sub-componentes:**
- `CardGlassHeader`
- `CardGlassTitle`
- `CardGlassDescription`
- `CardGlassContent`
- `CardGlassFooter`

**Exemplo:**
```tsx
import { 
  CardGlass, 
  CardGlassHeader, 
  CardGlassTitle, 
  CardGlassDescription,
  CardGlassContent,
  CardGlassFooter 
} from "@/components/ui/card-glass";

<CardGlass variant="light" elevation="medium" effect="default">
  <CardGlassHeader>
    <CardGlassTitle>Card Title</CardGlassTitle>
    <CardGlassDescription>Card description</CardGlassDescription>
  </CardGlassHeader>
  <CardGlassContent>
    Content goes here
  </CardGlassContent>
  <CardGlassFooter>
    Footer content
  </CardGlassFooter>
</CardGlass>
```

---

### 3. ModalBlur

Modal com backdrop blur configurável e efeito glassmorphism.

**Props:**
- `variant`: "default" | "glass" | "solid" | "gradient"
- `size`: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
- `blur`: "none" | "light" | "medium" | "strong" | "glass"

**Sub-componentes:**
- `ModalBlurTrigger`
- `ModalBlurContent`
- `ModalBlurHeader`
- `ModalBlurTitle`
- `ModalBlurDescription`
- `ModalBlurFooter`
- `ModalBlurClose`

**Exemplo:**
```tsx
import { 
  ModalBlur,
  ModalBlurTrigger,
  ModalBlurContent,
  ModalBlurHeader,
  ModalBlurTitle,
  ModalBlurDescription,
  ModalBlurFooter
} from "@/components/ui/modal-blur";

<ModalBlur>
  <ModalBlurTrigger asChild>
    <button>Open Modal</button>
  </ModalBlurTrigger>
  <ModalBlurContent variant="glass" size="md" blur="strong">
    <ModalBlurHeader>
      <ModalBlurTitle>Modal Title</ModalBlurTitle>
      <ModalBlurDescription>Description</ModalBlurDescription>
    </ModalBlurHeader>
    <div className="py-4">
      Content
    </div>
    <ModalBlurFooter>
      <button>Cancel</button>
      <button>Confirm</button>
    </ModalBlurFooter>
  </ModalBlurContent>
</ModalBlur>
```

---

### 4. Tooltip3D

Tooltip com efeitos 3D e múltiplas variantes visuais.

**Props:**
- `variant`: "default" | "glass" | "dark" | "gradient" | "success"
- `effect`: "none" | "subtle" | "default" | "strong"

**Componentes:**
- `Tooltip3DProvider` - Provider necessário (wrap parent)
- `Tooltip3D` - Root component
- `Tooltip3DTrigger` - Trigger element
- `Tooltip3DContent` - Content with styles

**Exemplo:**
```tsx
import { 
  Tooltip3DProvider,
  Tooltip3D,
  Tooltip3DTrigger,
  Tooltip3DContent 
} from "@/components/ui/tooltip-3d";

<Tooltip3DProvider>
  <Tooltip3D>
    <Tooltip3DTrigger asChild>
      <button>Hover me</button>
    </Tooltip3DTrigger>
    <Tooltip3DContent variant="glass" effect="default">
      Tooltip content
    </Tooltip3DContent>
  </Tooltip3D>
</Tooltip3DProvider>
```

---

## Demo Interativo

Acesse `/dashboard/premium-demo` para ver todos os componentes em ação com exemplos interativos.

## Tokens de Design

Todos os componentes utilizam os tokens CSS definidos em:
- `src/index.css` - Variáveis CSS
- `tailwind.config.ts` - Configuração Tailwind
- `design-tokens.json` - Definições estruturadas

### Classes Utilitárias Customizadas

#### Glassmorphism
- `.glass` - Efeito glassmorphism básico
- `.glass-strong` - Efeito glassmorphism intenso

#### 3D
- `.preserve-3d` - Mantém transformações 3D
- `.perspective` - Adiciona perspectiva (1000px)
- `.perspective-lg` - Perspectiva maior (2000px)
- `.backface-hidden` - Esconde back face em rotações

#### Elevações
- `.elevation-1` até `.elevation-6` - Sombras com profundidade crescente

#### Efeitos
- `.glow-hover` - Adiciona brilho no hover
- `.text-gradient-primary` - Texto com gradiente primário
- `.text-gradient-success` - Texto com gradiente de sucesso

---

## Acessibilidade

Todos os componentes incluem:
- ✅ Suporte a `prefers-reduced-motion`
- ✅ Focus visível com outline
- ✅ Navegação por teclado
- ✅ ARIA labels apropriados
- ✅ Suporte a temas (light/dark)

---

## Performance

- ✅ `will-change` para animações otimizadas
- ✅ `transform` e `opacity` para animações performáticas
- ✅ Transições desabilitadas em `prefers-reduced-motion`
- ✅ Lazy loading onde aplicável

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

**Nota:** Backdrop-filter requer suporte a `-webkit-backdrop-filter` para Safari.
