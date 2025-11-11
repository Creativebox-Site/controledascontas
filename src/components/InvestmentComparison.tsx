import { useEffect, useState } from "react";
import { sb } from "@/lib/sb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, PiggyBank, Building2, Landmark } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  generateProjections,
  calculateAverageMonthlyAporte,
  generateFutureAportes,
  calculateVsPoupanca,
  DEFAULT_RATES,
  type Aporte,
  type AllProjections,
} from "@/lib/investmentSimulation";

interface InvestmentComparisonProps {
  userId?: string;
  currency: string;
}

export const InvestmentComparison = ({ userId, currency }: InvestmentComparisonProps) => {
  const [loading, setLoading] = useState(true);
  const [projections, setProjections] = useState<AllProjections | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(5);
  const [historicalAportes, setHistoricalAportes] = useState<Aporte[]>([]);
  const [averageMonthly, setAverageMonthly] = useState<number>(0);

  const horizons = [1, 3, 5, 10];

  useEffect(() => {
    if (userId) {
      loadInvestmentData();
    }
  }, [userId]);

  const loadInvestmentData = async () => {
    setLoading(true);

    try {
      // Get all investment transactions
      const { data: transactions } = await sb
        .from("transactions")
        .select("date, amount")
        .eq("user_id", userId)
        .eq("type", "investment")
        .order("date", { ascending: true });

      if (transactions) {
        const aportes: Aporte[] = transactions.map((t: any) => ({
          date: t.date,
          amount: Number(t.amount),
        }));

        setHistoricalAportes(aportes);

        // Calculate average monthly contribution
        const avgMonthly = calculateAverageMonthlyAporte(aportes, 6);
        setAverageMonthly(avgMonthly);

        // Calculate initial balance (sum of all historical aportes)
        const initialBalance = aportes.reduce((sum, a) => sum + a.amount, 0);

        // Generate future aportes for projections (10 years)
        const futureAportes = generateFutureAportes(
          avgMonthly,
          new Date().toISOString().slice(0, 10),
          120, // 10 years
          5
        );

        // Combine historical and future aportes
        const allAportes = [...aportes, ...futureAportes];

        // Generate projections
        const results = generateProjections({
          initialBalance,
          aportes: allAportes,
          asOfDateISO: new Date().toISOString().slice(0, 10),
          horizonsYears: horizons,
          rates: DEFAULT_RATES,
        });

        setProjections(results);
      }
    } catch (error) {
      console.error("Error loading investment data:", error);
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const formatChartData = (horizon: number) => {
    if (!projections) return [];

    const poupancaSeries = projections.poupanca[horizon]?.series || [];
    const tesouroSeries = projections.tesouro_selic[horizon]?.series || [];
    const cdbSeries = projections.cdb_100_cdi[horizon]?.series || [];

    // Sample data points (show one point per month for better performance)
    const sampledData = poupancaSeries
      .filter((_, index) => index % 30 === 0 || index === poupancaSeries.length - 1)
      .map((item, idx) => ({
        date: new Date(item.date).toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        Poupança: item.value,
        "Tesouro Selic": tesouroSeries[idx * 30]?.value || 0,
        "CDB 100% CDI": cdbSeries[idx * 30]?.value || 0,
      }));

    return sampledData;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!projections || historicalAportes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Investimentos</CardTitle>
          <CardDescription>
            Adicione seus aportes de investimento para ver as projeções
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          Nenhum aporte registrado ainda. Vá para a aba "Investimentos" para adicionar.
        </CardContent>
      </Card>
    );
  }

  const currentHorizonData = {
    poupanca: projections.poupanca[selectedHorizon]?.finalValue || 0,
    tesouro: projections.tesouro_selic[selectedHorizon]?.finalValue || 0,
    cdb: projections.cdb_100_cdi[selectedHorizon]?.finalValue || 0,
  };

  const vsPoupanca = {
    tesouro: calculateVsPoupanca(currentHorizonData.tesouro, currentHorizonData.poupanca),
    cdb: calculateVsPoupanca(currentHorizonData.cdb, currentHorizonData.poupanca),
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comparação: Poupança vs Tesouro vs CDB
          </CardTitle>
          <CardDescription>
            Projeções baseadas em seus {historicalAportes.length} aportes (média mensal:{" "}
            {formatCurrency(averageMonthly)})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedHorizon.toString()} onValueChange={(v) => setSelectedHorizon(Number(v))}>
            <TabsList className="grid w-full grid-cols-4">
              {horizons.map((h) => (
                <TabsTrigger key={h} value={h.toString()}>
                  {h} {h === 1 ? "ano" : "anos"}
                </TabsTrigger>
              ))}
            </TabsList>

            {horizons.map((h) => (
              <TabsContent key={h} value={h.toString()} className="space-y-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={formatChartData(h)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Poupança"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Tesouro Selic"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="CDB 100% CDI"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-chart-1/50 bg-chart-1/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Poupança
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(currentHorizonData.poupanca)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Taxa: {(DEFAULT_RATES.poupanca * 100).toFixed(2)}% a.a.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-chart-2/50 bg-chart-2/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Tesouro Selic
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(currentHorizonData.tesouro)}
                      </div>
                      <p className="text-xs text-success mt-1">
                        +{formatCurrency(vsPoupanca.tesouro.difference)} (
                        {vsPoupanca.tesouro.percentageMore.toFixed(1)}% a mais)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Taxa: {(DEFAULT_RATES.tesouro_selic * 100).toFixed(2)}% a.a.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-chart-3/50 bg-chart-3/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        CDB 100% CDI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(currentHorizonData.cdb)}
                      </div>
                      <p className="text-xs text-success mt-1">
                        +{formatCurrency(vsPoupanca.cdb.difference)} (
                        {vsPoupanca.cdb.percentageMore.toFixed(1)}% a mais)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Taxa: {(DEFAULT_RATES.cdb_100_cdi * 100).toFixed(2)}% a.a.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      <strong>Nota:</strong> Projeções são estimativas educativas baseadas em taxas
                      fixas e capitalização diária. Resultados reais dependem de taxas vigentes,
                      impostos (IR) e condições do mercado. Sempre consulte um especialista antes
                      de tomar decisões de investimento.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
