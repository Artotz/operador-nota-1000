export type RoadmapImage = {
  src: string;
  alt: string;
};

export type RoadmapMilestone = {
  id: "kickoff" | "visit-1" | "visit-2" | "next";
  date: string;
  title: string;
  description: string;
  images: RoadmapImage[];
};

const kickoffImages: RoadmapImage[] = [
  {
    src: "/project-assets/roadmap/kickoff/kickoff-participants.jpg",
    alt: "Participantes do Projeto Operador Nota 1.000",
  },
  {
    src: "/project-assets/roadmap/kickoff/kickoff-01.jpg",
    alt: "Registro fotográfico do kickoff do Projeto Operador Nota 1.000",
  },
];

const visitOneImages: RoadmapImage[] = Array.from({ length: 10 }, (_, index) => ({
  src: `/project-assets/roadmap/visit-1/visit-1-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `Registro fotográfico da primeira visita de acompanhamento, imagem ${index + 1}`,
}));

const visitTwoImages: RoadmapImage[] = Array.from({ length: 21 }, (_, index) => ({
  src: `/project-assets/roadmap/visit-2/visit-2-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `Registro fotográfico da segunda visita de acompanhamento, imagem ${index + 1}`,
}));

export const roadmapMilestones: RoadmapMilestone[] = [
  {
    id: "kickoff",
    date: "8 DE JUN",
    title: "Kickoff do projeto",
    description: "O início da jornada de excelência operacional com o time em campo.",
    images: kickoffImages,
  },
  {
    id: "visit-1",
    date: "15 A 19 JUN",
    title: "Primeira visita de acompanhamento",
    description: "Registros do acompanhamento inicial, das orientações e da rotina da operação.",
    images: visitOneImages,
  },
  {
    id: "visit-2",
    date: "20 A 24 DE JUL",
    title: "Segunda visita de acompanhamento",
    description: "Evolução observada em campo durante a segunda etapa do projeto.",
    images: visitTwoImages,
  },
  {
    id: "next",
    date: "17 DE AGOSTO",
    title: "Próximo capítulo",
    description: "O encerramento da jornada será registrado após a próxima visita.",
    images: [],
  },
];
