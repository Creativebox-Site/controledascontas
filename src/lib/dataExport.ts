/**
 * Exportação de dados financeiros em formato JSON
 * Preparado para integração com sistemas externos
 */

import type { 
  FinancialExport, 
  Goal, 
  Alert, 
  PerformanceComparison, 
  InvestmentSnapshot 
} from "@/types/financial";

/**
 * Cria export completo dos dados financeiros
 */
export const createFinancialExport = (
  userId: string,
  data: {
    goals: Goal[];
    alerts: Alert[];
    performance: PerformanceComparison[];
    investmentSnapshots: InvestmentSnapshot[];
    currency: string;
  }
): FinancialExport => {
  return {
    export_date: new Date().toISOString(),
    user_id: userId,
    goals: data.goals,
    alerts: data.alerts,
    performance: data.performance,
    investment_snapshots: data.investmentSnapshots,
    metadata: {
      currency: data.currency,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      version: "1.0.0",
    },
  };
};

/**
 * Exporta dados como JSON para download
 */
export const downloadFinancialDataAsJSON = (
  exportData: FinancialExport,
  filename?: string
) => {
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `financial-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Importa dados de um arquivo JSON
 */
export const importFinancialDataFromJSON = (
  jsonString: string
): FinancialExport | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validação básica
    if (!data.user_id || !data.export_date || !data.metadata) {
      throw new Error("Formato de arquivo inválido");
    }
    
    return data as FinancialExport;
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return null;
  }
};

/**
 * Formata dados para relatório em PDF (estrutura JSON)
 */
export const formatForPDFReport = (exportData: FinancialExport) => {
  return {
    title: "Relatório Financeiro Completo",
    generated_at: new Date().toISOString(),
    user_id: exportData.user_id,
    sections: [
      {
        title: "Resumo de Metas",
        data: exportData.goals.map(goal => ({
          name: goal.name,
          progress: `${((goal.current_amount / goal.target_amount) * 100).toFixed(1)}%`,
          current: goal.current_amount,
          target: goal.target_amount,
          deadline: goal.target_date,
          status: goal.is_completed ? "Concluída" : "Em progresso",
        })),
      },
      {
        title: "Alertas Ativos",
        data: exportData.alerts
          .filter(a => !a.is_read)
          .map(alert => ({
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            created: alert.created_at,
          })),
      },
      {
        title: "Performance Financeira",
        data: exportData.performance.map(perf => ({
          period: perf.period,
          income: perf.metrics.total_income,
          expenses: perf.metrics.total_expenses,
          investments: perf.metrics.total_investments,
          savings_rate: `${perf.metrics.savings_rate.toFixed(1)}%`,
          net_balance: perf.metrics.net_balance,
        })),
      },
      {
        title: "Carteira de Investimentos",
        data: exportData.investment_snapshots.slice(-1)[0] || null,
      },
    ],
    metadata: exportData.metadata,
  };
};

/**
 * Converte dados para formato CSV (categorias e valores)
 */
export const convertToCSV = (
  data: Array<Record<string, any>>,
  headers: string[]
): string => {
  const headerRow = headers.join(",");
  const dataRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escapar valores com vírgulas
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value;
    }).join(",")
  );
  
  return [headerRow, ...dataRows].join("\n");
};

/**
 * Exporta metas como CSV
 */
export const exportGoalsAsCSV = (goals: Goal[]): string => {
  const headers = [
    "name", 
    "goal_type", 
    "target_amount", 
    "current_amount", 
    "progress_percentage",
    "target_date", 
    "is_completed"
  ];
  
  return convertToCSV(
    goals.map(g => ({
      name: g.name,
      goal_type: g.goal_type,
      target_amount: g.target_amount,
      current_amount: g.current_amount,
      progress_percentage: g.progress_percentage,
      target_date: g.target_date,
      is_completed: g.is_completed ? "Sim" : "Não",
    })),
    headers
  );
};

/**
 * Salva dados localmente (localStorage) para backup
 */
export const saveToLocalBackup = (exportData: FinancialExport) => {
  try {
    const key = `financial-backup-${exportData.user_id}`;
    localStorage.setItem(key, JSON.stringify(exportData));
    localStorage.setItem(`${key}-timestamp`, new Date().toISOString());
    return true;
  } catch (error) {
    console.error("Erro ao salvar backup local:", error);
    return false;
  }
};

/**
 * Recupera último backup local
 */
export const loadFromLocalBackup = (userId: string): FinancialExport | null => {
  try {
    const key = `financial-backup-${userId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    return JSON.parse(data) as FinancialExport;
  } catch (error) {
    console.error("Erro ao carregar backup local:", error);
    return null;
  }
};