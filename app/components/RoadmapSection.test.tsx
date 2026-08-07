import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoadmapSection } from "@/app/components/RoadmapSection";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => React.createElement("img", props),
}));

afterEach(cleanup);

describe("RoadmapSection", () => {
  it("apresenta os quatro marcos do roadmap", () => {
    render(<RoadmapSection />);

    ["8 DE JUN", "15 A 19 JUN", "20 A 24 DE JUL", "17 DE AGOSTO"].forEach((date) => {
      expect(screen.getByRole("button", { name: date })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "8 DE JUN" })).toHaveAttribute("aria-pressed", "true");
  });

  it("troca o marco selecionado e mostra sua colagem", () => {
    render(<RoadmapSection />);

    const visitButton = screen.getByRole("button", { name: "15 A 19 JUN" });
    fireEvent.click(visitButton);

    expect(visitButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Primeira visita de acompanhamento" })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(10);
    expect(screen.getByText("10 registros fotográficos")).toBeInTheDocument();
  });

  it("abre e fecha um registro em visualização ampliada", () => {
    render(<RoadmapSection />);
    fireEvent.click(screen.getByRole("button", { name: "15 A 19 JUN" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Abrir/i })[0]);

    expect(screen.getByRole("dialog", { name: /Visualização ampliada/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar imagem" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra o placeholder para o marco ainda sem registros", () => {
    render(<RoadmapSection />);

    fireEvent.click(screen.getByRole("button", { name: "17 DE AGOSTO" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Próximo capítulo — registros serão adicionados após a visita",
    );
    expect(screen.getByText("0 registros fotográficos")).toBeInTheDocument();
  });
});
