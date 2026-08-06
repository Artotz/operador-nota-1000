import type {
  AggregatedMetrics,
  MachineReading,
  OperatorAssignment,
  RankingEntry,
  ReportingPeriod,
  ScoreBreakdown,
} from "@/app/lib/types";

export const round = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export function aggregateReadings(readings: MachineReading[]): AggregatedMetrics {
  const fuelConsumed = readings.reduce((total, item) => total + item.fuelConsumed, 0);
  const idleHours = readings.reduce((total, item) => total + item.idleHours, 0);
  const productiveHours = readings.reduce(
    (total, item) => total + item.productiveHours,
    0,
  );
  const engineHours = idleHours + productiveHours;

  return {
    fuelConsumed,
    engineHours,
    idleHours,
    productiveHours,
    consumption: engineHours ? fuelConsumed / engineHours : 0,
    idle: engineHours ? (idleHours / engineHours) * 100 : 0,
    productive: engineHours ? (productiveHours / engineHours) * 100 : 0,
  };
}

export function telemetryScore(
  metrics: AggregatedMetrics,
  baselineConsumption: number,
): Pick<ScoreBreakdown, "consumption" | "idle" | "productive"> {
  const reduction = baselineConsumption
    ? ((baselineConsumption - metrics.consumption) / baselineConsumption) * 100
    : 0;

  return {
    idle: metrics.idle <= 20 ? 25 : metrics.idle <= 25 ? 10 : 0,
    consumption: metrics.consumption <= 26 ? 25 : reduction >= 5 ? 10 : 0,
    productive: metrics.productive >= 80 ? 25 : metrics.productive >= 75 ? 10 : 0,
  };
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function buildRanking(
  readings: MachineReading[],
  periods: ReportingPeriod[],
  assignments: OperatorAssignment[],
) {
  const baselinePeriods = periods.filter((period) => period.phase === "baseline");
  const trackedPeriods = periods.filter((period) => period.phase !== "baseline");
  const availableTrackedPeriods = trackedPeriods.filter((period) =>
    readings.some((reading) => reading.periodStart === period.start),
  );
  const finalPeriodAvailable = readings.some(
    (reading) => reading.periodStart === trackedPeriods.at(-1)?.start,
  );
  const behaviorComplete = assignments.every((assignment) =>
    availableTrackedPeriods.every((period) =>
      assignment.behaviorScores.some((score) => score.periodId === period.id),
    ),
  );
  const isOfficial = Boolean(finalPeriodAvailable && behaviorComplete);

  const entries = assignments.map((assignment) => {
    const machineReading = readings.find((reading) => reading.serial === assignment.serial);
    const baseline = aggregateReadings(
      readings.filter(
        (reading) =>
          reading.serial === assignment.serial &&
          baselinePeriods.some((period) => period.start === reading.periodStart),
      ),
    );

    const periodBreakdowns = availableTrackedPeriods.flatMap((period) => {
      const periodReadings = readings.filter(
        (reading) =>
          reading.serial === assignment.serial && reading.periodStart === period.start,
      );
      if (!periodReadings.length) return [];

      const telemetry = telemetryScore(
        aggregateReadings(periodReadings),
        baseline.consumption,
      );
      const behavior = assignment.behaviorScores.find(
        (score) => score.periodId === period.id,
      );
      const safety = isOfficial ? behavior?.safety ?? 0 : 0;
      const assetCare = isOfficial ? behavior?.assetCare ?? 0 : 0;
      const attendance = isOfficial ? behavior?.attendance ?? 0 : 0;

      return [
        {
          consumption: telemetry.consumption,
          idle: telemetry.idle,
          productive: telemetry.productive,
          safety,
          assetCare,
          attendance,
          total:
            telemetry.consumption +
            telemetry.idle +
            telemetry.productive +
            safety +
            assetCare +
            attendance,
          maximum: isOfficial ? (100 as const) : (75 as const),
        },
      ];
    });

    const breakdown: ScoreBreakdown = {
      consumption: average(periodBreakdowns.map((item) => item.consumption)),
      idle: average(periodBreakdowns.map((item) => item.idle)),
      productive: average(periodBreakdowns.map((item) => item.productive)),
      safety: average(periodBreakdowns.map((item) => item.safety)),
      assetCare: average(periodBreakdowns.map((item) => item.assetCare)),
      attendance: average(periodBreakdowns.map((item) => item.attendance)),
      total: average(periodBreakdowns.map((item) => item.total)),
      maximum: isOfficial ? 100 : 75,
    };

    return {
      serial: assignment.serial,
      machine: machineReading?.machine ?? "Equipamento a definir",
      alias: assignment.alias,
      revealName: assignment.revealName,
      score: breakdown.total,
      maximum: breakdown.maximum,
      breakdown,
      periodScores: periodBreakdowns.map((item) => item.total),
      position: 0,
    } satisfies RankingEntry;
  });

  entries.sort((a, b) => b.score - a.score || a.alias.localeCompare(b.alias));
  entries.forEach((entry, index) => {
    entry.position = index + 1;
  });

  return { entries, isOfficial, availableTrackedPeriods };
}
