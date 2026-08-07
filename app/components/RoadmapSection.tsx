"use client";

import Image from "next/image";
import { useState } from "react";
import { roadmapMilestones } from "@/app/data/roadmap";

export function RoadmapSection() {
  const [selectedId, setSelectedId] = useState(roadmapMilestones[0].id);
  const selectedMilestone = roadmapMilestones.find((milestone) => milestone.id === selectedId) ?? roadmapMilestones[0];
  const hasImages = selectedMilestone.images.length > 0;

  return (
    <section id="roadmap" className="story-section roadmap-section" aria-labelledby="roadmap-title">
      <div className="section-shell">
      <header className="section-heading reveal">
        <p className="eyebrow">02 — Acompanhamento em campo</p>
        <h2 id="roadmap-title">A jornada aconteceu em cada visita.</h2>
        <p className="section-intro">
          Selecione uma data para conhecer os registros fotográficos do Projeto Operador Nota 1.000.
        </p>
      </header>

      <div className="roadmap-tabs reveal" role="group" aria-label="Marcos do roadmap">
        {roadmapMilestones.map((milestone) => {
          const isSelected = milestone.id === selectedMilestone.id;
          return (
            <button
              key={milestone.id}
              type="button"
              aria-pressed={isSelected}
              className={isSelected ? "is-active" : ""}
              onClick={() => setSelectedId(milestone.id)}
            >
              <span aria-hidden="true">{String(roadmapMilestones.indexOf(milestone) + 1).padStart(2, "0")}</span>
              {milestone.date}
            </button>
          );
        })}
      </div>

      <article className="roadmap-stage reveal" aria-live="polite">
        <div className="roadmap-stage-head">
          <div>
        <p className="roadmap-date">{selectedMilestone.date}</p>
        <h3>{selectedMilestone.title}</h3>
        <p className="roadmap-description">{selectedMilestone.description}</p>
          </div>
        <p className="roadmap-count">
          {selectedMilestone.images.length} {selectedMilestone.images.length === 1 ? "registro" : "registros"} fotográficos
        </p>
        </div>

        {hasImages ? (
          <div className="roadmap-collage" aria-label={`Colagem de ${selectedMilestone.images.length} registros fotográficos`}>
            {selectedMilestone.images.map((image, index) => (
              <figure
                key={image.src}
                className={`roadmap-collage-item roadmap-collage-item--${index + 1} roadmap-collage-item--hover-ready`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={600}
                  loading="lazy"
                  sizes="(max-width: 768px) 88vw, (max-width: 1200px) 42vw, 360px"
                  className="roadmap-collage-image roadmap-collage-image--hover-ready"
                />
              </figure>
            ))}
          </div>
        ) : (
          <div className="roadmap-placeholder" role="status">
            <span aria-hidden="true">?</span>
            <p>Próximo capítulo — registros serão adicionados após a visita</p>
          </div>
        )}
      </article>
      </div>
    </section>
  );
}
