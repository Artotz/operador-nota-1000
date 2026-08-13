"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RoadmapSection } from "@/app/components/RoadmapSection";
import machineReadings from "@/app/data/machine-readings.json";
import { operatorAssignments, reportingPeriods } from "@/app/data/project-data";
import { aggregateReadings, buildOperationalImpact, buildRanking, round } from "@/app/lib/analytics";
import type { MachineReading, MetricKey, PhaseKey, ReportingPeriod } from "@/app/lib/types";

const readings = machineReadings as MachineReading[];

const sections = [
  ["abertura", "Abertura"],
  ["roadmap", "Roadmap"],
  ["criterios", "Critérios"],
  ["evolucao", "Consolidado"],
  ["operadores", "Operadores"],
  ["podio", "Pódio"],
  ["economias", "Economias"],
  ["continuidade", "Próximos passos"],
  ["parceiros", "Parceiros"],
] as const;

const metricConfig = {
  consumption: {
    label: "Consumo",
    description: "Litros consumidos por hora de motor",
    color: "#f4c400",
    target: 26,
    lowerIsBetter: true,
  },
  idle: {
    label: "Ociosidade",
    description: "Tempo de motor ligado sem produção",
    color: "#f97316",
    target: 20,
    lowerIsBetter: true,
  },
  productive: {
    label: "Produtividade",
    description: "Tempo efetivamente trabalhando",
    color: "#84cc16",
    target: 80,
    lowerIsBetter: false,
  },
  hours: {
    label: "Horas",
    description: "Horas totais de motor no período",
    color: "#38bdf8",
    target: null,
    lowerIsBetter: false,
  },
} satisfies Record<MetricKey, { label: string; description: string; color: string; target: number | null; lowerIsBetter: boolean }>;

const chartMetrics = [
  "consumption",
  "idle",
  "productive",
  // "hours",
] satisfies MetricKey[];

const criteria = [
  { number: "01", title: "Consumo", points: "25 pts", rule: "Abaixo de 26 l/h vale 25 pontos; redução de 5% vale 10." },
  { number: "02", title: "Ociosidade", points: "25 pts", rule: "Até 20% vale 25 pontos; até 25% garante 10." },
  { number: "03", title: "Horas produtivas", points: "25 pts", rule: "80% ou mais vale 25 pontos; acima de 75% vale 10." },
  { number: "04", title: "Segurança", points: "10 pts", rule: "Uso correto de EPIs e respeito às normas da operação." },
  { number: "05", title: "Cuidado com o ativo", points: "10 pts", rule: "Inspeção diária, limpeza e uso correto do equipamento." },
  { number: "06", title: "Assiduidade", points: "5 pts", rule: "Presença e pontualidade mínima de 90% durante o projeto." },
];

const operatorColors = ["#f4c400", "#38bdf8", "#fb7185", "#a3e635", "#c084fc"];

type OperatorParticipant = {
  id: string;
  name: string;
  serials: string[];
};

const operatorParticipants = operatorAssignments.reduce<OperatorParticipant[]>((participants, assignment) => {
  const participant = participants.find((item) => item.id === assignment.operatorId);
  if (participant) participant.serials.push(assignment.serial);
  else participants.push({ id: assignment.operatorId, name: assignment.revealName, serials: [assignment.serial] });
  return participants;
}, []);

const equipmentImageCounts = {
  "EEH-33": 5,
  "EEH-34": 4,
  "EEH-35": 3,
  "EEH-36": 6,
  "EEH-37": 5,
} as const;

type EquipmentAlias = keyof typeof equipmentImageCounts;
type EquipmentCareImage = { src: string; alt: string };

const equipmentCareRecords = (Object.entries(equipmentImageCounts) as [EquipmentAlias, number][]).map(([alias, count]) => ({
  alias,
  images: Array.from({ length: count }, (_, index): EquipmentCareImage => ({
    src: `/project-assets/equipment-care/${alias}/${alias.toLowerCase()}-${String(index + 1).padStart(2, "0")}.jpg`,
    alt: `${alias} — registro de inspeção ${index + 1}`,
  })),
}));

function useScrollStory() {
  const [activeSection, setActiveSection] = useState("abertura");

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.13 },
    );
    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    const sectionElements = sections
      .map(([id]) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const updateActiveSection = () => {
      // Observer callback entries are incremental and can omit a section while scrolling.
      const readingPoint = window.innerHeight * 0.42;
      let nextSection = sectionElements[0]?.id ?? "abertura";

      for (const section of sectionElements) {
        if (section.getBoundingClientRect().top > readingPoint) break;
        nextSection = section.id;
      }

      setActiveSection((current) => current === nextSection ? current : nextSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return activeSection;
}

function metricValue(readingGroup: MachineReading[], metric: MetricKey) {
  if (!readingGroup.length) return null;
  const aggregated = aggregateReadings(readingGroup);
  return round(metric === "hours" ? aggregated.engineHours : aggregated[metric], 2);
}

function buildPeriodSeries(metric: MetricKey, serial?: string) {
  return reportingPeriods.map((period) => {
    const matches = readings.filter(
      (reading) => reading.periodStart === period.start && (!serial || reading.serial === serial),
    );
    return {
      id: period.id,
      period: period.label,
      longLabel: period.longLabel,
      phase: period.phase,
      value: metricValue(matches, metric),
    };
  });
}

function formatMetric(value: number | null, metric: MetricKey) {
  if (value === null) return "—";
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${
    metric === "consumption" ? " l/h" : metric === "hours" ? " h" : "%"
  }`;
}

function formatHours(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h`;
}

function MetricToggle({ metric, onChange }: { metric: MetricKey; onChange: (metric: MetricKey) => void }) {
  return (
    <div className="metric-toggle" role="group" aria-label="Escolha o indicador">
      {chartMetrics.map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={metric === key}
          className={metric === key ? "is-active" : ""}
          onClick={() => onChange(key)}
        >
          {metricConfig[key].label}
        </button>
      ))}
    </div>
  );
}

type TooltipItem = { value?: number; color?: string; name?: string; dataKey?: string };

function ChartTooltip({ active, payload, label, metric }: { active?: boolean; payload?: TooltipItem[]; label?: string; metric: MetricKey }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      {payload.map((item) => (
        <p key={item.dataKey ?? item.name}>
          <i style={{ background: item.color }} />
          {item.name ? `${item.name}: ` : ""}
          <strong>{formatMetric(item.value ?? null, metric)}</strong>
        </p>
      ))}
    </div>
  );
}

function StoryRail({ active }: { active: string }) {
  return (
    <nav className="story-rail" aria-label="Etapas da apresentação">
      <div className="rail-line" aria-hidden="true" />
      {sections.map(([id, label], index) => (
        <button
          key={id}
          type="button"
          className={active === id ? "is-active" : ""}
          aria-label={`Ir para ${label}`}
          aria-current={active === id ? "step" : undefined}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{label}</b>
        </button>
      ))}
    </nav>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <header className="section-heading reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-intro">{text}</p>
    </header>
  );
}

function ScoreFormula() {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState([0, 0, 0]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let timer = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      const targets = [75, 25, 100];
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValues(targets);
        return;
      }
      const animateStep = (step: number) => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 620);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValues((current) => current.map((value, index) => index === step ? Math.round(targets[step] * eased) : value));
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          } else if (step < targets.length - 1) {
            timer = window.setTimeout(() => animateStep(step + 1), 180);
          }
        };
        frame = requestAnimationFrame(tick);
      };
      animateStep(0);
    }, { threshold: 0.72, rootMargin: "-24% 0px -24%" });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="score-formula reveal" ref={ref} aria-label="75 pontos de telemetria mais 25 pontos humanos, total de 100 pontos">
      <div><strong>{values[0]}</strong><span>pontos de telemetria</span></div>
      <i aria-hidden="true">+</i>
      <div><strong>{values[1]}</strong><span>pontos humanos</span></div>
      <i aria-hidden="true">=</i>
      <div className="total"><strong>{values[2]}</strong><span>pontos possíveis</span></div>
    </div>
  );
}

function PeriodStrip({ periods }: { periods: ReportingPeriod[] }) {
  return (
    <div className="period-strip reveal" aria-label="Janelas de medição do projeto">
      {(["baseline", "window1", "window2"] as PhaseKey[]).map((phase, index) => {
        const group = periods.filter((period) => period.phase === phase);
        const available = group.filter((period) => readings.some((reading) => reading.periodStart === period.start));
        const complete = available.length === group.length;
        return (
          <article key={phase} className={complete ? "" : "is-partial"}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <b>{group[0].phaseLabel}</b>
              <p>{group.map((period) => period.longLabel).join(" • ")}</p>
            </div>
            <em>{complete ? "Concluída" : `${available.length}/${group.length} recebidas`}</em>
          </article>
        );
      })}
    </div>
  );
}

function ConsolidatedSection() {
  const [metric, setMetric] = useState<MetricKey>("consumption");
  const series = useMemo(() => buildPeriodSeries(metric), [metric]);
  const config = metricConfig[metric];
  const baselineStarts = new Set(reportingPeriods.filter((period) => period.phase === "baseline").map((period) => period.start));
  const evaluationStarts = new Set(reportingPeriods.filter((period) => period.phase !== "baseline").map((period) => period.start));
  const baselineAverage = metricValue(readings.filter((reading) => baselineStarts.has(reading.periodStart)), metric) ?? 0;
  const periodAverage = metricValue(readings.filter((reading) => evaluationStarts.has(reading.periodStart)), metric) ?? 0;
  const available = series.filter((item) => item.value !== null);
  const first = available[0]?.value ?? 0;
  const latest = available.at(-1)?.value ?? 0;
  const usesPeriodAverage = metric === "consumption";
  const startValue = usesPeriodAverage ? baselineAverage : first;
  const endValue = usesPeriodAverage ? periodAverage : latest;
  const improvement = config.lowerIsBetter ? startValue - endValue : endValue - startValue;

  return (
    <section id="evolucao" className="story-section data-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="04 — Evolução consolidada"
          title="Seis quinzenas. Uma operação em movimento."
          text="Os dados da frota foram ponderados pelas horas efetivamente operadas para comparar períodos de intensidades diferentes."
        />
        <PeriodStrip periods={reportingPeriods} />
        <div className="chart-card reveal">
          <div className="chart-card-head">
            <div>
              <span className="chart-kicker">Indicador selecionado</span>
              <h3>{config.label}</h3>
              <p>{config.description}</p>
            </div>
            <MetricToggle metric={metric} onChange={setMetric} />
          </div>
          <div className="chart-summary">
            <div><span>{usesPeriodAverage ? "Consumo prévio médio" : "Início"}</span><strong>{formatMetric(startValue, metric)}</strong></div>
            <div><span>{usesPeriodAverage ? "Média do período" : "Último registro"}</span><strong>{formatMetric(endValue, metric)}</strong></div>
            <div className={improvement >= 0 ? "positive" : "negative"}>
              <span>{usesPeriodAverage ? "Ganho médio no período" : "Ganho no período"}</span><strong>{improvement >= 0 ? "+" : ""}{formatMetric(improvement, metric)}</strong>
            </div>
          </div>
          <div className="main-chart" aria-label={`Gráfico consolidado de ${config.label}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 32, right: 18, left: -18, bottom: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="period" stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip metric={metric} />} />
                {config.target !== null && (
                  <ReferenceLine y={config.target} stroke="#f4c400" strokeDasharray="5 7" label={{ value: "Desafio", fill: "#f4c400", fontSize: 11 }} />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  name={config.label}
                  stroke={config.color}
                  strokeWidth={4}
                  dot={{ r: 5, fill: "#111511", stroke: config.color, strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: config.color, stroke: "#111511", strokeWidth: 4 }}
                  connectNulls={false}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function OperatorSection() {
  const [metric, setMetric] = useState<MetricKey>("idle");
  const [pinnedOperator, setPinnedOperator] = useState<string | null>(null);
  const [hoveredOperator, setHoveredOperator] = useState<string | null>(null);
  const activeOperator = pinnedOperator ?? hoveredOperator;
  const availablePeriodStarts = new Set(readings.map((reading) => reading.periodStart));
  const latestPeriod = reportingPeriods.filter((period) => availablePeriodStarts.has(period.start)).at(-1);

  const chartData = reportingPeriods.map((period) => {
    const row: Record<string, string | number | null> = { period: period.label };
    operatorParticipants.forEach((participant) => {
      const matches = readings.filter((reading) =>
        reading.periodStart === period.start && participant.serials.includes(reading.serial),
      );
      row[participant.id] = metricValue(matches, metric);
    });
    return row;
  });

  return (
    <section id="operadores" className="story-section operators-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="05 — Visão individual"
          title="Cada linha conta uma história de evolução."
          text="Passe o mouse para destacar um operador. Clique em um cartão para fixar a seleção, comparar a série e revelar os valores sobre cada ponto."
        />
        <div className="operator-dashboard reveal">
          <div className="operator-toolbar">
            <div><span>Comparativo por participante</span><strong>{metricConfig[metric].label}</strong></div>
            <MetricToggle metric={metric} onChange={setMetric} />
          </div>
          <div className="operator-chart" aria-label={`Gráfico por operador de ${metricConfig[metric].label}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 38, right: 20, left: -22, bottom: 4 }}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="period" stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip metric={metric} />} />
                {operatorParticipants.map((participant, index) => {
                  const isActive = !activeOperator || activeOperator === participant.id;
                  return (
                    <Line
                      key={participant.id}
                      type="monotone"
                      dataKey={participant.id}
                      name={participant.name}
                      stroke={operatorColors[index]}
                      strokeWidth={activeOperator === participant.id ? 4 : 2.5}
                      strokeOpacity={isActive ? 1 : 0.14}
                      dot={{ r: activeOperator === participant.id ? 5 : 3, fill: "#111511", strokeWidth: 2 }}
                      connectNulls={false}
                      isAnimationActive={false}
                    >
                      {activeOperator === participant.id && (
                        <LabelList
                          dataKey={participant.id}
                          position="top"
                          offset={13}
                          fill={operatorColors[index]}
                          fontSize={14}
                          fontWeight={900}
                          formatter={(value: unknown) => typeof value === "number" ? value.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : ""}
                        />
                      )}
                    </Line>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="operator-selector" role="group" aria-label="Selecionar operador para comparação">
            {operatorParticipants.map((participant, index) => {
              const latestReadings = latestPeriod
                ? readings.filter((reading) => participant.serials.includes(reading.serial) && reading.periodStart === latestPeriod.start)
                : [];
              const latest = metricValue(latestReadings, metric);
              const latestHours = latestReadings.length ? aggregateReadings(latestReadings).engineHours : 0;
              const trackedStarts = new Set(reportingPeriods.filter((period) => period.phase !== "baseline").map((period) => period.start));
              const trackedHours = aggregateReadings(readings.filter((reading) => participant.serials.includes(reading.serial) && trackedStarts.has(reading.periodStart))).engineHours;
              const isPinned = pinnedOperator === participant.id;
              const isFaded = Boolean(activeOperator && activeOperator !== participant.id);
              return (
                <button
                  type="button"
                  key={participant.id}
                  className={`${isPinned ? "is-pinned" : ""} ${isFaded ? "is-faded" : ""}`}
                  aria-pressed={isPinned}
                  onMouseEnter={() => setHoveredOperator(participant.id)}
                  onMouseLeave={() => setHoveredOperator(null)}
                  onFocus={() => setHoveredOperator(participant.id)}
                  onBlur={() => setHoveredOperator(null)}
                  onClick={() => setPinnedOperator((current) => current === participant.id ? null : participant.id)}
                >
                  <i style={{ backgroundColor: operatorColors[index] }} />
                  <span>{participant.name}</span>
                  <strong>{formatMetric(latest, metric)}</strong>
                  <small>{formatHours(latestHours)} na última quinzena</small>
                  <small>{formatHours(trackedHours)} acompanhadas</small>
                  <em>{isPinned ? "Seleção fixada" : "Clique para fixar"}</em>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Confetti() {
  return (
    <div className="confetti-burst" aria-hidden="true">
      {Array.from({ length: 54 }, (_, index) => {
        const angle = (index / 54) * Math.PI * 2;
        const distance = 90 + (index % 9) * 18;
        const style = {
          "--x": `${Math.cos(angle) * distance}px`,
          "--y": `${Math.sin(angle) * distance + 80}px`,
          "--delay": `${(index % 7) * 38}ms`,
          "--rotate": `${(index * 67) % 720}deg`,
        } as CSSProperties;
        return <i key={index} style={style} />;
      })}
    </div>
  );
}

function PodiumSection() {
  const [revealed, setRevealed] = useState(0);
  const ranking = useMemo(() => buildRanking(readings, reportingPeriods, operatorAssignments), []);
  const topThree = ranking.entries.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const revealLabels = ["Revelar 3º lugar", "Revelar 2º lugar", "Revelar 1º lugar"];
  return (
    <section id="podio" className="story-section podium-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="06 — Reconhecimento"
          title="Chegou a hora de revelar o pódio."
          text={ranking.behaviorComplete
            ? "A nota usa o último período disponível e aplica somente as faixas inteiras previstas: meta, desafio e critérios humanos."
            : "Enquanto a avaliação humana não estiver completa, a classificação usa somente os 75 pontos de telemetria do último período disponível."}
        />
        <div className="podium-grid reveal" aria-live="polite">
          {podiumOrder.map((entry) => {
            const place = entry.position;
            const isRevealed = revealed >= 4 - place;
            const isChampion = place === 1 && isRevealed;
            return (
              <article key={entry.id} className={`podium-card place-${place} ${isRevealed ? "is-revealed" : ""} ${isChampion ? "is-champion" : ""}`}>
                {isChampion && <Confetti />}
                <span className="place-number">{place}º</span>
                <div className="podium-machine" aria-hidden={!isRevealed}>
                  <Image src="/project-assets/brand/escavadeira.png" alt="Escavadeira do projeto" fill sizes="(max-width: 900px) 80vw, 32vw" />
                </div>
                {!isRevealed && <div className="podium-lock" aria-hidden="true"><span>?</span></div>}
                <div className="podium-secret">
                  <p>{isRevealed ? entry.machine : ""}</p>
                  <h3>{isRevealed ? entry.revealName : ""}</h3>
                  <strong>{isRevealed ? `${entry.score} / ${entry.maximum}` : "—"}</strong>
                </div>
                {isRevealed && (
                  <div className="score-parts">
                    <span>Consumo <b>{entry.breakdown.consumption}</b></span>
                    <span>Ociosidade <b>{entry.breakdown.idle}</b></span>
                    <span>Produtividade <b>{entry.breakdown.productive}</b></span>
                    <span>Segurança <b>{ranking.behaviorComplete ? entry.breakdown.safety : "—"}</b></span>
                    <span>Cuidado <b>{ranking.behaviorComplete ? entry.breakdown.assetCare : "—"}</b></span>
                    <span>Assiduidade <b>{ranking.behaviorComplete ? entry.breakdown.attendance : "—"}</b></span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <div className="reveal-control reveal">
          {revealed < 3 ? (
            <button type="button" onClick={() => setRevealed((value) => Math.min(3, value + 1))}>
              <span>{revealLabels[revealed]}</span><i aria-hidden="true">→</i>
            </button>
          ) : (
            <p className="reveal-complete"><span>✦</span> Pódio revelado</p>
          )}
        </div>

        <div className={`ranking-table reveal ${revealed === 3 ? "is-visible-table" : "is-locked-table"}`}>
          {revealed === 3 ? (
            <>
              <div className="ranking-table-head">
                <div><span>Classificação completa</span><h3>Pontuação geral por operador</h3></div>
                <p>Último período recebido • nota inteira de 0 a {ranking.behaviorComplete ? 100 : 75}</p>
              </div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Posição</th><th>Operador</th><th>Máquina</th><th>Telemetria</th><th>Humano</th><th>Total</th></tr></thead>
                  <tbody>
                    {ranking.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td><b>{entry.position}º</b></td>
                        <td>{entry.revealName}</td>
                        <td>{entry.machine}</td>
                        <td>{entry.breakdown.consumption + entry.breakdown.idle + entry.breakdown.productive} / 75</td>
                        <td>{ranking.behaviorComplete
                          ? `${entry.breakdown.safety + entry.breakdown.assetCare + entry.breakdown.attendance} / 25`
                          : "Pendente"}</td>
                        <td><strong>{entry.score} / {entry.maximum}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="table-lock-message"><span aria-hidden="true">⌁</span><p>A tabela geral aparece quando todo o pódio for revelado.</p></div>
          )}
        </div>
      </div>
    </section>
  );
}

function AnimatedEconomyValue({
  value,
  format,
}: {
  value: number;
  format: (current: number) => string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let started = false;
    const animate = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCurrent(value);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 820);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(value * eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      animate();
    }, { threshold: 0.7, rootMargin: "-18% 0px -18%" });
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <strong ref={ref}>{format(current)}</strong>;
}

function EconomySection() {
  const railRef = useRef<HTMLUListElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const dieselPrice = 6.95;
  const impact = buildOperationalImpact(readings, reportingPeriods, dieselPrice);
  // const productivityGain = impact.baseline.idleRate - impact.monitoring.idleRate;
  const monitoringLabel = impact.monitoring.start && impact.monitoring.end
    ? `${impact.monitoring.start.slice(8, 10)}/${impact.monitoring.start.slice(5, 7)} a ${impact.monitoring.end.slice(8, 10)}/${impact.monitoring.end.slice(5, 7)}`
    : "período disponível";
  const projectionLabel = impact.projectedThroughYearEnd.end
    ? `até ${impact.projectedThroughYearEnd.end.slice(8, 10)}/${impact.projectedThroughYearEnd.end.slice(5, 7)}`
    : "até o fim do ano";
  const baselinePeriods = reportingPeriods.filter((period) => period.phase === "baseline");
  const referenceLabel = baselinePeriods.length
    ? `${baselinePeriods[0].longLabel.split(" a ")[0]} a ${baselinePeriods.at(-1)?.longLabel.split(" a ").at(-1)}`
    : "duas primeiras quinzenas";

  const cards = [
    { value: impact.avoidedLiters, format: (value: number) => `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`, label: "combustível poupado acumulado", note: `litros não consumidos entre ${monitoringLabel}, comparados ao consumo de referência` },
    { value: impact.estimatedDieselSavings, format: (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }), label: "economia em diesel acumulada", note: `valor dos ${round(impact.avoidedLiters, 1).toLocaleString("pt-BR")} litros poupados, usando diesel a ${dieselPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })}/L` },
    { value: impact.avoidedIdleHours, format: (value: number) => `+${formatHours(value)}`, label: "horas produtivas geradas", note: "horas que deixaram de ser ociosas e ficaram disponíveis para produzir no período acumulado" },
    { value: impact.projectedThroughYearEnd.avoidedLiters, format: (value: number) => `${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} L`, label: "projeção de combustível poupado", note: `acumulado estimado ${projectionLabel}, mantendo a média diária de todo o período avaliado` },
    { value: impact.projectedThroughYearEnd.estimatedDieselSavings, format: (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }), label: "projeção de economia em diesel", note: `valor estimado ${projectionLabel}, mantendo a média diária de todo o período avaliado` },
    { value: impact.projectedThroughYearEnd.avoidedIdleHours, format: (value: number) => `+${formatHours(value)}`, label: "projeção de horas produtivas", note: `horas acumuladas estimadas ${projectionLabel}, mantendo a média diária de todo o período avaliado` },
    // { value: productivityGain, format: (value: number) => `${value >= 0 ? "+" : ""}${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} p.p.`, label: "ganho médio de produtividade", note: "variação da parcela de horas realmente produtivas. É uma taxa, portanto não deve ser somada nem projetada" },
    { value: 8, format: (value: number) => `${Math.round(value)} dias`, label: "acompanhamento da operação", note: "presença em campo para observar a rotina, orientar a equipe e consolidar boas práticas" },
  ];

  const goToCard = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const normalizedIndex = (index + cards.length) % cards.length;
    const card = rail.children.item(normalizedIndex) as HTMLElement | null;
    if (!card) return;
    if (typeof rail.scrollTo === "function") rail.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    else rail.scrollLeft = card.offsetLeft;
    setActiveCard(normalizedIndex);
  };

  const syncActiveCard = () => {
    const rail = railRef.current;
    if (!rail) return;
    const items = Array.from(rail.children) as HTMLElement[];
    const closest = items.reduce((best, item, index) =>
      Math.abs(item.offsetLeft - rail.scrollLeft) < Math.abs(items[best].offsetLeft - rail.scrollLeft) ? index : best, 0);
    setActiveCard(closest);
  };

  return (
    <section id="economias" className="story-section economy-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="07 — Valor gerado"
          title="Valor acumulado desde o início do acompanhamento."
          text="Veja abaixo o que já foi medido e o que pode ser alcançado até dezembro, sempre comparando a operação com o seu ponto de partida."
        />
        <ol className="value-timeline reveal" aria-label="Datas usadas nos cálculos de valor gerado">
          <li><span>01</span><div><b>Referência · {referenceLabel}</b><p>Mostra o consumo e a ociosidade antes do acompanhamento. Ela é a régua de comparação, não entra na soma.</p></div></li>
          <li><span>02</span><div><b>Acumulado medido · {monitoringLabel}</b><p>Soma todas as quinzenas com dados após a referência. É o valor já gerado de fato.</p></div></li>
          <li><span>03</span><div><b>Projeção · {projectionLabel}</b><p>Parte do acumulado medido e mantém a média diária de todo o período avaliado ({monitoringLabel}). É uma estimativa, não um resultado realizado.</p></div></li>
        </ol>
        <div className="economy-carousel reveal">
          <div className="economy-controls" aria-label="Navegação dos resultados">
            <p><b>{String(activeCard + 1).padStart(2, "0")}</b> / {String(cards.length).padStart(2, "0")} <span>Arraste para passar</span></p>
            <div><button type="button" onClick={() => goToCard(activeCard - 1)} aria-label="Card anterior">←</button><button type="button" onClick={() => goToCard(activeCard + 1)} aria-label="Próximo card">→</button></div>
          </div>
          <ul className="economy-grid" ref={railRef} onScroll={syncActiveCard} aria-live="polite">
            {cards.map((card, index) => (
              <li key={card.label} aria-label={`Resultado ${index + 1} de ${cards.length}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {activeCard === index
                  ? <AnimatedEconomyValue value={card.value} format={card.format} />
                  : <strong>{card.format(card.value)}</strong>}
                <h3>{card.label}</h3>
                <p>{card.note}</p>
              </li>
            ))}
          </ul>
          <div className="economy-pagination" role="group" aria-label="Escolha um resultado">
            {cards.map((card, index) => <button type="button" key={card.label} className={activeCard === index ? "is-active" : ""} aria-label={`Ir para ${card.label}`} aria-pressed={activeCard === index} onClick={() => goToCard(index)}><span /></button>)}
          </div>
        </div>
        <p className="method-note reveal"><b>Como calculamos:</b> para cada hora trabalhada após 14/06, estimamos quanto seria consumido e quanto tempo ficaria ocioso se a operação mantivesse a referência de 14/05 a 13/06. A diferença é o valor gerado. Para a projeção, dividimos o ganho acumulado pelos dias de todo o período avaliado ({monitoringLabel}) e mantemos essa média diária até 31/12. O diesel foi precificado em R$ 6,95/L — média Brasil de 26/07 a 01/08/2026, segundo a <a href="https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arq-sintese-semanal/2026/sintese-precos-31.pdf" target="_blank" rel="noreferrer">ANP</a>.</p>
      </div>
    </section>
  );
}

function operatorGuidance(operatorId: string) {
  const participant = operatorParticipants.find((item) => item.id === operatorId)!;
  const available = reportingPeriods.filter((period) =>
    readings.some((reading) => participant.serials.includes(reading.serial) && reading.periodStart === period.start),
  );
  const period = available.at(-1)!;
  const latest = aggregateReadings(readings.filter((reading) =>
    participant.serials.includes(reading.serial) && reading.periodStart === period.start,
  ));
  const tips: string[] = [];

  if (latest.idle > 25) tips.push("Reduzir o tempo parado: desligar o motor em esperas e alinhar a frente antes de iniciar o turno.");
  else if (latest.idle > 20) tips.push("A ociosidade está próxima da meta; pequenos cortes nas esperas podem levar o resultado ao nível máximo.");
  else tips.push("Ociosidade dentro da meta: mantenha o planejamento da frente e a disciplina de desligamento.");

  if (latest.consumption > 26) tips.push("Evitar acelerações bruscas, usar o modo de trabalho correto e reduzir movimentos improdutivos para baixar o consumo.");
  else tips.push("Consumo dentro da meta: preserve a condução suave e compartilhe as boas práticas com a equipe.");

  if (latest.productive < 75) tips.push("Rever paradas, filas e condições da frente para recuperar tempo efetivamente produtivo.");
  else if (latest.productive < 80) tips.push("A produtividade está na faixa intermediária; eliminar pequenas interrupções aproxima o operador do desafio de 80%.");
  else tips.push("Produtividade no nível de desafio: mantenha o ritmo com segurança e consistência.");

  return { participant, latest, period, tips };
}

function ContinuitySection() {
  const [selectedOperator, setSelectedOperator] = useState(operatorParticipants[0].id);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentAlias>(equipmentCareRecords[0].alias);
  const [openedEquipmentImage, setOpenedEquipmentImage] = useState<EquipmentCareImage | null>(null);
  const guidance = operatorGuidance(selectedOperator);
  const equipmentRecord = equipmentCareRecords.find((record) => record.alias === selectedEquipment) ?? equipmentCareRecords[0];
  const openedEquipmentIndex = openedEquipmentImage
    ? equipmentRecord.images.findIndex((image) => image.src === openedEquipmentImage.src)
    : -1;
  const releaseFocusFromOtherPanel = (panel: HTMLElement) => {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && !panel.contains(focused)) focused.blur();
  };
  const releaseFocusOnMouseLeave = (panel: HTMLElement) => {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && panel.contains(focused)) focused.blur();
  };

  useEffect(() => {
    if (!openedEquipmentImage) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedEquipmentImage(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [openedEquipmentImage]);

  const moveEquipmentLightbox = (direction: -1 | 1) => {
    if (openedEquipmentIndex < 0) return;
    const nextIndex = (openedEquipmentIndex + direction + equipmentRecord.images.length) % equipmentRecord.images.length;
    setOpenedEquipmentImage(equipmentRecord.images[nextIndex]);
  };

  return (
    <section id="continuidade" className="story-section continuity-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="08 — Não acaba por aqui"
          title="O resultado vira hábito. O projeto vira próximo passo."
          text="Recomendações diretas para sustentar o que funcionou e transformar os aprendizados em uma nova frente de valor."
        />
        <div className="continuity-panels reveal">
          <article className="continuity-panel equipment-card" tabIndex={0} onMouseEnter={(event) => releaseFocusFromOtherPanel(event.currentTarget)} onMouseLeave={(event) => releaseFocusOnMouseLeave(event.currentTarget)}>
            <div className="continuity-panel-closed" aria-hidden="true">
              <span>Para os</span><strong>Equipamentos</strong><small>Passe o mouse ou toque para abrir</small><i>+</i>
            </div>
            <div className="continuity-panel-content">
              <span className="card-kicker">Para os equipamentos</span>
              <h3>Manutenção em dia, produção com garantia.</h3>
              <ul className="equipment-checklist">
                <li><b>01</b><div><strong>Troca dos dentes da caçamba</strong><p>Inspecione antes do turno e programe a troca ao encontrar trincas, quebras, folga ou desgaste acentuado. Imobilize o equipamento e siga o procedimento de serviço antes de intervir.</p></div></li>
                <li><b>02</b><div><strong>Limpeza do radiador</strong><p>Com o motor desligado e frio, retire poeira e resíduos no sentido contrário ao fluxo do ar, respeitando a pressão indicada no manual e sem deformar as aletas.</p></div></li>
              </ul>
              <div className="equipment-tip-selector" role="group" aria-label="Escolha um equipamento">
                {equipmentCareRecords.map((record) => (
                  <button
                    type="button"
                    key={record.alias}
                    className={selectedEquipment === record.alias ? "is-active" : ""}
                    aria-pressed={selectedEquipment === record.alias}
                    onClick={() => {
                      setSelectedEquipment(record.alias);
                      setOpenedEquipmentImage(null);
                    }}
                  >
                    {record.alias}
                  </button>
                ))}
              </div>
              <div className="equipment-photo-head"><strong>{selectedEquipment}</strong><span>{equipmentRecord.images.length} registros · clique para ampliar</span></div>
              <div className="equipment-photo-strip" aria-label={`Registros de inspeção do equipamento ${selectedEquipment}`}>
                {equipmentRecord.images.map((image, index) => (
                  <button type="button" key={image.src} onClick={() => setOpenedEquipmentImage(image)} aria-label={`Ampliar registro ${index + 1} do ${selectedEquipment}`}>
                    <Image src={image.src} alt={image.alt} width={180} height={130} loading="lazy" sizes="110px" />
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </div>
          </article>
          <article className="continuity-panel tips-card" tabIndex={0} onMouseEnter={(event) => releaseFocusFromOtherPanel(event.currentTarget)} onMouseLeave={(event) => releaseFocusOnMouseLeave(event.currentTarget)}>
            <div className="continuity-panel-closed" aria-hidden="true">
              <span>Para os</span><strong>Operadores</strong><small>Passe o mouse ou toque para abrir</small><i>+</i>
            </div>
            <div className="continuity-panel-content">
              <span className="card-kicker">Para os operadores</span>
              <h3>Dicas sob medida para cada resultado.</h3>
              <div className="operator-tip-selector" role="group" aria-label="Escolha um operador">
                {operatorParticipants.map((participant) => <button type="button" key={participant.id} className={selectedOperator === participant.id ? "is-active" : ""} aria-pressed={selectedOperator === participant.id} onClick={() => setSelectedOperator(participant.id)}>{participant.name}</button>)}
              </div>
              <div className="operator-tip-summary">
                <div><span>{guidance.participant.name}</span><strong>Resultado individual</strong><small>{guidance.period.longLabel}</small></div>
                <p><b>{formatMetric(guidance.latest.consumption, "consumption")}</b> consumo <b>{formatMetric(guidance.latest.idle, "idle")}</b> ociosidade <b>{formatMetric(guidance.latest.productive, "productive")}</b> produtividade</p>
              </div>
              <ul>{guidance.tips.map((tip, index) => <li key={tip}><b>{String(index + 1).padStart(2, "0")}</b>{tip}</li>)}</ul>
            </div>
          </article>
          <article className="continuity-panel sales-card" tabIndex={0} onMouseEnter={(event) => releaseFocusFromOtherPanel(event.currentTarget)} onMouseLeave={(event) => releaseFocusOnMouseLeave(event.currentTarget)}>
            <div className="continuity-panel-closed" aria-hidden="true">
              <span>Para a</span><strong>Empresa</strong><small>Passe o mouse ou toque para abrir</small><i>+</i>
            </div>
            <div className="continuity-panel-content">
              <span className="card-kicker">Para a empresa</span>
              <h3>O próximo ganho pode começar agora.</h3>
              <div className="service-tags"><span>Treinamentos personalizados</span><span>Monitoramento CSC</span><span>Nova edição em 2027</span><span>Consultoria operacional</span></div>
              <a href="#parceiros">Planejar o próximo ciclo <span aria-hidden="true">↗</span></a>
            </div>
          </article>
        </div>
      </div>
      {openedEquipmentImage && (
        <div
          className="roadmap-lightbox equipment-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização ampliada dos registros do equipamento ${selectedEquipment}`}
          onMouseDown={(event) => event.currentTarget === event.target && setOpenedEquipmentImage(null)}
        >
          <button type="button" className="lightbox-close" onClick={() => setOpenedEquipmentImage(null)} aria-label="Fechar imagem">×</button>
          {equipmentRecord.images.length > 1 && <button type="button" className="lightbox-arrow lightbox-prev" onClick={() => moveEquipmentLightbox(-1)} aria-label="Imagem anterior">←</button>}
          <figure>
            <div className="lightbox-image-wrap">
              <Image src={openedEquipmentImage.src} alt={openedEquipmentImage.alt} fill priority sizes="96vw" />
            </div>
            <figcaption>{selectedEquipment} · registro {openedEquipmentIndex + 1} de {equipmentRecord.images.length}</figcaption>
          </figure>
          {equipmentRecord.images.length > 1 && <button type="button" className="lightbox-arrow lightbox-next" onClick={() => moveEquipmentLightbox(1)} aria-label="Próxima imagem">→</button>}
        </div>
      )}
    </section>
  );
}

function PartnersSection() {
  const partners = [
    { src: "/project-assets/brand/logo-csc.png", alt: "Centro de Soluções Conectadas", label: "CSC" },
    { src: "/project-assets/brand/logo-veneza.png", alt: "Veneza Equipamentos", label: "Veneza Equipamentos" },
    { src: "/project-assets/brand/logo-john-deere.png", alt: "John Deere", label: "John Deere" },
  ];
  return (
    <section id="parceiros" className="story-section partners-section">
      <div className="partners-glow" aria-hidden="true" />
      <div className="section-shell reveal">
        {/* <p className="eyebrow">09 — Uma construção conjunta</p> */}
        <h2>Com você em cada parte<br />da operação.</h2>
        <div className="logo-row">
          {partners.map((partner) => (
            <div key={partner.label} className="partner-logo">
              <Image src={partner.src} alt={partner.alt} width={240} height={150} sizes="(max-width: 640px) 70vw, 30vw" />
            </div>
          ))}
        </div>
        <footer><span>Projeto Excelência Operacional</span><span>Operador Nota 1.000 · 2026</span></footer>
      </div>
    </section>
  );
}

export function ProjectExperience() {
  const activeSection = useScrollStory();

  return (
    <main className="project-experience">
      <StoryRail active={activeSection} />
      <section id="abertura" className="hero-section story-section">
        <Image className="hero-photo" src="/project-assets/hero/IMG_4736.JPG.jpeg" alt="Equipe do Projeto Operador Nota 1.000 em campo" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-partners">
          <Image
            className="hero-construtora-logo"
            src="/project-assets/brand/logo-fp-construtora.png"
            alt="F.P. Construtora"
            width={180}
            height={100}
            priority
          />
          <Image className="hero-csc-logo" src="/project-assets/brand/logo-csc.png" alt="CSC" width={76} height={76} priority />
        </div>
        <div className="hero-content">
          <Image className="hero-project-logo" src="/project-assets/brand/logo-operador.png" alt="Operador Nota 1.000 — Excelência Operacional" width={420} height={420} priority />
          <p className="hero-eyebrow">Projeto de Excelência Operacional</p>
        </div>
      </section>

      <RoadmapSection />

      <section id="criterios" className="story-section criteria-section">
        <div className="section-shell">
          <SectionHeading
            eyebrow="03 — Critérios avaliados"
            title="Excelência é a soma de cada decisão."
            text="A nota combina eficiência da máquina com disciplina operacional. São seis critérios, uma régua transparente e 100 pontos em jogo."
          />
          <div className="criteria-grid">
            {criteria.map((criterion, index) => (
              <article key={criterion.title} className="criterion-card reveal" style={{ transitionDelay: `${index * 70}ms` }}>
                <span>{criterion.number}</span><div className="criterion-score">{criterion.points}</div>
                <h3>{criterion.title}</h3><p>{criterion.rule}</p>
              </article>
            ))}
          </div>
          <ScoreFormula />
        </div>
      </section>

      <ConsolidatedSection />
      <OperatorSection />
      <PodiumSection />
      <EconomySection />
      <ContinuitySection />
      <PartnersSection />
    </main>
  );
}
