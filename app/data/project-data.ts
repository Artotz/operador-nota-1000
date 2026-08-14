import type { OperatorAssignment, ReportingPeriod } from "@/app/lib/types";

export const reportingPeriods: ReportingPeriod[] = [
  {
    id: "may",
    label: "Mai",
    longLabel: "01/05 a 31/05",
    start: "2026-05-01",
    end: "2026-05-31",
    phase: "baseline",
    phaseLabel: "Antes do acompanhamento",
  },
  {
    id: "june",
    label: "Jun",
    longLabel: "01/06 a 30/06",
    start: "2026-06-01",
    end: "2026-06-30",
    phase: "window1",
    phaseLabel: "1ª janela de acompanhamento",
  },
  {
    id: "july",
    label: "Jul",
    longLabel: "01/07 a 31/07",
    start: "2026-07-01",
    end: "2026-07-31",
    phase: "window2",
    phaseLabel: "2ª janela de acompanhamento",
  },
  {
    id: "august",
    label: "Ago",
    longLabel: "01/08 a 13/08",
    start: "2026-08-01",
    end: "2026-08-13",
    phase: "window3",
    phaseLabel: "3ª janela de acompanhamento",
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
      { periodId: "july", safety: 10, assetCare: 10, attendance: 5 },
      { periodId: "august", safety: 10, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "luciano-damasceno-ferreira",
    serial: "1F9350PAERD000027",
    alias: "EEH-34",
    revealName: "Luciano Damasceno Ferreira",
    behaviorScores: [
      { periodId: "july", safety: 10, assetCare: 10, attendance: 5 },
      { periodId: "august", safety: 10, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "cristiano-jose-de-moura",
    serial: "1F9350PAHRD000026",
    alias: "EEH-35",
    revealName: "Cristiano José de Moura",
    behaviorScores: [
      { periodId: "july", safety: 8, assetCare: 10, attendance: 5 },
      { periodId: "august", safety: 8, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "paulo-cesar-ferreira-de-melo",
    serial: "1F9350PACRD000031",
    alias: "EEH-36",
    revealName: "Paulo Cesar Ferreira de Melo",
    behaviorScores: [
      { periodId: "july", safety: 10, assetCare: 10, attendance: 5 },
      { periodId: "august", safety: 10, assetCare: 10, attendance: 5 },
    ],
  },
  {
    operatorId: "quiterio-de-santana-do-ipanema",
    serial: "1F9350PAPRD000033",
    alias: "EEH-37",
    revealName: "Quitério de Santana do Ipanema",
    behaviorScores: [
      { periodId: "july", safety: 0, assetCare: 0, attendance: 0 },
      { periodId: "august", safety: 0, assetCare: 0, attendance: 0 },
    ],
  },
];
