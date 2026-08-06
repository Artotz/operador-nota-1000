"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import machineReadings from "@/app/data/machine-readings.json";
import { operatorAssignments, reportingPeriods } from "@/app/data/project-data";
import { aggregateReadings, buildRanking, round } from "@/app/lib/analytics";
import type {
  MachineReading,
  MetricKey,
  PhaseKey,
  ReportingPeriod,
} from "@/app/lib/types";
import operatorHero from "@/app/assets/Operador-de-Retroescavadeira-scaled.jpg";

const readings = machineReadings as MachineReading[];

const sections = [
  ["abertura", "Abertura"],
  ["criterios", "Critérios"],
  ["evolucao", "Consolidado"],
  ["operadores", "Operadores"],
  ["podio", "Pódio"],
  ["parceiros", "Parceiros"],
] as const;

const metricConfig = {
  consumption: {
    label: "Consumo",
    shortLabel: "l/h",
    description: "Litros consumidos por hora de motor",
    color: "#f4c400",
    target: 26,
    lowerIsBetter: true,
  },
  idle: {
    label: "Ociosidade",
    shortLabel: "%",
    description: "Tempo de motor ligado sem produção",
    color: "#f97316",
    target: 20,
    lowerIsBetter: true,
  },
  productive: {
    label: "Produtividade",
    shortLabel: "%",
    description: "Tempo efetivamente trabalhando",
    color: "#84cc16",
    target: 80,
    lowerIsBetter: false,
  },
} satisfies Record<MetricKey, object>;

const criteria = [
  { number: "01", title: "Consumo", points: "25 pts", rule: "Até 26 l/h para a pontuação máxima." },
  { number: "02", title: "Ociosidade", points: "25 pts", rule: "Até 20% para alcançar o desafio." },
  { number: "03", title: "Horas produtivas", points: "25 pts", rule: "80% ou mais em trabalho efetivo." },
  { number: "04", title: "Segurança", points: "10 pts", rule: "EPIs e normas operacionais em primeiro lugar." },
  { number: "05", title: "Cuidado com o ativo", points: "10 pts", rule: "Inspeção, limpeza e uso correto do equipamento." },
  { number: "06", title: "Assiduidade", points: "5 pts", rule: "Presença e pontualidade durante o projeto." },
];

const operatorColors = ["#f4c400", "#38bdf8", "#fb7185", "#a3e635", "#c084fc"];

function useScrollStory() {
  const [activeSection, setActiveSection] = useState("abertura");

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.16 },
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -50%", threshold: [0, 0.25, 0.6] },
    );

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    sections.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) sectionObserver.observe(element);
    });

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return activeSection;
}

function metricValue(readingGroup: MachineReading[], metric: MetricKey) {
  if (!readingGroup.length) return null;
  const metrics = aggregateReadings(readingGroup);
  return round(metrics[metric], 2);
}

function buildPeriodSeries(metric: MetricKey, serial?: string) {
  return reportingPeriods.map((period) => {
    const matches = readings.filter(
      (reading) =>
        reading.periodStart === period.start && (!serial || reading.serial === serial),
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
    metric === "consumption" ? " l/h" : "%"
  }`;
}

function MetricToggle({ metric, onChange }: { metric: MetricKey; onChange: (metric: MetricKey) => void }) {
  return (
    <div className="metric-toggle" role="group" aria-label="Escolha o indicador">
      {(Object.keys(metricConfig) as MetricKey[]).map((key) => (
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

function ChartTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
  metric: MetricKey;
}) {
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

function PeriodStrip({ periods }: { periods: ReportingPeriod[] }) {
  return (
    <div className="period-strip reveal" aria-label="Janelas do projeto">
      {(["baseline", "window1", "window2"] as PhaseKey[]).map((phase, index) => {
        const group = periods.filter((period) => period.phase === phase);
        const complete = group.every((period) =>
          readings.some((reading) => reading.periodStart === period.start),
        );
        return (
          <article key={phase} className={complete ? "" : "is-partial"}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <b>{group[0].phaseLabel}</b>
              <p>{group.map((period) => period.longLabel).join(" • ")}</p>
            </div>
            <em>{complete ? "Concluída" : "Parcial"}</em>
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
  const available = series.filter((item) => item.value !== null);
  const first = available[0]?.value ?? 0;
  const latest = available.at(-1)?.value ?? 0;
  const improvement = config.lowerIsBetter ? first - latest : latest - first;

  return (
    <section id="evolucao" className="story-section data-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="03 — Evolução consolidada"
          title="Cinco quinzenas. Uma operação em movimento."
          text="Os dados de toda a frota foram ponderados pelas horas efetivamente operadas para comparar períodos de intensidades diferentes."
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
            <div><span>Início</span><strong>{formatMetric(first, metric)}</strong></div>
            <div><span>Último registro</span><strong>{formatMetric(latest, metric)}</strong></div>
            <div className={improvement >= 0 ? "positive" : "negative"}>
              <span>Movimento</span><strong>{improvement >= 0 ? "+" : ""}{formatMetric(improvement, metric)}</strong>
            </div>
          </div>
          <div className="main-chart" aria-label={`Gráfico consolidado de ${config.label}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 28, right: 18, left: -18, bottom: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="period" stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip metric={metric} />} />
                <ReferenceLine y={config.target} stroke="#f4c400" strokeDasharray="5 7" label={{ value: "Meta", fill: "#f4c400", fontSize: 11 }} />
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
          <div className="pending-period">
            <span className="pulse-dot" />
            <div><b>30 jul–13 ago</b><p>Aguardando dados da última quinzena</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OperatorSection() {
  const [metric, setMetric] = useState<MetricKey>("idle");
  const chartData = reportingPeriods.map((period) => {
    const row: Record<string, string | number | null> = { period: period.label };
    operatorAssignments.forEach((assignment) => {
      const matches = readings.filter(
        (reading) => reading.periodStart === period.start && reading.serial === assignment.serial,
      );
      row[assignment.alias] = metricValue(matches, metric);
    });
    return row;
  });

  return (
    <section id="operadores" className="story-section operators-section">
      <div className="section-shell">
        <SectionHeading
          eyebrow="04 — Visão individual"
          title="O desempenho aparece. Os nomes, ainda não."
          text="Cada linha representa uma entrada concorrente vinculada a um chassi. As identidades ficam protegidas até o momento do pódio."
        />
        <div className="operator-dashboard reveal">
          <div className="operator-toolbar">
            <div><span>Comparativo por participante</span><strong>{metricConfig[metric].label}</strong></div>
            <MetricToggle metric={metric} onChange={setMetric} />
          </div>
          <div className="operator-chart" aria-label={`Gráfico anônimo de ${metricConfig[metric].label}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 12, left: -22, bottom: 4 }}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="period" stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#7e8580" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip metric={metric} />} />
                {operatorAssignments.map((assignment, index) => (
                  <Line
                    key={assignment.alias}
                    type="monotone"
                    dataKey={assignment.alias}
                    name={assignment.alias}
                    stroke={operatorColors[index]}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#111511", strokeWidth: 2 }}
                    connectNulls={false}
                    animationDuration={800 + index * 120}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="operator-legend">
            {operatorAssignments.map((assignment, index) => {
              const values = buildPeriodSeries(metric, assignment.serial).filter((item) => item.value !== null);
              const latest = values.at(-1)?.value ?? null;
              return (
                <div key={assignment.alias}>
                  <i style={{ backgroundColor: operatorColors[index] }} />
                  <span>{assignment.alias}</span>
                  <strong>{formatMetric(latest, metric)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PodiumSection() {
  const [revealed, setRevealed] = useState(0);
  const ranking = useMemo(
    () => buildRanking(readings, reportingPeriods, operatorAssignments),
    [],
  );
  const winners = [ranking.entries[2], ranking.entries[1], ranking.entries[0]];
  const revealLabels = ["Revelar 3º lugar", "Revelar 2º lugar", "Revelar 1º lugar"];

  return (
    <section id="podio" className="story-section podium-section">
      <div className="podium-light" aria-hidden="true" />
      <div className="section-shell">
        <SectionHeading
          eyebrow="05 — Reconhecimento"
          title="Chegou a hora de revelar o pódio."
          text="A classificação considera a média das quinzenas acompanhadas. O suspense termina uma posição por vez."
        />
        <div className="ranking-status reveal">
          <span className={ranking.isOfficial ? "official" : "provisional"}>
            {ranking.isOfficial ? "Classificação oficial" : "Classificação provisória"}
          </span>
          <p>
            {ranking.isOfficial
              ? "Todos os dados operacionais e humanos foram preenchidos."
              : "Pontuação atual baseada nos 75 pontos de telemetria e nas quinzenas disponíveis."}
          </p>
        </div>
        <div className="podium-grid reveal" aria-live="polite">
          {winners.map((entry, index) => {
            const isRevealed = index < revealed;
            const place = 3 - index;
            return (
              <article key={entry.serial} className={`podium-card place-${place} ${isRevealed ? "is-revealed" : ""}`}>
                <span className="place-number">{place}º</span>
                <div className="podium-lock" aria-hidden="true"><span>{isRevealed ? "✓" : "?"}</span></div>
                <div className="podium-secret">
                  <p>{isRevealed ? entry.revealName : "Identidade protegida"}</p>
                  <h3>{isRevealed ? entry.machine : "••••••••"}</h3>
                  <strong>{isRevealed ? `${round(entry.score, 1).toLocaleString("pt-BR")} / ${entry.maximum}` : "—"}</strong>
                </div>
                {isRevealed && (
                  <div className="score-parts">
                    <span>Consumo <b>{round(entry.breakdown.consumption, 1)}</b></span>
                    <span>Ociosidade <b>{round(entry.breakdown.idle, 1)}</b></span>
                    <span>Produtividade <b>{round(entry.breakdown.productive, 1)}</b></span>
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
        <Image src={operatorHero} alt="Operador trabalhando em equipamento de construção" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-mark"><span>Projeto</span><i /></div>
          <p className="hero-eyebrow">Excelência Operacional</p>
          <h1 aria-label="Operador Nota 1.000">Operador<br /><strong>Nota 1.000</strong></h1>
          <div className="hero-footer">
            <p>F. P. Construtora Ltda.</p>
            <a href="#criterios">Conheça a jornada <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section id="criterios" className="story-section criteria-section">
        <div className="section-shell">
          <SectionHeading
            eyebrow="02 — Critérios avaliados"
            title="Excelência é a soma de cada decisão."
            text="A nota combina eficiência da máquina com disciplina operacional. São seis critérios, uma régua clara e até 100 pontos em jogo."
          />
          <div className="criteria-grid">
            {criteria.map((criterion, index) => (
              <article key={criterion.title} className="criterion-card reveal" style={{ transitionDelay: `${index * 70}ms` }}>
                <span>{criterion.number}</span>
                <div className="criterion-score">{criterion.points}</div>
                <h3>{criterion.title}</h3>
                <p>{criterion.rule}</p>
              </article>
            ))}
          </div>
          <div className="score-formula reveal">
            <div><strong>75</strong><span>pontos de telemetria</span></div>
            <i>+</i>
            <div><strong>25</strong><span>pontos humanos</span></div>
            <i>=</i>
            <div className="total"><strong>100</strong><span>pontos possíveis</span></div>
          </div>
        </div>
      </section>

      <ConsolidatedSection />
      <OperatorSection />
      <PodiumSection />

      <section id="parceiros" className="story-section partners-section">
        <div className="partners-glow" aria-hidden="true" />
        <div className="section-shell reveal">
          <p className="eyebrow">06 — Uma construção conjunta</p>
          <h2>Com você em cada parte<br />da operação!</h2>
          <div className="logo-row">
            {[
              ["CSC", "Logo CSC"],
              ["VENEZA", "Logo Veneza Equipamentos"],
              ["JOHN DEERE", "Logo John Deere"],
            ].map(([mark, label]) => (
              <div key={mark} className="logo-placeholder" role="img" aria-label={label}>
                <span>{mark}</span><small>{label}</small>
              </div>
            ))}
          </div>
          <footer>
            <span>Projeto Excelência Operacional</span>
            <span>Operador Nota 1.000 · 2026</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
