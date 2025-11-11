# Estrutura de Dados Financeiros - Documentação Técnica

## 📁 Arquivos e Propósito

### `financial.ts` (Types)
Define todos os tipos TypeScript estruturados em formato JSON para exportação e integração com sistemas externos.

**Principais tipos:**
- `Goal`: Estrutura de metas financeiras
- `Alert`: Sistema de alertas e notificações
- `PerformanceComparison`: Análise comparativa de rendimento
- `InvestmentSnapshot`: Snapshot diário de investimentos
- `FinancialExport`: Formato completo de exportação

### `investmentSimulator.ts`
Simula atualizações diárias de investimentos com dados realistas baseados em modelos financeiros.

**Principais funções:**
```typescript
// Gera histórico de 90 dias de investimentos
const history = generateLast90DaysData(userId);

// Projeta crescimento futuro
const projections = projectInvestmentGrowth(
  currentValue: 10000,
  monthlyContribution: 1000,
  annualReturn: 0.12,
  years: 5
);

// Calcula métricas de risco
const risk = calculatePortfolioRisk(snapshots);
```

**Recursos:**
- Simulação de retornos usando distribuição normal (Box-Muller)
- Volatilidade ajustável por categoria
- Contribuições mensais automáticas
- Cálculo de Sharpe Ratio e Max Drawdown

### `alertsManager.ts`
Sistema inteligente de detecção e geração de alertas financeiros.

**Tipos de alertas:**
1. **Orçamento excedido**: Detecta quando gastos ultrapassam limites
2. **Metas próximas do prazo**: Alerta quando metas estão atrasadas
3. **Pico de gastos**: Identifica gastos 30% acima da média
4. **Queda de receita**: Detecta receita 20% abaixo da média
5. **Oportunidades de investimento**: Sugere quando há saldo parado

**Exemplo de uso:**
```typescript
const alerts = generateAllAlerts(userId, {
  budgetCategories: [...],
  goals: [...],
  currentMonthExpenses: 5000,
  previousMonthsExpensesAverage: 4000,
  currentMonthIncome: 8000,
  previousMonthsIncomeAverage: 8500,
  availableBalance: 5000,
  monthlyIncome: 8000,
});
```

### `dataExport.ts`
Sistema de exportação e importação de dados em múltiplos formatos.

**Funcionalidades:**
```typescript
// Exportar dados completos
const exportData = createFinancialExport(userId, {...});

// Download como JSON
downloadFinancialDataAsJSON(exportData);

// Exportar metas como CSV
const csv = exportGoalsAsCSV(goals);

// Backup local
saveToLocalBackup(exportData);
const backup = loadFromLocalBackup(userId);
```

## 🔄 Integração com Supabase Auth

O sistema já está preparado para Supabase Auth:

```typescript
// Autenticação configurada em src/pages/Auth.tsx
// Supabase client em src/integrations/supabase/client.ts

// Para acessar usuário autenticado:
const { data: { user } } = await supabase.auth.getUser();

// Todas as funções aceitam userId:
const alerts = generateAllAlerts(user.id, {...});
const export = createFinancialExport(user.id, {...});
```

## 📊 Simulação de Dados Diários

Para popular dados de demonstração:

```typescript
import { generateLast90DaysData } from "@/lib/investmentSimulator";
import { supabase } from "@/integrations/supabase/client";

// Gerar e salvar dados dos últimos 90 dias
const snapshots = generateLast90DaysData(userId);

// Opcional: Salvar no banco (requer tabela investment_snapshots)
for (const snapshot of snapshots) {
  await supabase.from('investment_snapshots').insert(snapshot);
}
```

## 🔐 Estrutura JSON para APIs Externas

Todos os tipos são compatíveis com JSON e podem ser usados com:

- **Firebase Realtime Database**: Sincronização em tempo real
- **RESTful APIs**: Integração com backends externos
- **GraphQL**: Queries tipadas
- **Webhooks**: Notificações de eventos

Exemplo de payload JSON:
```json
{
  "export_date": "2025-01-11T12:00:00.000Z",
  "user_id": "user-123",
  "goals": [...],
  "alerts": [...],
  "performance": [...],
  "investment_snapshots": [...],
  "metadata": {
    "currency": "BRL",
    "timezone": "America/Sao_Paulo",
    "version": "1.0.0"
  }
}
```

## 🚀 Próximos Passos

1. **Criar tabelas no Supabase** para persistir alertas e snapshots
2. **Implementar Edge Functions** para cálculos automáticos diários
3. **Adicionar webhooks** para notificações em tempo real
4. **Dashboard de alertas** para visualizar e gerenciar alertas
5. **Relatórios PDF** usando a estrutura JSON formatada

## 📝 Notas Técnicas

- Todos os valores monetários são `number` para facilitar cálculos
- Datas em formato ISO 8601 string
- Percentuais armazenados como números (ex: 15.5 = 15.5%)
- IDs são UUID strings
- Timezone-aware usando Date.toISOString()