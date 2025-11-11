/**
 * Componente de demonstração para exportação de dados
 * Mostra como usar o sistema de JSON estruturado
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, FileSpreadsheet, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { 
  createFinancialExport, 
  downloadFinancialDataAsJSON,
  exportGoalsAsCSV,
  saveToLocalBackup,
  loadFromLocalBackup
} from "@/lib/dataExport";
import { generateLast90DaysData, projectInvestmentGrowth } from "@/lib/investmentSimulator";
import { generateAllAlerts } from "@/lib/alertsManager";

interface DataExportDemoProps {
  userId?: string;
}

export const DataExportDemo = ({ userId }: DataExportDemoProps) => {
  const [loading, setLoading] = useState(false);

  const handleGenerateSimulation = () => {
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    setLoading(true);

    // Gerar dados simulados dos últimos 90 dias
    const investmentData = generateLast90DaysData(userId);
    
    toast.success(`${investmentData.length} dias de dados de investimento gerados!`);
    console.log("📊 Dados de investimento simulados:", investmentData.slice(0, 5));
    
    setLoading(false);
  };

  const handleProjectGrowth = () => {
    setLoading(true);

    const projections = projectInvestmentGrowth(
      10000,  // Valor atual
      1000,   // Contribuição mensal
      0.12,   // 12% ao ano
      10      // 10 anos
    );

    toast.success("Projeção de 10 anos calculada!");
    console.log("📈 Projeção de crescimento:", projections);
    
    setLoading(false);
  };

  const handleGenerateAlerts = () => {
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    setLoading(true);

    // Dados de exemplo
    const alerts = generateAllAlerts(userId, {
      budgetCategories: [
        { name: "Alimentação", spent: 1200, budget: 1000 },
        { name: "Transporte", spent: 450, budget: 600 },
        { name: "Lazer", spent: 300, budget: 400 },
      ],
      goals: [],
      currentMonthExpenses: 5500,
      previousMonthsExpensesAverage: 4200,
      currentMonthIncome: 8000,
      previousMonthsIncomeAverage: 8000,
      availableBalance: 4000,
      monthlyIncome: 8000,
    });

    toast.success(`${alerts.length} alertas gerados!`);
    console.log("🔔 Alertas:", alerts);
    
    setLoading(false);
  };

  const handleExportJSON = () => {
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    setLoading(true);

    // Criar dados de exemplo para exportação
    const exportData = createFinancialExport(userId, {
      goals: [],
      alerts: [],
      performance: [],
      investmentSnapshots: generateLast90DaysData(userId).slice(-7), // Últimos 7 dias
      currency: "BRL",
    });

    downloadFinancialDataAsJSON(exportData);
    toast.success("Arquivo JSON baixado com sucesso!");
    
    setLoading(false);
  };

  const handleExportCSV = () => {
    setLoading(true);

    // Exemplo de exportação CSV de metas
    const goalsData = [
      {
        id: "1",
        user_id: userId || "",
        name: "Viagem para Europa",
        description: "Viagem de férias",
        goal_type: "short_term" as const,
        target_amount: 15000,
        current_amount: 8000,
        target_date: "2025-12-31",
        icon: "✈️",
        is_completed: false,
        progress_percentage: 53.3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const csv = exportGoalsAsCSV(goalsData);
    
    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `metas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Arquivo CSV baixado com sucesso!");
    
    setLoading(false);
  };

  const handleSaveBackup = () => {
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    setLoading(true);

    const exportData = createFinancialExport(userId, {
      goals: [],
      alerts: [],
      performance: [],
      investmentSnapshots: [],
      currency: "BRL",
    });

    const success = saveToLocalBackup(exportData);
    
    if (success) {
      toast.success("Backup local salvo com sucesso!");
    } else {
      toast.error("Erro ao salvar backup local");
    }
    
    setLoading(false);
  };

  const handleLoadBackup = () => {
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    setLoading(true);

    const backup = loadFromLocalBackup(userId);
    
    if (backup) {
      toast.success("Backup local carregado!");
      console.log("💾 Dados do backup:", backup);
    } else {
      toast.error("Nenhum backup encontrado");
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Simulação de Investimentos
          </CardTitle>
          <CardDescription>
            Gere dados simulados de investimentos com atualizações diárias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleGenerateSimulation} 
            disabled={loading || !userId}
            variant="outline"
            className="w-full"
          >
            Gerar Últimos 90 Dias
          </Button>
          <Button 
            onClick={handleProjectGrowth} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Projetar Próximos 10 Anos
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Sistema de Alertas
          </CardTitle>
          <CardDescription>
            Gere alertas inteligentes baseados em dados financeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateAlerts} 
            disabled={loading || !userId}
            variant="outline"
            className="w-full"
          >
            Gerar Alertas de Exemplo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportação de Dados
          </CardTitle>
          <CardDescription>
            Exporte seus dados em formato JSON ou CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleExportJSON} 
            disabled={loading || !userId}
            className="w-full"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Exportar como JSON
          </Button>
          <Button 
            onClick={handleExportCSV} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Metas como CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup Local</CardTitle>
          <CardDescription>
            Salve e recupere dados do navegador (localStorage)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button 
            onClick={handleSaveBackup} 
            disabled={loading || !userId}
            variant="outline"
            className="flex-1"
          >
            Salvar Backup
          </Button>
          <Button 
            onClick={handleLoadBackup} 
            disabled={loading || !userId}
            variant="outline"
            className="flex-1"
          >
            Carregar Backup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};