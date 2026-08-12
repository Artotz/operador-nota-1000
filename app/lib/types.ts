export type PhaseKey = "baseline" | "window1" | "window2";

export type MetricKey = "consumption" | "idle" | "productive" | "hours";

export type MachineReading = {
  machine: string;
  model: string;
  type: string;
  serial: string;
  organization: string;
  periodStart: string;
  periodEnd: string;
  lifetimeEngineHours: number;
  averageFuelRate: number;
  fuelConsumed: number;
  idleFuel: number;
  highLoadFuel: number;
  mediumLoadFuel: number;
  lowLoadFuel: number;
  productivePercent: number;
  idlePercent: number;
  idleHours: number;
  productiveHours: number;
  source: string;
};

export type ReportingPeriod = {
  id: string;
  label: string;
  longLabel: string;
  start: string;
  end: string;
  phase: PhaseKey;
  phaseLabel: string;
};

export type BehaviorScore = {
  periodId: string;
  safety: number;
  assetCare: number;
  attendance: number;
};

export type OperatorAssignment = {
  operatorId: string;
  serial: string;
  alias: string;
  revealName: string;
  behaviorScores: BehaviorScore[];
};

export type AggregatedMetrics = {
  fuelConsumed: number;
  engineHours: number;
  idleHours: number;
  productiveHours: number;
  consumption: number;
  idle: number;
  productive: number;
};

export type ScoreBreakdown = {
  consumption: number;
  idle: number;
  productive: number;
  safety: number;
  assetCare: number;
  attendance: number;
  total: number;
  maximum: 75 | 100;
};

export type RankingEntry = {
  id: string;
  serial: string;
  serials: string[];
  machine: string;
  alias: string;
  revealName: string;
  score: number;
  maximum: 75 | 100;
  breakdown: ScoreBreakdown;
  periodScores: number[];
  position: number;
};

export type OperationalImpact = {
  baseline: {
    operatingHours: number;
    averageFuelRate: number;
    idleHours: number;
    idleRate: number;
  };
  monitoring: {
    operatingHours: number;
    averageHoursPerPeriodMachine: number;
    idleHours: number;
    idleRate: number;
    periodMachineCount: number;
    start: string | null;
    end: string | null;
    observedDays: number;
  };
  dieselPricePerLiter: number;
  avoidedLiters: number;
  estimatedDieselSavings: number;
  avoidedIdleHours: number;
  projectedThroughYearEnd: {
    end: string | null;
    days: number;
    avoidedLiters: number;
    estimatedDieselSavings: number;
    avoidedIdleHours: number;
  };
};
