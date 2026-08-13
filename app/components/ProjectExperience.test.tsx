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
    expect(screen.getByRole("heading", { name: "Seis quinzenas. Uma operação em movimento." })).toBeInTheDocument();
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
    expect(within(consolidated as HTMLElement).getByText("Média do período")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("Ganho médio no período")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("28,7 l/h")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("+1,1 l/h")).toBeInTheDocument();
    fireEvent.click(productivityButton);
    expect(productivityButton).toHaveAttribute("aria-pressed", "true");
    expect(within(consolidated as HTMLElement).getByText("Tempo efetivamente trabalhando")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("Último registro")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("Ganho no período")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("80,6%")).toBeInTheDocument();
    expect(within(consolidated as HTMLElement).getByText("+8,1%")).toBeInTheDocument();
  });

  it("updates the section rail from the scroll position", () => {
    let scrollOffset = 0;
    const sectionOrder = ["abertura", "roadmap", "criterios", "evolucao", "operadores", "podio", "economias", "continuidade", "parceiros"];
    const bounds = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const position = sectionOrder.indexOf(this.id);
      const top = position < 0 ? 10000 : position * 1000 - scrollOffset;
      return { top, bottom: top + 1000, height: 1000, left: 0, right: 800, width: 800, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
    });

    render(<ProjectExperience />);
    expect(screen.getByRole("button", { name: "Ir para Abertura" })).toHaveAttribute("aria-current", "step");

    scrollOffset = 2500;
    fireEvent.scroll(window);
    expect(screen.getByRole("button", { name: "Ir para Critérios" })).toHaveAttribute("aria-current", "step");

    scrollOffset = 3500;
    fireEvent.scroll(window);
    expect(screen.getByRole("button", { name: "Ir para Consolidado" })).toHaveAttribute("aria-current", "step");

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

  it("apresenta os acumulados e as projeções de valor gerado", () => {
    render(<ProjectExperience />);

    expect(screen.queryByRole("button", { name: "Horas" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Valor acumulado desde o início do acompanhamento/i })).toBeInTheDocument();
    expect(screen.getByText("combustível poupado acumulado")).toBeInTheDocument();
    expect(screen.getByText("projeção de economia em diesel")).toBeInTheDocument();
    expect(screen.getAllByText(/^R\$\s.*,[0-9]{2}$/)).toHaveLength(2);
    expect(screen.getByText(/Referência · 14\/05 a 13\/06/i)).toBeInTheDocument();
    expect(screen.getByText(/Acumulado medido · 14\/06 a 13\/08/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próximo card" }));
    expect(screen.getByRole("button", { name: "Ir para economia em diesel acumulada" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Dicas sob medida para cada resultado.")).toBeInTheDocument();
    expect(document.querySelectorAll(".continuity-panel-closed")).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Planejar o próximo ciclo/i })).toHaveAttribute("href", "#parceiros");
  });

  it("separa os cuidados por equipamento e amplia os registros fotográficos", () => {
    render(<ProjectExperience />);
    const continuity = document.getElementById("continuidade") as HTMLElement;

    expect(within(continuity).getByText("Manutenção em dia, produção com garantia.")).toBeInTheDocument();
    expect(within(continuity).getByText("Troca dos dentes da caçamba")).toBeInTheDocument();
    expect(within(continuity).getByText("Limpeza do radiador")).toBeInTheDocument();

    fireEvent.click(within(continuity).getByRole("button", { name: "EEH-34" }));
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
