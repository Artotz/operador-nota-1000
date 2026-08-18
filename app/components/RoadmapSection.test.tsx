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
    expect(screen.getByRole("button", { name: "17 DE AGOSTO" })).not.toBeDisabled();
    const kickoffImages = screen.getAllByRole("img");
    expect(kickoffImages).toHaveLength(2);
    expect(kickoffImages[0]).toHaveAttribute("src", "/project-assets/roadmap/kickoff/kickoff-participants.jpg");
    expect(kickoffImages[1]).toHaveAttribute("src", "/project-assets/roadmap/kickoff/kickoff-01.jpg");
  });

  it("troca o marco selecionado e mostra sua colagem", () => {
    render(<RoadmapSection />);

    const visitButton = screen.getByRole("button", { name: "15 A 19 JUN" });
    fireEvent.click(visitButton);

    expect(visitButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Primeira visita de acompanhamento" })).toBeInTheDocument();
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(10);
    expect(images[0]).toHaveAttribute("src", "/project-assets/roadmap/visit-1/visit-1-01.jpg");
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

  it("mostra os registros da terceira visita", () => {
    render(<RoadmapSection />);

    const visitButton = screen.getByRole("button", { name: "17 DE AGOSTO" });
    fireEvent.click(visitButton);

    expect(visitButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Terceira visita de acompanhamento" })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(14);
    expect(screen.getAllByRole("img")[0]).toHaveAttribute("src", "/project-assets/roadmap/visit-3/visit-3-01.jpg");
    expect(screen.getAllByRole("img")[2]).toHaveAttribute("src", "/project-assets/roadmap/visit-3/visit-3-03.png");
    expect(screen.getByText("14 registros fotográficos")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
