/**
 * Investment Simulation Engine
 * Generates daily time series and projections for different investment types
 */

export interface Aporte {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface InvestmentRates {
  poupanca: number;
  tesouro_selic: number;
  cdb_100_cdi: number;
}

export interface ProjectionResult {
  date: string;
  value: number;
}

export interface HorizonProjection {
  finalValue: number;
  days: number;
  series: ProjectionResult[];
}

export interface InstrumentProjections {
  [horizon: string]: HorizonProjection;
}

export interface AllProjections {
  poupanca: InstrumentProjections;
  tesouro_selic: InstrumentProjections;
  cdb_100_cdi: InstrumentProjections;
}

// Default rates (placeholders - should be configurable)
export const DEFAULT_RATES: InvestmentRates = {
  poupanca: 0.035,      // 3.5% a.a.
  tesouro_selic: 0.065, // 6.5% a.a.
  cdb_100_cdi: 0.07,    // 7% a.a.
};

// Date utilities
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Convert annual rate to daily effective rate
export function annualToDaily(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 365) - 1;
}

// Build a map of aportes by ISO date for O(1) lookup
function mapAportesByDate(aportes: Aporte[]): Record<string, number> {
  const map: Record<string, number> = {};
  aportes.forEach((a) => {
    const k = a.date.slice(0, 10);
    map[k] = (map[k] || 0) + Number(a.amount);
  });
  return map;
}

/**
 * Project investment series with daily compounding
 */
export function projectSeries(
  initialBalance: number,
  aportes: Aporte[],
  rateAnnual: number,
  startDateISO: string,
  days: number
): ProjectionResult[] {
  const rDaily = annualToDaily(rateAnnual);
  const aporteMap = mapAportesByDate(aportes);
  const series: ProjectionResult[] = [];
  let balance = Number(initialBalance || 0);

  for (let i = 0; i <= days; i++) {
    const date = formatISO(addDays(new Date(startDateISO), i));
    
    // Apply daily interest (skip on day 0 to get starting snapshot)
    if (i > 0) {
      balance = balance * (1 + rDaily);
    }
    
    // Apply aporte if any on this date
    if (aporteMap[date]) {
      balance += Number(aporteMap[date]);
    }
    
    series.push({ date, value: Number(balance.toFixed(2)) });
  }

  return series;
}

/**
 * Generate projections for all instruments and horizons
 */
export function generateProjections({
  initialBalance,
  aportes,
  asOfDateISO,
  horizonsYears,
  rates,
}: {
  initialBalance: number;
  aportes: Aporte[];
  asOfDateISO: string;
  horizonsYears: number[];
  rates: InvestmentRates;
}): AllProjections {
  const daysForHorizon = (y: number) => Math.round(365 * y);
  const result: AllProjections = {
    poupanca: {},
    tesouro_selic: {},
    cdb_100_cdi: {},
  };

  const instruments = Object.keys(rates) as (keyof InvestmentRates)[];

  instruments.forEach((instr) => {
    horizonsYears.forEach((y) => {
      const days = daysForHorizon(y);
      const series = projectSeries(
        initialBalance,
        aportes,
        rates[instr],
        asOfDateISO,
        days
      );
      const finalValue = series[series.length - 1].value;
      result[instr][y] = { finalValue, days, series };
    });
  });

  return result;
}

/**
 * Calculate average monthly contribution from historical aportes
 */
export function calculateAverageMonthlyAporte(
  aportes: Aporte[],
  lastNMonths: number = 6
): number {
  if (aportes.length === 0) return 0;

  // Group by month (YYYY-MM)
  const monthlyTotals: Record<string, number> = {};
  
  aportes.forEach((a) => {
    const monthKey = a.date.slice(0, 7); // YYYY-MM
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + a.amount;
  });

  // Get last N months
  const months = Object.keys(monthlyTotals).sort().slice(-lastNMonths);
  
  if (months.length === 0) return 0;

  const sum = months.reduce((acc, month) => acc + monthlyTotals[month], 0);
  return sum / months.length;
}

/**
 * Generate future monthly aportes based on average
 */
export function generateFutureAportes(
  monthlyAmount: number,
  startDateISO: string,
  months: number,
  dayOfMonth: number = 5
): Aporte[] {
  const aportes: Aporte[] = [];
  const startDate = new Date(startDateISO);

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    date.setDate(dayOfMonth);
    
    aportes.push({
      date: formatISO(date),
      amount: monthlyAmount,
    });
  }

  return aportes;
}

/**
 * Calculate comparison vs poupanca
 */
export function calculateVsPoupanca(
  instrumentValue: number,
  poupancaValue: number
): { difference: number; percentageMore: number } {
  const difference = instrumentValue - poupancaValue;
  const percentageMore = poupancaValue > 0 ? (difference / poupancaValue) * 100 : 0;
  
  return { difference, percentageMore };
}
