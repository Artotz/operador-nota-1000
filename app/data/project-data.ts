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

// Vínculos de máquina: painel HTML legado em edu. Nomes e avaliações: relatório
// de avaliação. A assiduidade do relatório (escala 0–10) é convertida para 0–5.
export const operatorAssignments: OperatorAssignment[] = [
  {
    operatorId: "paulo-cesar-ferreira-de-melo",
    serial: "1F9350PACRD000028",
    alias: "EEH-33",
    revealName: "Paulo Cesar Ferreira de Melo",
    behaviorScores: [
      { periodId: "window-2a", safety: 10, assetCare: 10, attendance: 5 },
      { periodId: "window-2b", safety: 10, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "luciano-damasceno-ferreira",
    serial: "1F9350PAERD000027",
    alias: "EEH-34",
    revealName: "Luciano Damasceno Ferreira",
    behaviorScores: [
      { periodId: "window-2a", safety: 10, assetCare: 10, attendance: 5 },
      { periodId: "window-2b", safety: 10, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "cristiano-jose-de-moura",
    serial: "1F9350PAHRD000026",
    alias: "EEH-35",
    revealName: "Cristiano José de Moura",
    behaviorScores: [
      { periodId: "window-2a", safety: 8, assetCare: 10, attendance: 5 },
      { periodId: "window-2b", safety: 8, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "paulo-cesar-ferreira-de-melo",
    serial: "1F9350PACRD000031",
    alias: "EEH-36",
    revealName: "Paulo Cesar Ferreira de Melo",
    behaviorScores: [
      { periodId: "window-2a", safety: 10, assetCare: 10, attendance: 5 },
      { periodId: "window-2b", safety: 10, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "quiterio-de-santana-do-ipanema",
    serial: "1F9350PAPRD000033",
    alias: "EEH-37",
    revealName: "Quitério de Santana do Ipanema",
    behaviorScores: [
      { periodId: "window-2a", safety: 0, assetCare: 0, attendance: 0 },
      { periodId: "window-2b", safety: 0, assetCare: 0, attendance: 0 },
    ],
  },
];
