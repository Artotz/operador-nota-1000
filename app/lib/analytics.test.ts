import { describe, expect, it } from "vitest";
import rawReadings from "@/app/data/machine-readings.json";
import { operatorAssignments, reportingPeriods } from "@/app/data/project-data";
import { aggregateReadings, buildRanking, telemetryScore } from "@/app/lib/analytics";
import type { AggregatedMetrics, MachineReading } from "@/app/lib/types";

const readings = rawReadings as MachineReading[];

describe("aggregateReadings", () => {
  it("pondera as métricas consolidadas pelas horas operadas", () => {
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

  it("aplica os limites máximos dos três critérios", () => {
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

  it("zera critérios fora das faixas intermediárias", () => {
    expect(telemetryScore(metrics(29, 25.01, 74.99), 30)).toEqual({
      consumption: 0,
      idle: 0,
      productive: 0,
    });
  });
});

describe("buildRanking", () => {
  it("mantém uma entrada por chassi e sinaliza a apuração atual como provisória", () => {
    const result = buildRanking(readings, reportingPeriods, operatorAssignments);
    expect(result.isOfficial).toBe(false);
    expect(result.entries).toHaveLength(5);
    expect(new Set(result.entries.map((entry) => entry.serial)).size).toBe(5);
    expect(result.entries.every((entry) => entry.maximum === 75)).toBe(true);
    expect(result.availableTrackedPeriods).toHaveLength(3);
  });

  it("só inclui os pontos humanos quando a última quinzena e todas as avaliações existem", () => {
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
        .map((period) => ({ periodId: period.id, safety: 10, assetCare: 10, attendance: 5 })),
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
