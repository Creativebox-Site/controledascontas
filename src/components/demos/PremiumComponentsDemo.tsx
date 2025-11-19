import { useState } from "react";
import { ButtonPremium } from "@/components/ui/button-premium";
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassDescription, CardGlassContent, CardGlassFooter } from "@/components/ui/card-glass";
import { ModalBlur, ModalBlurContent, ModalBlurDescription, ModalBlurFooter, ModalBlurHeader, ModalBlurTitle, ModalBlurTrigger } from "@/components/ui/modal-blur";
import { Tooltip3D, Tooltip3DContent, Tooltip3DProvider, Tooltip3DTrigger } from "@/components/ui/tooltip-3d";
import { Sparkles, Heart, Zap, Rocket, Info } from "lucide-react";

/**
 * Demo de componentes premium com efeitos 3D e glassmorphism
 * Baseado nos snippets do DESIGN_SYSTEM_SNIPPETS.md
 */
export function PremiumComponentsDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Componentes Premium
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Componentes React com efeitos 3D, glassmorphism e animações suaves
        </p>
      </div>

      {/* ButtonPremium Showcase */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">ButtonPremium</h2>
        
        <CardGlass variant="light" elevation="medium">
          <CardGlassHeader>
            <CardGlassTitle>Variantes de Estilo</CardGlassTitle>
            <CardGlassDescription>
              Diferentes estilos de gradiente e efeitos visuais
            </CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent>
            <div className="flex flex-wrap gap-4">
              <ButtonPremium variant="primary" leftIcon={<Sparkles className="h-4 w-4" />}>
                Primary
              </ButtonPremium>
              <ButtonPremium variant="success" rightIcon={<Heart className="h-4 w-4" />}>
                Success
              </ButtonPremium>
              <ButtonPremium variant="sunset" leftIcon={<Zap className="h-4 w-4" />}>
                Sunset
              </ButtonPremium>
              <ButtonPremium variant="ocean" rightIcon={<Rocket className="h-4 w-4" />}>
                Ocean
              </ButtonPremium>
              <ButtonPremium variant="glass">
                Glass
              </ButtonPremium>
            </div>
          </CardGlassContent>
        </CardGlass>

        <CardGlass variant="dark" elevation="high">
          <CardGlassHeader>
            <CardGlassTitle>Tamanhos</CardGlassTitle>
            <CardGlassDescription>
              Três tamanhos responsivos disponíveis
            </CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonPremium size="sm" variant="primary">
                Small
              </ButtonPremium>
              <ButtonPremium size="md" variant="success">
                Medium
              </ButtonPremium>
              <ButtonPremium size="lg" variant="sunset">
                Large
              </ButtonPremium>
            </div>
          </CardGlassContent>
        </CardGlass>

        <CardGlass variant="strong" elevation="highest">
          <CardGlassHeader>
            <CardGlassTitle>Efeitos de Hover</CardGlassTitle>
            <CardGlassDescription>
              Diferentes intensidades de animação 3D
            </CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent>
            <div className="flex flex-wrap gap-4">
              <ButtonPremium effect="subtle" variant="primary">
                Subtle
              </ButtonPremium>
              <ButtonPremium effect="default" variant="success">
                Default
              </ButtonPremium>
              <ButtonPremium effect="strong" variant="ocean">
                Strong
              </ButtonPremium>
            </div>
          </CardGlassContent>
        </CardGlass>
      </section>

      {/* CardGlass Showcase */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">CardGlass</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardGlass variant="light" effect="subtle">
            <CardGlassHeader>
              <CardGlassTitle>Light Variant</CardGlassTitle>
              <CardGlassDescription>
                Card com glassmorphism leve
              </CardGlassDescription>
            </CardGlassHeader>
            <CardGlassContent>
              <p className="text-sm text-muted-foreground">
                Este card usa backdrop-blur e transparências para criar um efeito de vidro elegante.
              </p>
            </CardGlassContent>
          </CardGlass>

          <CardGlass variant="dark" effect="default">
            <CardGlassHeader>
              <CardGlassTitle>Dark Variant</CardGlassTitle>
              <CardGlassDescription>
                Card escuro com blur intenso
              </CardGlassDescription>
            </CardGlassHeader>
            <CardGlassContent>
              <p className="text-sm text-muted-foreground">
                Perfeito para overlays e elementos que precisam destacar-se sobre fundos claros.
              </p>
            </CardGlassContent>
          </CardGlass>

          <CardGlass variant="strong" effect="strong">
            <CardGlassHeader>
              <CardGlassTitle>Strong Variant</CardGlassTitle>
              <CardGlassDescription>
                Glass com efeito forte
              </CardGlassDescription>
            </CardGlassHeader>
            <CardGlassContent>
              <p className="text-sm text-muted-foreground">
                Maior opacidade e blur mais intenso para maior destaque visual.
              </p>
            </CardGlassContent>
          </CardGlass>

          <CardGlass variant="gradient" effect="strong" elevation="highest">
            <CardGlassHeader>
              <CardGlassTitle>Gradient Variant</CardGlassTitle>
              <CardGlassDescription>
                Card com gradiente de fundo
              </CardGlassDescription>
            </CardGlassHeader>
            <CardGlassContent>
              <p className="text-sm text-muted-foreground">
                Combina gradientes sutis com efeito de vidro para um visual premium.
              </p>
            </CardGlassContent>
          </CardGlass>
        </div>
      </section>

      {/* ModalBlur Showcase */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">ModalBlur</h2>
        
        <CardGlass variant="light">
          <CardGlassHeader>
            <CardGlassTitle>Modal com Backdrop Blur</CardGlassTitle>
            <CardGlassDescription>
              Modal moderno com efeito de desfoque no fundo
            </CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent>
            <div className="flex flex-wrap gap-4">
              <ModalBlur open={isOpen} onOpenChange={setIsOpen}>
                <ModalBlurTrigger asChild>
                  <ButtonPremium variant="primary">
                    Abrir Modal Glass
                  </ButtonPremium>
                </ModalBlurTrigger>
                <ModalBlurContent variant="glass" size="md" blur="strong">
                  <ModalBlurHeader>
                    <ModalBlurTitle>Modal Premium</ModalBlurTitle>
                    <ModalBlurDescription>
                      Este é um modal com glassmorphism e backdrop blur
                    </ModalBlurDescription>
                  </ModalBlurHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      O efeito de blur no fundo cria uma hierarquia visual clara e mantém o foco no conteúdo do modal.
                    </p>
                    <CardGlass variant="light" padding="sm" effect="subtle">
                      <p className="text-xs text-muted-foreground">
                        💡 Dica: Cards podem ser aninhados dentro de modals para criar layouts complexos
                      </p>
                    </CardGlass>
                  </div>
                  <ModalBlurFooter>
                    <ButtonPremium variant="glass" size="sm" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </ButtonPremium>
                    <ButtonPremium variant="primary" size="sm" onClick={() => setIsOpen(false)}>
                      Confirmar
                    </ButtonPremium>
                  </ModalBlurFooter>
                </ModalBlurContent>
              </ModalBlur>

              <ModalBlur>
                <ModalBlurTrigger asChild>
                  <ButtonPremium variant="success">
                    Modal Gradient
                  </ButtonPremium>
                </ModalBlurTrigger>
                <ModalBlurContent variant="gradient" size="lg" blur="glass">
                  <ModalBlurHeader>
                    <ModalBlurTitle>Modal com Gradiente</ModalBlurTitle>
                    <ModalBlurDescription>
                      Variante com fundo gradiente
                    </ModalBlurDescription>
                  </ModalBlurHeader>
                  <div className="py-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Diferentes variantes de blur no backdrop criam diferentes níveis de foco e profundidade.
                    </p>
                  </div>
                  <ModalBlurFooter>
                    <ButtonPremium variant="glass" size="sm">
                      Fechar
                    </ButtonPremium>
                  </ModalBlurFooter>
                </ModalBlurContent>
              </ModalBlur>
            </div>
          </CardGlassContent>
        </CardGlass>
      </section>

      {/* Tooltip3D Showcase */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Tooltip 3D</h2>
        
        <CardGlass variant="strong">
          <CardGlassHeader>
            <CardGlassTitle>Tooltips com Efeitos 3D</CardGlassTitle>
            <CardGlassDescription>
              Tooltips animados com glassmorphism e transformações 3D
            </CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent>
            <Tooltip3DProvider delayDuration={200}>
              <div className="flex flex-wrap gap-6">
                <Tooltip3D>
                  <Tooltip3DTrigger asChild>
                    <ButtonPremium variant="primary" size="sm">
                      Glass Tooltip
                    </ButtonPremium>
                  </Tooltip3DTrigger>
                  <Tooltip3DContent variant="glass" effect="default">
                    Tooltip com efeito glass
                  </Tooltip3DContent>
                </Tooltip3D>

                <Tooltip3D>
                  <Tooltip3DTrigger asChild>
                    <ButtonPremium variant="success" size="sm">
                      Gradient Tooltip
                    </ButtonPremium>
                  </Tooltip3DTrigger>
                  <Tooltip3DContent variant="gradient" effect="strong">
                    Tooltip com gradiente e efeito forte
                  </Tooltip3DContent>
                </Tooltip3D>

                <Tooltip3D>
                  <Tooltip3DTrigger asChild>
                    <ButtonPremium variant="sunset" size="sm">
                      Success Tooltip
                    </ButtonPremium>
                  </Tooltip3DTrigger>
                  <Tooltip3DContent variant="success" effect="default">
                    Tooltip de sucesso
                  </Tooltip3DContent>
                </Tooltip3D>

                <Tooltip3D>
                  <Tooltip3DTrigger asChild>
                    <div className="inline-flex items-center gap-2 cursor-pointer">
                      <Info className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Hover para info</span>
                    </div>
                  </Tooltip3DTrigger>
                  <Tooltip3DContent variant="dark" effect="subtle" side="top">
                    <div className="space-y-1">
                      <p className="font-semibold">Informação Adicional</p>
                      <p className="text-xs opacity-90">
                        Tooltips 3D podem conter conteúdo rico e formatado
                      </p>
                    </div>
                  </Tooltip3DContent>
                </Tooltip3D>
              </div>
            </Tooltip3DProvider>
          </CardGlassContent>
          <CardGlassFooter>
            <p className="text-xs text-muted-foreground">
              💡 Passe o mouse sobre os elementos para ver os tooltips em ação
            </p>
          </CardGlassFooter>
        </CardGlass>
      </section>

      {/* Full Example */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Exemplo Completo</h2>
        
        <CardGlass variant="gradient" elevation="highest" effect="strong">
          <CardGlassHeader>
            <CardGlassTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Dashboard Premium
            </CardGlassTitle>
            <CardGlassDescription>
              Combinação de todos os componentes premium
            </CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CardGlass variant="light" padding="sm" effect="subtle">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">2.4K</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </CardGlass>
              <CardGlass variant="light" padding="sm" effect="subtle">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-accent">95%</p>
                  <p className="text-xs text-muted-foreground">Satisfaction</p>
                </div>
              </CardGlass>
              <CardGlass variant="light" padding="sm" effect="subtle">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-warning">48h</p>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                </div>
              </CardGlass>
            </div>
          </CardGlassContent>
          <CardGlassFooter className="justify-between">
            <Tooltip3DProvider>
              <Tooltip3D>
                <Tooltip3DTrigger asChild>
                  <ButtonPremium variant="glass" size="sm">
                    Ver Detalhes
                  </ButtonPremium>
                </Tooltip3DTrigger>
                <Tooltip3DContent variant="glass">
                  Clique para ver mais informações
                </Tooltip3DContent>
              </Tooltip3D>
            </Tooltip3DProvider>
            
            <ButtonPremium variant="primary" size="sm" leftIcon={<Rocket className="h-4 w-4" />}>
              Upgrade Now
            </ButtonPremium>
          </CardGlassFooter>
        </CardGlass>
      </section>
    </div>
  );
}
