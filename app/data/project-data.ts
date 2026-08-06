import type { OperatorAssignment, ReportingPeriod } from "@/app/lib/types";

export const reportingPeriods: ReportingPeriod[] = [
  {
    id: "baseline-1",
    label: "14–29 mai",
    longLabel: "14/05 a 29/05",
    start: "2026-05-14",
    end: "2026-05-29",
    phase: "baseline",
    phaseLabel: "Antes do acompanhamento",
  },
  {
    id: "baseline-2",
    label: "30 mai–13 jun",
    longLabel: "30/05 a 13/06",
    start: "2026-05-30",
    end: "2026-06-13",
    phase: "baseline",
    phaseLabel: "Antes do acompanhamento",
  },
  {
    id: "window-1a",
    label: "14–29 jun",
    longLabel: "14/06 a 29/06",
    start: "2026-06-14",
    end: "2026-06-29",
    phase: "window1",
    phaseLabel: "1ª janela de acompanhamento",
  },
  {
    id: "window-1b",
    label: "30 jun–13 jul",
    longLabel: "30/06 a 13/07",
    start: "2026-06-30",
    end: "2026-07-13",
    phase: "window1",
    phaseLabel: "1ª janela de acompanhamento",
  },
  {
    id: "window-2a",
    label: "14–29 jul",
    longLabel: "14/07 a 29/07",
    start: "2026-07-14",
    end: "2026-07-29",
    phase: "window2",
    phaseLabel: "2ª janela de acompanhamento",
  },
  {
    id: "window-2b",
    label: "30 jul–13 ago",
    longLabel: "30/07 a 13/08",
    start: "2026-07-30",
    end: "2026-08-13",
    phase: "window2",
    phaseLabel: "2ª janela de acompanhamento",
  },
];

export const operatorAssignments: OperatorAssignment[] = [
  {
    serial: "1F9350PACRD000028",
    alias: "Operador 01",
    revealName: "Nome a definir",
    behaviorScores: [],
  },
  {
    serial: "1F9350PAERD000027",
    alias: "Operador 02",
    revealName: "Nome a definir",
    behaviorScores: [],
  },
  {
    serial: "1F9350PAHRD000026",
    alias: "Operador 03",
    revealName: "Nome a definir",
    behaviorScores: [],
  },
  {
    serial: "1F9350PACRD000031",
    alias: "Operador 04",
    revealName: "Nome a definir",
    behaviorScores: [],
  },
  {
    serial: "1F9350PAPRD000033",
    alias: "Operador 05",
    revealName: "Nome a definir",
    behaviorScores: [],
  },
];
