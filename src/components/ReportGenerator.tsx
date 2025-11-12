import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, MessageCircle, Printer, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  generateReportPDF,
  downloadPDF,
  printPDF,
  shareViaWhatsApp,
  type ReportSection,
} from "@/lib/reportGenerator";

interface ReportGeneratorProps {
  userId?: string;
  currency: string;
}

const AVAILABLE_SECTIONS: ReportSection[] = [
  { id: "overview", label: "Visão Geral", selected: true },
  { id: "income", label: "Receitas", selected: true },
  { id: "expenses", label: "Despesas", selected: true },
  { id: "investments", label: "Investimentos", selected: true },
  { id: "goals", label: "Metas e Sonhos", selected: true },
  { id: "insights", label: "Insights Financeiros", selected: true },
];

export const ReportGenerator = ({ userId, currency }: ReportGeneratorProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<ReportSection[]>(AVAILABLE_SECTIONS);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [deliveryTab, setDeliveryTab] = useState<string>("preview");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [useRegisteredEmail, setUseRegisteredEmail] = useState(true);
  const [useRegisteredPhone, setUseRegisteredPhone] = useState(true);

  useEffect(() => {
    if (userId && open) {
      loadUserData();
      loadFinancialData();
    }
  }, [userId, open]);

  const loadUserData = async () => {
    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", userId)
      .single();

    if (profile) {
      setUserProfile(profile);
      setPhoneInput(profile.phone || "");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setEmailInput(user.email);
    }
  };

  const loadFinancialData = async () => {
    if (!userId) return;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
      }).format(value);
    };

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", userId);

    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId);

    if (transactions) {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const investments = transactions
        .filter((t) => t.type === "investment")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Despesas por categoria
      const categoryMap = new Map<string, { total: number; color: string }>();
      transactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          const name = t.categories?.name || "Sem categoria";
          const color = t.categories?.color || "#888888";
          if (categoryMap.has(name)) {
            categoryMap.get(name)!.total += Number(t.amount);
          } else {
            categoryMap.set(name, { total: Number(t.amount), color });
          }
        });

      const categoryExpenses = Array.from(categoryMap.entries())
        .map(([name, data]) => ({
          name,
          total: data.total,
          percentage: expense > 0 ? (data.total / expense) * 100 : 0,
          color: data.color,
        }))
        .sort((a, b) => b.total - a.total);

      // Dados mensais
      const monthlyMap = new Map<string, { income: number; expense: number; investment: number }>();
      transactions.forEach((t) => {
        const month = t.date.substring(0, 7);
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { income: 0, expense: 0, investment: 0 });
        }
        const data = monthlyMap.get(month)!;
        if (t.type === "income") data.income += Number(t.amount);
        else if (t.type === "expense") data.expense += Number(t.amount);
        else if (t.type === "investment") data.investment += Number(t.amount);
      });

      const monthlyData = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      // Preparar dados de transações
      const transactionData = transactions.slice(0, 50).map((t) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: Number(t.amount),
        type: t.type,
        category: t.categories?.name,
      }));

      // Preparar dados de metas
      const goalsData = goals?.map((g) => ({
        name: g.name,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount),
        target_date: g.target_date,
        icon: g.icon,
        progress: Math.min((Number(g.current_amount) / Number(g.target_amount)) * 100, 100),
      })) || [];

      // Gerar insights
      const insights: string[] = [];
      
      if (income > expense) {
        const savings = income - expense;
        const savingsRate = ((savings / income) * 100).toFixed(1);
        insights.push(`Você economizou ${savingsRate}% da sua renda este período. Excelente controle financeiro!`);
      } else if (expense > income) {
        const deficit = expense - income;
        insights.push(`Suas despesas superaram suas receitas em ${formatCurrency(deficit)}. Revise seus gastos para equilibrar o orçamento.`);
      }

      if (categoryExpenses.length > 0 && categoryExpenses[0].percentage > 40) {
        insights.push(`A categoria "${categoryExpenses[0].name}" representa ${categoryExpenses[0].percentage.toFixed(1)}% das suas despesas. Considere revisar esse gasto.`);
      }

      if (investments > 0) {
        const investmentRate = ((investments / income) * 100).toFixed(1);
        insights.push(`Você investiu ${investmentRate}% da sua renda. ${parseFloat(investmentRate) >= 10 ? "Ótimo trabalho!" : "Tente aumentar gradualmente essa porcentagem."}`);
      } else {
        insights.push("Você ainda não tem investimentos registrados. Considere começar a investir para construir seu patrimônio.");
      }

      if (goalsData.length > 0) {
        const completedGoals = goalsData.filter((g) => g.progress >= 100).length;
        if (completedGoals > 0) {
          insights.push(`Parabéns! Você completou ${completedGoals} ${completedGoals === 1 ? "meta" : "metas"}!`);
        }
        const activeGoals = goalsData.filter((g) => g.progress < 100);
        if (activeGoals.length > 0) {
          const avgProgress = activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length;
          insights.push(`Progresso médio das suas metas: ${avgProgress.toFixed(1)}%. Continue focado!`);
        }
      }

      setFinancialData({
        totalIncome: income,
        totalExpense: expense,
        totalInvestments: investments,
        balance: income - expense,
        transactions: transactionData,
        categoryExpenses,
        monthlyData,
        goals: goalsData,
        insights,
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleGenerateReport = async () => {
    if (!userId || !financialData) return;

    setLoading(true);
    try {
      const blob = await generateReportPDF({
        userName: userProfile?.full_name || "Usuário",
        userEmail: emailInput,
        balance: financialData.balance,
        totalIncome: financialData.totalIncome,
        totalExpense: financialData.totalExpense,
        totalInvestments: financialData.totalInvestments,
        currency,
        sections,
        transactions: financialData.transactions,
        goals: financialData.goals,
        categoryExpenses: financialData.categoryExpenses,
        monthlyData: financialData.monthlyData,
        insights: financialData.insights,
      });

      setPdfBlob(blob);
      setDeliveryTab("delivery");
      toast.success("Relatório completo gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!pdfBlob || !userId) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1];

        const { error } = await supabase.functions.invoke("send-report-email", {
          body: {
            to: useRegisteredEmail ? emailInput : emailInput,
            userName: userProfile?.full_name || "Usuário",
            pdfBase64: base64data,
            fileName: `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`,
          },
        });

        if (error) throw error;

        await supabase.from("reports_sent").insert({
          user_id: userId,
          sections_included: sections.filter((s) => s.selected).map((s) => s.id),
          delivery_method: "email",
          recipient: emailInput,
          file_size: pdfBlob.size,
        });

        toast.success("Relatório enviado por email com sucesso! ✅");
        setOpen(false);
      };
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!pdfBlob || !userId) return;

    setLoading(true);
    try {
      const phone = useRegisteredPhone ? phoneInput : phoneInput;
      
      // Converter PDF para base64
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1];
        
        if (!base64data) {
          toast.error("Erro ao processar o arquivo");
          setLoading(false);
          return;
        }

        // Fazer upload do PDF para o storage
        const fileName = `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`;
        
        const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
          "upload-report",
          {
            body: {
              pdfBase64: base64data,
              fileName,
              userId,
            },
          }
        );

        if (uploadError || !uploadData?.publicUrl) {
          console.error("Erro ao fazer upload:", uploadError);
          toast.error("Erro ao preparar arquivo para envio");
          setLoading(false);
          return;
        }

        // Registrar no histórico
        await supabase.from("reports_sent").insert({
          user_id: userId,
          sections_included: sections.filter((s) => s.selected).map((s) => s.id),
          delivery_method: "whatsapp",
          recipient: phone,
          file_size: pdfBlob.size,
        });

        // Criar mensagem com o link do PDF
        const message = `📊 *Relatório Financeiro*\n\nOlá! Aqui está meu relatório financeiro gerado em ${new Date().toLocaleDateString("pt-BR")}.\n\n📥 *Download do PDF:*\n${uploadData.publicUrl}\n\n💡 O link é válido por 1 hora.`;

        // Abrir WhatsApp com a mensagem
        await shareViaWhatsApp(phone, message, pdfBlob, fileName);
        
        toast.success("WhatsApp aberto com link do relatório! 📱");
        setOpen(false);
      };

      reader.onerror = () => {
        toast.error("Erro ao processar o arquivo");
        setLoading(false);
      };
    } catch (error) {
      console.error("Erro ao compartilhar via WhatsApp:", error);
      toast.error("Erro ao compartilhar via WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!pdfBlob || !userId) return;

    await supabase.from("reports_sent").insert({
      user_id: userId,
      sections_included: sections.filter((s) => s.selected).map((s) => s.id),
      delivery_method: "print",
      file_size: pdfBlob.size,
    });

    printPDF(pdfBlob);
    toast.success("Abrindo para impressão... 🖨️");
  };

  const handleDownload = async () => {
    if (!pdfBlob || !userId) return;

    await supabase.from("reports_sent").insert({
      user_id: userId,
      sections_included: sections.filter((s) => s.selected).map((s) => s.id),
      delivery_method: "download",
      file_size: pdfBlob.size,
    });

    downloadPDF(pdfBlob, `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Download iniciado! 📥");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Relatório Financeiro</DialogTitle>
          <DialogDescription>
            Selecione as seções que deseja incluir no relatório
          </DialogDescription>
        </DialogHeader>

        <Tabs value={deliveryTab} onValueChange={setDeliveryTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Selecionar Seções</TabsTrigger>
            <TabsTrigger value="delivery" disabled={!pdfBlob}>
              Enviar/Baixar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={section.selected}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label htmlFor={section.id} className="cursor-pointer">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={loading || !sections.some((s) => s.selected)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Relatório PDF"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            {pdfBlob && (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Relatório gerado com sucesso! Escolha como deseja compartilhar:
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tamanho: {(pdfBlob.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="seu@email.com"
                        disabled={useRegisteredEmail}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUseRegisteredEmail(!useRegisteredEmail)}
                      >
                        {useRegisteredEmail ? "Usar outro" : "Usar cadastrado"}
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendEmail}
                      disabled={loading || !emailInput}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar por E-mail
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="(55) 9 9999-9999"
                        disabled={useRegisteredPhone}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUseRegisteredPhone(!useRegisteredPhone)}
                      >
                        {useRegisteredPhone ? "Usar outro" : "Usar cadastrado"}
                      </Button>
                    </div>
                    <Button
                      onClick={handleWhatsAppShare}
                      disabled={!phoneInput}
                      className="w-full"
                      variant="outline"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Compartilhar via WhatsApp
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handlePrint} variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
