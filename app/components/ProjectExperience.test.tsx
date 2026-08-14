import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ProjectExperience } from "@/app/components/ProjectExperience";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt } = props;
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.priority;
    return React.createElement("img", {
      ...imageProps,
      src:
        typeof src === "object" && src !== null && "src" in src
          ? (src as { src: string }).src
          : src,
      alt,
    });
  },
}));

afterEach(cleanup);

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    value: 800,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    value: 400,
  });
});

describe("ProjectExperience", () => {
  it("apresenta o novo hero, o ciclo completo e os aliases dos operadores", () => {
    render(<ProjectExperience />);
    expect(screen.getByAltText("Operador Nota 1.000 — Excelência Operacional")).toBeInTheDocument();
    expect(screen.getByAltText("Equipe do Projeto Operador Nota 1.000 em campo")).toHaveAttribute("src", "/project-assets/hero/IMG_4736.JPG.jpeg");
    expect(screen.queryByText(/Performance que/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Elevar a maturidade da operação." })).toBeInTheDocument();
    expect(screen.getByText(/integra telemetria, capacitação técnica, gestão de performance/i)).toBeInTheDocument();
    ["Eficiência operacional", "Economia real", "Engajamento"].forEach((pillar) => {
      expect(screen.getByRole("heading", { name: pillar })).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "Uma operação em movimento." })).toBeInTheDocument();
    expect(screen.getByText("01/05 a 31/05")).toBeInTheDocument();
    expect(screen.getByText("01/06 a 30/06")).toBeInTheDocument();
    expect(screen.getByText("01/07 a 31/07")).toBeInTheDocument();
    expect(screen.getAllByText("01/08 a 13/08").length).toBeGreaterThan(0);
    expect(screen.getByText("1ª janela de acompanhamento")).toBeInTheDocument();
    expect(screen.getByText("2ª janela de acompanhamento")).toBeInTheDocument();
    expect(screen.getByText("3ª janela de acompanhamento")).toBeInTheDocument();
    expect(screen.getAllByText("Ago").length).toBeGreaterThan(0);
    expect(screen.queryByText(/parcial/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Dados da última quinzena recebidos")).not.toBeInTheDocument();
    expect(screen.queryByText("Classificação oficial")).not.toBeInTheDocument();
    ["EEH-33", "EEH-34", "EEH-35", "EEH-36", "EEH-37"].forEach((alias) => {
      expect(screen.getAllByText(alias).length).toBeGreaterThan(0);
    });
  });

  it("permite alternar o indicador por botão acessível", () => {
    render(<ProjectExperience />);
    const consolidated = document.getElementById("evolucao");
    expect(consolidated).not.toBeNull();
    const productivityButton = within(consolidated as HTMLElement).getByRole("button", {
      name: "Produtividade",
    });
    const idleButton = within(consolidated as HTMLElement).getByRole("button", {
      name: "Ociosidade",
    });
    expect(within(consolidated as HTMLElement).getByText("Início")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("Último registro")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("Melhoria")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("29,9 l/h")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("23,5 l/h")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("-6,4 l/h")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("-6,4 l/h").closest("div")).toHaveClass("positive");
    fireEvent.click(idleButton);
    const idleImprovement = within(consolidated as HTMLElement).getByText("Melhoria").closest("div");
    expect(idleImprovement).toHaveClass("positive");
    expect(idleImprovement?.querySelector("strong")).toHaveTextContent(/^-/);
    fireEvent.click(productivityButton);
    expect(productivityButton).toHaveAttribute("aria-pressed", "true");
    expect(within(consolidated as HTMLElement).getByText("Tempo efetivamente trabalhando")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("Último registro")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("Melhoria")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("79,5%")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("+9,2%")).toBeInTheDocument();
  });

  it("updates the section rail from the scroll position", () => {
    let scrollOffset = 0;
    const sectionOrder = ["abertura", "objetivo", "roadmap", "criterios", "evolucao", "operadores", "podio", "economias", "continuidade", "parceiros"];
    const bounds = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const position = sectionOrder.indexOf(this.id);
      const top = position < 0 ? 10000 : position * 1000 - scrollOffset;
      return { top, bottom: top + 1000, height: 1000, left: 0, right: 800, width: 800, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
    });

    render(<ProjectExperience />);
    expect(screen.getByRole("button", { name: "Ir para Abertura" })).toHaveAttribute("aria-current", "step");

    scrollOffset = 2500;
    fireEvent.scroll(window);
    expect(screen.getByRole("button", { name: "Ir para Roadmap" })).toHaveAttribute("aria-current", "step");

    scrollOffset = 3500;
    fireEvent.scroll(window);
    expect(screen.getByRole("button", { name: "Ir para Critérios" })).toHaveAttribute("aria-current", "step");

    bounds.mockRestore();
  });

  it("fixa a seleção de um operador por botão acessível", () => {
    render(<ProjectExperience />);
    const operatorSection = document.getElementById("operadores");
    expect(operatorSection).not.toBeNull();

    const operatorButton = within(operatorSection as HTMLElement).getByRole("button", {
      name: /Paulo Cesar Ferreira de Melo/i,
    });
    expect(operatorButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(operatorButton);
    expect(operatorButton).toHaveAttribute("aria-pressed", "true");
    expect(operatorButton).toHaveTextContent("Seleção fixada");
  });

  it("revela o pódio com quatro competidores e consolida as duas máquinas de Paulo", () => {
    render(<ProjectExperience />);
    const podium = document.getElementById("podio") as HTMLElement;
    expect(podium.querySelectorAll(".podium-lock")).toHaveLength(3);
    expect(within(podium).queryByRole("table")).not.toBeInTheDocument();
    expect(within(podium).queryByText("Paulo Cesar Ferreira de Melo")).not.toBeInTheDocument();

    fireEvent.click(within(podium).getByRole("button", { name: /Revelar 3º lugar/i }));
    fireEvent.click(within(podium).getByRole("button", { name: /Revelar 2º lugar/i }));
    fireEvent.click(within(podium).getByRole("button", { name: /Revelar 1º lugar/i }));
    expect(within(podium).getByText("Pódio revelado")).toBeInTheDocument();
    const table = within(podium).getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(within(table).getByText("Paulo Cesar Ferreira de Melo")).toBeInTheDocument();
    expect(within(table).getByText("EEH0033 + EEH0036")).toBeInTheDocument();
    expect(within(table).getByText("Luciano Damasceno Ferreira")).toBeInTheDocument();
    expect(within(table).getByText("Quitério de Santana do Ipanema")).toBeInTheDocument();
    expect(within(table).getByText("0 / 25")).toBeInTheDocument();
    const podiumCards = Array.from(podium.querySelectorAll(".podium-card"));
    podiumCards.forEach((card) => {
      expect(card.querySelector(".podium-secret h3")).toHaveTextContent(/\S/);
      expect(card.querySelector(".podium-secret p")).toHaveTextContent(/^EEH/);
    });
    expect(podium.querySelectorAll(".podium-secret h3")).toHaveLength(3);
    expect(table.querySelectorAll("tbody td:last-child strong")).toHaveLength(4);
    table.querySelectorAll("tbody td:last-child strong").forEach((total) => {
      expect(total).toHaveTextContent(/^\d+ \/ 100$/);
    });
    expect(within(podium).getByRole("heading", { name: "Pontuação geral por operador" })).toBeInTheDocument();
  });

  it("exibe somente as marcas, sem repetir seus nomes abaixo das logos", () => {
    render(<ProjectExperience />);
    const partners = document.getElementById("parceiros") as HTMLElement;

    expect(partners.querySelectorAll(".partner-logo img")).toHaveLength(3);
    expect(partners.querySelector(".partner-logo small")).not.toBeInTheDocument();
  });

  it("apresenta os resultados da janela final e suas projeções", () => {
    render(<ProjectExperience />);

    expect(screen.queryByRole("button", { name: "Horas" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Valor gerado na janela final/i })).toBeInTheDocument();
    expect(screen.getByText("combustível poupado na 3ª janela")).toBeInTheDocument();
    expect(screen.getByText("projeção de economia em diesel")).toBeInTheDocument();
    expect(screen.getByText(/usando diesel a R\$\s*6,15\/L/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^R\$\s.*,[0-9]{2}$/, { selector: ".economy-grid > li > strong" })).toHaveLength(2);
    expect(screen.getByText(/Referência · 01\/05 a 31\/05/i)).toBeInTheDocument();
    expect(screen.getByText(/Janela final · 01\/08 a 13\/08/i)).toBeInTheDocument();
    expect(screen.queryByText("Como calculamos:")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resultados da 3ª janela" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Projeções até 31/12" })).toBeInTheDocument();
    expect(screen.queryByText("acompanhamento da operação")).not.toBeInTheDocument();
    expect(screen.getAllByRole("tooltip")).toHaveLength(6);
    expect(screen.getByRole("button", { name: "Ver cálculo de combustível poupado na 3ª janela" })).toHaveAttribute("aria-describedby", "economy-results-calculation-0");
    expect(screen.getByText(/Consumo médio de maio: 29,8948 L\/h/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próximo card de resultados da 3ª janela" }));
    expect(screen.getByRole("button", { name: "Ir para economia em diesel na 3ª janela" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Ir para projeção de combustível poupado" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Feedback individual de operação.")).toBeInTheDocument();
    expect(document.querySelectorAll(".continuity-panel-closed")).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Planejar o próximo ciclo/i })).toHaveAttribute("href", "#parceiros");
  });

  it("exibe a avaliação da operação dos equipamentos para cada operador", () => {
    render(<ProjectExperience />);
    const continuity = document.getElementById("continuidade") as HTMLElement;
    const equipmentAssessment = continuity.querySelector(".operator-equipment-assessment") as HTMLElement;

    expect(within(continuity).getByText("Avaliação da operação dos equipamentos")).toBeInTheDocument();
    expect(within(equipmentAssessment).getByText(/manejo de material rochoso/i)).toBeInTheDocument();

    fireEvent.click(within(continuity).getByRole("button", { name: "Cristiano José de Moura" }));
    expect(within(continuity).getByText(/Excelente percepção operacional e segurança/i)).toBeInTheDocument();

    fireEvent.click(within(continuity).getByRole("button", { name: "Luciano Damasceno Ferreira" }));
    expect(within(continuity).getByText(/domínio dos recursos do equipamento/i)).toBeInTheDocument();

    fireEvent.click(within(continuity).getByRole("button", { name: "Quitério de Santana do Ipanema" }));
    expect(within(continuity).getByText(/posicionamento e estabilização do equipamento/i)).toBeInTheDocument();
  });

  it("separa os cuidados por equipamento e amplia os registros fotográficos", () => {
    render(<ProjectExperience />);
    const continuity = document.getElementById("continuidade") as HTMLElement;

    expect(within(continuity).getByText("Cuidados que sustentam o desempenho.")).toBeInTheDocument();
    expect(within(continuity).getByRole("button", { name: "Geral" })).toHaveAttribute("aria-pressed", "true");
    expect(within(continuity).getByText("Sistema de arrefecimento")).toBeInTheDocument();
    expect(within(continuity).getByText("Conjunto de trabalho")).toBeInTheDocument();
    expect(within(continuity).getByText("Eficiência operacional")).toBeInTheDocument();
    expect(within(continuity).getByText("Operação")).toBeInTheDocument();
    expect(within(continuity).getByText("Recomendação geral")).toBeInTheDocument();

    fireEvent.click(within(continuity).getByRole("button", { name: "EEH-34" }));
    expect(within(continuity).queryByText("Sistema de arrefecimento")).not.toBeInTheDocument();
    expect(within(continuity).getByText("Troca dos dentes da caçamba")).toBeInTheDocument();
    expect(within(continuity).getByText("Limpeza do radiador")).toBeInTheDocument();
    expect(within(continuity).getByText("4 registros · clique para ampliar")).toBeInTheDocument();
    fireEvent.click(within(continuity).getByRole("button", { name: "Ampliar registro 1 do EEH-34" }));

    const dialog = within(continuity).getByRole("dialog", { name: /equipamento EEH-34/i });
    expect(within(dialog).getByAltText("EEH-34 — registro de inspeção 1")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Próxima imagem" }));
    expect(within(dialog).getByText("EEH-34 · registro 2 de 4")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar imagem" }));
    expect(within(continuity).queryByRole("dialog")).not.toBeInTheDocument();
  });
});
