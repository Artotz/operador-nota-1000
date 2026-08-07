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
  it("apresenta o novo hero, a quinzena pendente e os aliases dos operadores", () => {
    render(<ProjectExperience />);
    expect(screen.getByAltText("Operador Nota 1.000 — Excelência Operacional")).toBeInTheDocument();
    expect(screen.getByAltText("Equipe do Projeto Operador Nota 1.000 em campo")).toHaveAttribute("src", "/project-assets/hero/IMG_4736.JPG.jpeg");
    expect(screen.queryByText(/Performance que/i)).not.toBeInTheDocument();
    expect(screen.getByText("Aguardando dados da última quinzena")).toBeInTheDocument();
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
    fireEvent.click(productivityButton);
    expect(productivityButton).toHaveAttribute("aria-pressed", "true");
    expect(within(consolidated as HTMLElement).getByText("Tempo efetivamente trabalhando")).toBeInTheDocument();
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
      name: /EEH-33/i,
    });
    expect(operatorButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(operatorButton);
    expect(operatorButton).toHaveAttribute("aria-pressed", "true");
    expect(operatorButton).toHaveTextContent("Seleção fixada");
  });

  it("revela o pódio com nomes reais, pontos inteiros e tabela apenas ao final", () => {
    render(<ProjectExperience />);
    const podium = document.getElementById("podio") as HTMLElement;
    expect(podium.querySelectorAll(".podium-lock")).toHaveLength(3);
    expect(within(podium).queryByRole("table")).not.toBeInTheDocument();
    expect(within(podium).queryByText("Paulo César Ferreira")).not.toBeInTheDocument();

    fireEvent.click(within(podium).getByRole("button", { name: /Revelar 3º lugar/i }));
    expect(within(podium).getByText("Paulo César Ferreira")).toBeInTheDocument();
    expect(within(podium).getByText(/^\d+ \/ 100$/)).toBeInTheDocument();
    expect(within(podium).queryByText("Quitério da Silva")).not.toBeInTheDocument();

    fireEvent.click(within(podium).getByRole("button", { name: /Revelar 2º lugar/i }));
    expect(within(podium).getByText("Quitério da Silva")).toBeInTheDocument();
    expect(within(podium).queryByText("Luciano Damaceno Ferreira")).not.toBeInTheDocument();

    fireEvent.click(within(podium).getByRole("button", { name: /Revelar 1º lugar/i }));
    expect(within(podium).getAllByText("Luciano Damaceno Ferreira").length).toBeGreaterThan(0);
    expect(within(podium).getByText("Pódio revelado")).toBeInTheDocument();
    expect(within(podium).getByRole("table")).toBeInTheDocument();
    expect(within(podium).getByRole("heading", { name: "Pontuação geral por operador" })).toBeInTheDocument();
  });

  it("apresenta horas como indicador, resultados passáveis e dicas individuais", () => {
    render(<ProjectExperience />);

    expect(screen.queryByRole("button", { name: "Horas" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /O primeiro e o último retrato da operação/i })).toBeInTheDocument();
    expect(screen.getByText("combustível poupado")).toBeInTheDocument();
    expect(screen.getByText("8 dias")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próximo card" }));
    expect(screen.getByRole("button", { name: "Ir para economia em diesel" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Dicas sob medida para cada resultado.")).toBeInTheDocument();
    expect(document.querySelectorAll(".continuity-panel-closed")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Planejar o próximo ciclo/i })).toHaveAttribute("href", "#parceiros");
  });
});
