export const locale = "pt-BR";

export const messages = {
  metadata: {
    title: "Operador Nota 1000",
    description:
      "Projeto de Excelencia Operacional para acompanhar desempenho de operadores e empresa.",
  },
  header: {
    brand: "Projeto de Excelencia Operacional",
    tabs: [
      { href: "/", label: "Inicio" },
      { href: "/solucoes", label: "Podio" },
      { href: "/desempenho", label: "Desempenho" },
      { href: "/about", label: "About" },
      { href: "/metrics", label: "Metrics" },
    ],
  },
  home: {
    badge: "OPERADOR NOTA 1000",
    title: "Projeto de Excelencia Operacional",
    description:
      'O Projeto de Excelencia Operacional "Operador Nota 1000" busca premiar os operadores com a melhor performance ao longo do projeto, ensinando boas praticas e garantindo qualidade e desempenho ao proprietario.',
  },
  podium: {
    title: "Classificacao geral dos operadores",
    description:
      "Resumo dos destaques da semana com base em produtividade, seguranca e consistencia operacional.",
    stepLabel: "posicao",
    avatarFallback: "Sem foto",
    items: [
      {
        place: 3,
        title: "Ritmo constante",
        description:
          "Alta estabilidade operacional e boa evolucao no cumprimento de metas.",
        height: "12rem",
        delay: 0.05,
        bg: "from-sky-50 via-white to-blue-100",
      },
      {
        place: 1,
        title: "Melhor performance",
        description:
          "Destaque em produtividade e eficiencia ao longo de toda a semana.",
        height: "16rem",
        delay: 0.25,
        bg: "from-[#fde100] via-white to-[#ffed8c]",
      },
      {
        place: 2,
        title: "Otima consistencia",
        description:
          "Resultados solidos com excelente aderencia aos padroes de seguranca.",
        height: "14rem",
        delay: 0.15,
        bg: "from-emerald-50 via-white to-green-100",
      },
    ],
  },
  desempenho: {
    title: "Painel de desempenho",
    description:
      "Acompanhe os indicadores de operador e empresa em um unico lugar.",
    tabs: {
      operador: "Desempenho do operador",
      empresa: "Desempenho da empresa",
    },
    weeks: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    operador: {
      eyebrow: "Operacao",
      title: "Desempenho semanal dos operadores",
      subtitle: "% de metas cumpridas",
      chartAria: "Grafico semanal de desempenho dos operadores",
      tableTitle: "Planilha resumida das quatro semanas",
      tableSubtitle: "Valores em porcentagem de entrega concluida",
      headers: {
        operador: "Operador",
        media: "Media",
      },
      series: [
        { label: "Operador A", color: "#2563eb", values: [78, 84, 81, 89] },
        { label: "Operador B", color: "#f97316", values: [65, 72, 70, 74] },
        { label: "Operador C", color: "#22c55e", values: [82, 79, 85, 90] },
      ],
    },
    empresa: {
      eyebrow: "Telemetria",
      title: "Telemetria consolidada das ultimas semanas",
      subtitle: "Consumo e falhas por semana",
      chartAria: "Grafico semanal de telemetria da empresa",
      logsTitle: "Relatorio de codigos de falha reportados",
      logsSubtitle: "Ultimas ocorrencias registradas pelo operador",
      headers: {
        codigo: "Codigo",
        nome: "Nome",
        data: "Data de ocorrencia",
      },
      metrics: [
        {
          label: "Consumo total de combustivel",
          color: "#f97316",
          values: [12, 11, 10, 9],
        },
        {
          label: "Codigos de falha reportados",
          color: "#0ea5e9",
          values: [0, 2, 4, 7],
        },
        {
          label: "Ociosidade total",
          color: "#10b981",
          values: [27, 24, 21, 18],
        },
      ],
      failureLogs: [
        { code: "F-101", name: "Falha hidraulica leve", date: "03/11/2025" },
        { code: "F-208", name: "Sensor de temperatura", date: "07/11/2025" },
        { code: "F-312", name: "Pressao baixa no freio", date: "12/11/2025" },
        { code: "F-447", name: "Oscilacao eletrica", date: "17/11/2025" },
      ],
    },
  },
  about: {
    title: "About",
    subtitle: "Quem somos e por que este projeto existe",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Nulla vitae elit libero, a pharetra augue.",
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cras mattis consectetur purus sit amet fermentum. Maecenas sed diam eget risus varius blandit sit amet non magna.",
      "Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Etiam porta sem malesuada magna mollis euismod.",
    ],
  },
  metrics: {
    title: "Metrics",
    subtitle: "Indicadores em destaque",
    slides: [
      {
        title: "Produtividade",
        value: "89%",
        trend: "+6.1%",
        description: "Evolucao de produtividade nas ultimas quatro semanas.",
      },
      {
        title: "Consumo de combustivel",
        value: "9,0 L/h",
        trend: "-8.7%",
        description: "Queda continua no consumo medio por hora trabalhada.",
      },
      {
        title: "Incidentes operacionais",
        value: "2",
        trend: "-33%",
        description: "Reducao de ocorrencias com impacto em disponibilidade.",
      },
      {
        title: "Tempo ocioso",
        value: "18%",
        trend: "-9.2%",
        description: "Melhoria na utilizacao dos equipamentos em campo.",
      },
    ],
    controls: {
      prev: "Slide anterior",
      next: "Proximo slide",
    },
  },
} as const;

export type Messages = typeof messages;
