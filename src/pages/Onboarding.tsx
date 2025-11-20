import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ButtonPremium } from "@/components/ui/button-premium";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Wallet, TrendingUp, PieChart, Target, Bell, Sparkles, ChevronRight, Check } from "lucide-react";
import logoCreativeBox from "@/assets/logo-creative-box.png";

const steps = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao App Controle!",
    description: "Seu assistente pessoal para controle financeiro inteligente",
    content:
      "Gerencie suas finanças de forma simples e organizada. Vamos fazer um tour rápido pelas principais funcionalidades.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Wallet,
    title: "Transações e Lançamentos",
    description: "Registre receitas e despesas em segundos",
    content:
      "Adicione suas transações rapidamente, categorize gastos e acompanhe para onde vai seu dinheiro. Use categorias personalizadas ou as que já criamos para você!",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: PieChart,
    title: "Categorias Inteligentes",
    description: "Organize seus gastos por categoria",
    content:
      "Já criamos categorias essenciais para você começar: Alimentação, Transporte, Moradia e muito mais. Personalize ou crie novas conforme sua necessidade.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: TrendingUp,
    title: "Gráficos e Insights",
    description: "Visualize sua evolução financeira",
    content:
      "Acompanhe tendências, identifique gastos excessivos e tome decisões informadas com gráficos detalhados e análises automáticas.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Metas Financeiras",
    description: "Defina e alcance seus objetivos",
    content:
      "Crie metas de economia, planeje aquela viagem dos sonhos ou junte para uma compra importante. Acompanhe o progresso em tempo real!",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Bell,
    title: "Lembretes e Contas a Pagar",
    description: "Nunca mais esqueça um pagamento",
    content:
      "Configure lembretes para contas recorrentes, receba notificações antes do vencimento e mantenha suas contas em dia sem esforço.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    if (window.confirm("Tem certeza que deseja pular o tutorial? Você pode acessá-lo novamente nas configurações.")) {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);

        if (error) throw error;

        toast.success("Tutorial concluído! Bem-vindo ao App Contas 🎉");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Erro ao finalizar tutorial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center">
            <img src={logoCreativeBox} alt="Creative Box" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold">App Contas</h1>
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`p-6 rounded-2xl ${step.bgColor}`}>
                <Icon className={`h-16 w-16 ${step.color}`} />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="text-lg text-primary font-medium">{step.description}</p>
            </div>

            {/* Content */}
            <p className="text-center text-muted-foreground leading-relaxed">{step.content}</p>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 pt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                        ? "w-2 bg-primary/50"
                        : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <ButtonPremium variant="glass" onClick={handleSkip} className="flex-1" disabled={loading}>
                Pular Tutorial
              </ButtonPremium>

              <ButtonPremium onClick={handleNext} className="flex-1 gap-2" disabled={loading}>
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Começar
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </ButtonPremium>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Você pode acessar este tutorial novamente em Configurações → Ajuda
        </p>
      </div>
    </div>
  );
}
