import type {
  AggregatedMetrics,
  MachineReading,
  OperationalImpact,
  OperatorAssignment,
  RankingEntry,
  ReportingPeriod,
  ScoreBreakdown,
} from "@/app/lib/types";

export const round = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

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
    consumption: average(readings.map((item) => item.averageFuelRate)),
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

const nonNegative = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

function calendarDaysInclusive(start: string | null, end: string | null) {
  if (!start || !end) return 0;
  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);
  const difference = endDate.getTime() - startDate.getTime();
  return Number.isFinite(difference) && difference >= 0
    ? Math.floor(difference / 86_400_000) + 1
    : 0;
}

export function buildOperationalImpact(
  readings: MachineReading[],
  periods: ReportingPeriod[],
  dieselPricePerLiter = 6,
): OperationalImpact {
  const baselinePeriods = periods.filter((period) => period.phase === "baseline");
  const monitoringPeriods = periods.filter((period) => period.phase !== "baseline");
  const baselineReadings = readings.filter((reading) =>
    baselinePeriods.some((period) => period.start === reading.periodStart),
  );
  const allMonitoringReadings = readings.filter((reading) =>
    monitoringPeriods.some((period) => period.start === reading.periodStart),
  );
  const availableMonitoringPeriods = monitoringPeriods.filter((period) =>
    allMonitoringReadings.some((reading) => reading.periodStart === period.start),
  );
  const finalMonitoringPeriod = availableMonitoringPeriods.at(-1);
  const baseline = aggregateReadings(baselineReadings);
  const monitoring = aggregateReadings(allMonitoringReadings);
  const periodMachineCount = new Set(
    allMonitoringReadings.map((reading) => `${reading.periodStart}:${reading.serial}`),
  ).size;
  const price = nonNegative(dieselPricePerLiter);
  const periodResults = availableMonitoringPeriods.map((period) => {
    const metrics = aggregateReadings(
      allMonitoringReadings.filter((reading) => reading.periodStart === period.start),
    );
    const avoidedLiters = nonNegative(
      (baseline.consumption - metrics.consumption) * metrics.engineHours,
    );
    const avoidedIdleHours = nonNegative(
      ((baseline.idle - metrics.idle) / 100) * metrics.engineHours,
    );

    return {
      id: period.id,
      label: period.label,
      longLabel: period.longLabel,
      start: period.start,
      end: period.end,
      operatingHours: nonNegative(metrics.engineHours),
      averageFuelRate: nonNegative(metrics.consumption),
      idleRate: nonNegative(metrics.idle),
      observedDays: calendarDaysInclusive(period.start, period.end),
      avoidedLiters,
      estimatedDieselSavings: avoidedLiters * price,
      avoidedIdleHours,
    };
  });
  const avoidedLiters = periodResults.reduce((total, period) => total + period.avoidedLiters, 0);
  const avoidedIdleHours = periodResults.reduce((total, period) => total + period.avoidedIdleHours, 0);
  const monitoringStart = availableMonitoringPeriods[0]?.start ?? null;
  const monitoringEnd = finalMonitoringPeriod?.end ?? null;
  const observedDays = periodResults.reduce((total, period) => total + period.observedDays, 0);
  const yearEnd = monitoringEnd ? `${monitoringEnd.slice(0, 4)}-12-31` : null;
  const remainingDays = Math.max(0, calendarDaysInclusive(monitoringEnd, yearEnd) - 1);
  const projectedDays = observedDays + remainingDays;
  const finalPeriodResult = periodResults.at(-1);
  const projectedLiters = finalPeriodResult?.observedDays
    ? avoidedLiters + (finalPeriodResult.avoidedLiters / finalPeriodResult.observedDays) * remainingDays
    : avoidedLiters;
  const projectedIdleHours = finalPeriodResult?.observedDays
    ? avoidedIdleHours + (finalPeriodResult.avoidedIdleHours / finalPeriodResult.observedDays) * remainingDays
    : avoidedIdleHours;

  return {
    baseline: {
      operatingHours: nonNegative(baseline.engineHours),
      averageFuelRate: nonNegative(baseline.consumption),
      idleHours: nonNegative(baseline.idleHours),
      idleRate: nonNegative(baseline.idle),
    },
    monitoring: {
      operatingHours: nonNegative(monitoring.engineHours),
      averageHoursPerPeriodMachine: periodMachineCount
        ? nonNegative(monitoring.engineHours / periodMachineCount)
        : 0,
      idleHours: nonNegative(monitoring.idleHours),
      idleRate: nonNegative(monitoring.idle),
      periodMachineCount,
      start: monitoringStart,
      end: monitoringEnd,
      observedDays,
    },
    periods: periodResults,
    dieselPricePerLiter: price,
    avoidedLiters,
    estimatedDieselSavings: avoidedLiters * price,
    avoidedIdleHours,
    projectedThroughYearEnd: {
      end: yearEnd,
      days: projectedDays,
      remainingDays,
      avoidedLiters: projectedLiters,
      estimatedDieselSavings: projectedLiters * price,
      avoidedIdleHours: projectedIdleHours,
    },
  };
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
  const scoringPeriod = availableTrackedPeriods.at(-1);
  const finalPeriod = trackedPeriods.at(-1);
  const operatorGroups = Array.from(
    assignments.reduce((groups, assignment) => {
      const group = groups.get(assignment.operatorId) ?? [];
      group.push(assignment);
      groups.set(assignment.operatorId, group);
      return groups;
    }, new Map<string, OperatorAssignment[]>()),
  ).map(([, group]) => group);
  const behaviorFor = (group: OperatorAssignment[], periodId: string) =>
    group.flatMap((assignment) => assignment.behaviorScores).find(
      (score) => score.periodId === periodId,
    );
  const finalPeriodAvailable = Boolean(finalPeriod) && assignments.every(
    (assignment) =>
      readings.some(
        (reading) =>
          reading.serial === assignment.serial && reading.periodStart === finalPeriod?.start,
      ),
  );
  const finalBehaviorComplete = Boolean(finalPeriod) && operatorGroups.every((group) =>
    Boolean(finalPeriod && behaviorFor(group, finalPeriod.id)),
  );
  const behaviorComplete = Boolean(scoringPeriod) && operatorGroups.every((group) =>
    Boolean(scoringPeriod && behaviorFor(group, scoringPeriod.id)),
  );
  const missingBehaviorNames = scoringPeriod
    ? operatorGroups
      .filter((group) => !behaviorFor(group, scoringPeriod.id))
      .map((group) => group[0].revealName)
    : operatorGroups.map((group) => group[0].revealName);
  const isOfficial = Boolean(finalPeriodAvailable && finalBehaviorComplete);

  const entries = operatorGroups.map((group) => {
    const primaryAssignment = group[0];
    const serials = group.map((assignment) => assignment.serial);
    const serialSet = new Set(serials);
    const machines = group.map((assignment) =>
      readings.find((reading) => reading.serial === assignment.serial)?.machine ?? assignment.alias,
    );
    const baseline = aggregateReadings(
      readings.filter(
        (reading) =>
          serialSet.has(reading.serial) &&
          baselinePeriods.some((period) => period.start === reading.periodStart),
      ),
    );

    const periodBreakdowns = scoringPeriod ? [scoringPeriod].flatMap((period) => {
      const periodReadings = readings.filter(
        (reading) =>
          serialSet.has(reading.serial) && reading.periodStart === period.start,
      );
      if (!periodReadings.length) return [];

      const telemetry = telemetryScore(
        aggregateReadings(periodReadings),
        baseline.consumption,
      );
      const behavior = behaviorComplete ? behaviorFor(group, period.id) : undefined;
      const safety = behavior?.safety ?? 0;
      const assetCare = behavior?.assetCare ?? 0;
      const attendance = behavior?.attendance ?? 0;

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
          maximum: behaviorComplete ? 100 as const : 75 as const,
        },
      ];
    }) : [];

    const breakdown: ScoreBreakdown = {
      consumption: average(periodBreakdowns.map((item) => item.consumption)),
      idle: average(periodBreakdowns.map((item) => item.idle)),
      productive: average(periodBreakdowns.map((item) => item.productive)),
      safety: average(periodBreakdowns.map((item) => item.safety)),
      assetCare: average(periodBreakdowns.map((item) => item.assetCare)),
      attendance: average(periodBreakdowns.map((item) => item.attendance)),
      total: average(periodBreakdowns.map((item) => item.total)),
      maximum: behaviorComplete ? 100 : 75,
    };

    return {
      id: primaryAssignment.operatorId,
      serial: primaryAssignment.serial,
      serials,
      machine: machines.join(" + "),
      alias: group.map((assignment) => assignment.alias).join(" + "),
      revealName: primaryAssignment.revealName,
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

  return {
    entries,
    isOfficial,
    behaviorComplete,
    missingBehaviorNames,
    finalPeriodAvailable,
    availableTrackedPeriods,
  };
}
