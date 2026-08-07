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
  it("apresenta o novo hero, a quinzena pendente e somente aliases antes do pódio", () => {
    render(<ProjectExperience />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Performance que deixa\s*marca na operação/i,
    );
    expect(screen.getByAltText("Operador Nota 1.000 — Excelência Operacional")).toBeInTheDocument();
    expect(screen.getByText("Aguardando dados da última quinzena")).toBeInTheDocument();
    ["EEH-33", "EEH-34", "EEH-35", "EEH-36", "EEH-37"].forEach((alias) => {
      expect(screen.getAllByText(alias).length).toBeGreaterThan(0);
    });
    ["Paulo César Ferreira", "Luciano Damaceno Ferreira", "Cristiano José de Moura", "Quitério da Silva"].forEach((name) => {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
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
    expect(screen.getAllByText("Identidade protegida")).toHaveLength(3);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("Paulo César Ferreira")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Revelar 3º lugar/i }));
    expect(screen.getByText("Paulo César Ferreira")).toBeInTheDocument();
    expect(screen.getByText(/^\d+ \/ 100$/)).toBeInTheDocument();
    expect(screen.queryByText("Quitério da Silva")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Revelar 2º lugar/i }));
    expect(screen.getByText("Quitério da Silva")).toBeInTheDocument();
    expect(screen.queryByText("Luciano Damaceno Ferreira")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Revelar 1º lugar/i }));
    expect(screen.getAllByText("Luciano Damaceno Ferreira").length).toBeGreaterThan(0);
    expect(screen.getByText("Pódio revelado")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pontuação geral por operador" })).toBeInTheDocument();
  });

  it("apresenta horas, economias e o CTA de continuidade", () => {
    render(<ProjectExperience />);

    expect(screen.getByText("Horas monitoradas")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Eficiência que pode ser traduzida em economia/i })).toBeInTheDocument();
    expect(screen.getByText("combustível potencialmente evitado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Planejar o próximo ciclo/i })).toHaveAttribute("href", "#parceiros");
  });
});
