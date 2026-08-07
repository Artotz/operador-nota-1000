import { describe, expect, it } from "vitest";
import rawReadings from "@/app/data/machine-readings.json";
import { operatorAssignments, reportingPeriods } from "@/app/data/project-data";
import {
  aggregateReadings,
  buildOperationalImpact,
  buildRanking,
  telemetryScore,
} from "@/app/lib/analytics";
import type { AggregatedMetrics, MachineReading } from "@/app/lib/types";

const readings = rawReadings as MachineReading[];

describe("aggregateReadings", () => {
  it("pondera as metricas consolidadas pelas horas operadas", () => {
    const before = readings.filter((reading) => reading.periodStart < "2026-06-14");
    const firstWindow = readings.filter(
      (reading) =>
        reading.periodStart >= "2026-06-14" && reading.periodStart < "2026-07-14",
    );
    const secondWindow = readings.filter((reading) => reading.periodStart >= "2026-07-14");

    expect(aggregateReadings(before)).toMatchObject({
      consumption: expect.closeTo(29.758, 3),
      idle: expect.closeTo(25.59, 2),
      productive: expect.closeTo(74.41, 2),
    });
    expect(aggregateReadings(firstWindow)).toMatchObject({
      consumption: expect.closeTo(28.32, 2),
      idle: expect.closeTo(26.01, 2),
      productive: expect.closeTo(73.99, 2),
    });
    expect(aggregateReadings(secondWindow)).toMatchObject({
      consumption: expect.closeTo(29.13, 2),
      idle: expect.closeTo(20.24, 2),
      productive: expect.closeTo(79.76, 2),
    });
  });
});

describe("telemetryScore", () => {
  const metrics = (consumption: number, idle: number, productive: number) =>
    ({ consumption, idle, productive } as AggregatedMetrics);

  it("aplica os limites maximos dos tres criterios", () => {
    expect(telemetryScore(metrics(26, 20, 80), 30)).toEqual({
      consumption: 25,
      idle: 25,
      productive: 25,
    });
  });

  it("atribui dez pontos quando o consumo cai pelo menos cinco por cento", () => {
    expect(telemetryScore(metrics(28.5, 25, 75), 30)).toEqual({
      consumption: 10,
      idle: 10,
      productive: 10,
    });
  });

  it("zera criterios fora das faixas intermediarias", () => {
    expect(telemetryScore(metrics(29, 25.01, 74.99), 30)).toEqual({
      consumption: 0,
      idle: 0,
      productive: 0,
    });
  });
});

describe("buildRanking", () => {
  it("usa somente a ultima quinzena acompanhada, com totais inteiros de ate 100", () => {
    const result = buildRanking(readings, reportingPeriods, operatorAssignments);
    expect(result.isOfficial).toBe(false);
    expect(result.entries).toHaveLength(5);
    expect(new Set(result.entries.map((entry) => entry.serial)).size).toBe(5);
    expect(result.entries.every((entry) => entry.maximum === 100)).toBe(true);
    expect(result.entries.every((entry) => Number.isInteger(entry.score))).toBe(true);
    expect(result.entries.every((entry) => entry.periodScores.length === 1)).toBe(true);
    expect(result.entries.every((entry) => entry.breakdown.safety === 10)).toBe(true);
    expect(result.entries.every((entry) => entry.breakdown.assetCare === 10)).toBe(true);
    expect(result.entries.every((entry) => entry.breakdown.attendance === 5)).toBe(true);
    expect(result.availableTrackedPeriods).toHaveLength(3);

    const latestPeriod = reportingPeriods.find((period) => period.id === "window-2a");
    expect(latestPeriod).toBeDefined();
    result.entries.forEach((entry) => {
      const baseline = aggregateReadings(
        readings.filter(
          (reading) =>
            reading.serial === entry.serial && reading.periodStart < "2026-06-14",
        ),
      );
      const latestReading = readings.find(
        (reading) =>
          reading.serial === entry.serial && reading.periodStart === latestPeriod?.start,
      );
      expect(latestReading).toBeDefined();
      const telemetry = telemetryScore(aggregateReadings([latestReading!]), baseline.consumption);
      expect(entry.score).toBe(
        telemetry.consumption + telemetry.idle + telemetry.productive + 10 + 10 + 5,
      );
    });
  });

  it("so se torna oficial com a ultima janela esperada e suas avaliacoes", () => {
    const lastKnownBySerial = new Map(
      readings
        .filter((reading) => reading.periodStart === "2026-07-14")
        .map((reading) => [reading.serial, reading]),
    );
    const finalReadings = [...lastKnownBySerial.values()].map((reading) => ({
      ...reading,
      periodStart: "2026-07-30",
      periodEnd: "2026-08-13",
      source: "teste.xlsx",
    }));
    const completeAssignments = operatorAssignments.map((assignment) => ({
      ...assignment,
      behaviorScores: reportingPeriods
        .filter((period) => period.phase !== "baseline")
        .map((period) => ({
          periodId: period.id,
          safety: 10 as const,
          assetCare: 10 as const,
          attendance: 5 as const,
        })),
    }));

    const result = buildRanking(
      [...readings, ...finalReadings],
      reportingPeriods,
      completeAssignments,
    );
    expect(result.isOfficial).toBe(true);
    expect(result.entries.every((entry) => entry.maximum === 100)).toBe(true);
    expect(result.entries.every((entry) => entry.breakdown.safety === 10)).toBe(true);
  });
});

describe("buildOperationalImpact", () => {
  it("compara as duas quinzenas de baseline com todo o acompanhamento disponivel", () => {
    const result = buildOperationalImpact(readings, reportingPeriods);
    const baseline = aggregateReadings(
      readings.filter((reading) => reading.periodStart < "2026-06-14"),
    );
    const monitoring = aggregateReadings(
      readings.filter((reading) => reading.periodStart >= "2026-06-14"),
    );
    const expectedLiters = Math.max(
      0,
      baseline.consumption * monitoring.engineHours - monitoring.fuelConsumed,
    );
    const expectedIdleHours = Math.max(
      0,
      (baseline.idle / 100) * monitoring.engineHours - monitoring.idleHours,
    );

    expect(result.baseline.operatingHours).toBeCloseTo(baseline.engineHours);
    expect(result.monitoring.operatingHours).toBeCloseTo(monitoring.engineHours);
    expect(result.monitoring.periodMachineCount).toBe(15);
    expect(result.monitoring.averageHoursPerPeriodMachine).toBeCloseTo(
      monitoring.engineHours / 15,
    );
    expect(result.avoidedLiters).toBeCloseTo(expectedLiters);
    expect(result.estimatedDieselSavings).toBeCloseTo(expectedLiters * 6);
    expect(result.avoidedIdleHours).toBeCloseTo(expectedIdleHours);
  });

  it("nunca retorna impacto negativo e aceita preco de diesel configuravel", () => {
    const worseMonitoring = readings.map((reading) =>
      reading.periodStart < "2026-06-14"
        ? reading
        : {
            ...reading,
            fuelConsumed: reading.fuelConsumed * 2,
            idleHours: reading.idleHours + reading.productiveHours,
            productiveHours: 0,
          },
    );
    const result = buildOperationalImpact(worseMonitoring, reportingPeriods, -3);

    expect(result.dieselPricePerLiter).toBe(0);
    expect(result.avoidedLiters).toBe(0);
    expect(result.estimatedDieselSavings).toBe(0);
    expect(result.avoidedIdleHours).toBe(0);
  });
});
