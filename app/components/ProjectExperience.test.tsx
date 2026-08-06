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
  it("apresenta a narrativa, a quinzena pendente e somente aliases na análise", () => {
    render(<ProjectExperience />);
    expect(screen.getByRole("heading", { name: /Operador Nota 1.000/i })).toBeInTheDocument();
    expect(screen.getByText("Aguardando dados da última quinzena")).toBeInTheDocument();
    expect(screen.getAllByText("Operador 01").length).toBeGreaterThan(0);
    expect(screen.queryByText("Paulo César Ferreira")).not.toBeInTheDocument();
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

  it("revela o pódio estritamente na sequência terceiro, segundo e primeiro", () => {
    render(<ProjectExperience />);
    expect(screen.getAllByText("Identidade protegida")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: /Revelar 3º lugar/i }));
    expect(screen.getAllByText("Nome a definir")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Revelar 2º lugar/i }));
    expect(screen.getAllByText("Nome a definir")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /Revelar 1º lugar/i }));
    expect(screen.getAllByText("Nome a definir")).toHaveLength(3);
    expect(screen.getByText("Pódio revelado")).toBeInTheDocument();
  });
});
