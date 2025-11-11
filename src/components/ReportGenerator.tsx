import { useState, useEffect } from "react";
import { sb } from "@/lib/sb";
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

    const { data: profile } = await sb
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

    const { data: transactions } = await sb
      .from("transactions")
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

      setFinancialData({
        totalIncome: income,
        totalExpense: expense,
        totalInvestments: investments,
        balance: income - expense,
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
      });

      setPdfBlob(blob);
      setDeliveryTab("delivery");
      toast.success("Relatório gerado com sucesso!");
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

        await sb.from("reports_sent").insert({
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

    const phone = useRegisteredPhone ? phoneInput : phoneInput;
    const message = `Olá! Aqui está meu relatório financeiro gerado em ${new Date().toLocaleDateString("pt-BR")}. 📊💰`;

    await sb.from("reports_sent").insert({
      user_id: userId,
      sections_included: sections.filter((s) => s.selected).map((s) => s.id),
      delivery_method: "whatsapp",
      recipient: phone,
      file_size: pdfBlob.size,
    });

    shareViaWhatsApp(phone, message);
    toast.success("Abrindo WhatsApp... 📱");
    setOpen(false);
  };

  const handlePrint = async () => {
    if (!pdfBlob || !userId) return;

    await sb.from("reports_sent").insert({
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

    await sb.from("reports_sent").insert({
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
