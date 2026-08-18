"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { roadmapMilestones, type RoadmapImage } from "@/app/data/roadmap";

export function RoadmapSection() {
  const [selectedId, setSelectedId] = useState(roadmapMilestones[0].id);
  const [openedImage, setOpenedImage] = useState<RoadmapImage | null>(null);
  const selectedMilestone = roadmapMilestones.find((milestone) => milestone.id === selectedId) ?? roadmapMilestones[0];
  const hasImages = selectedMilestone.images.length > 0;
  const openedIndex = openedImage
    ? selectedMilestone.images.findIndex((image) => image.src === openedImage.src)
    : -1;

  useEffect(() => {
    if (!openedImage) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedImage(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [openedImage]);

  const moveLightbox = (direction: -1 | 1) => {
    if (openedIndex < 0) return;
    const nextIndex = (openedIndex + direction + selectedMilestone.images.length) % selectedMilestone.images.length;
    setOpenedImage(selectedMilestone.images[nextIndex]);
  };

  return (
    <section id="roadmap" className="story-section roadmap-section" aria-labelledby="roadmap-title">
      <div className="section-shell">
        <header className="section-heading reveal">
          <p className="eyebrow">03 — Acompanhamento em campo</p>
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
                onClick={() => {
                  setSelectedId(milestone.id);
                  setOpenedImage(null);
                }}
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
                  <button
                    type="button"
                    className="roadmap-image-button"
                    onClick={() => setOpenedImage(image)}
                    aria-label={`Abrir ${image.alt}`}
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
                    <span aria-hidden="true">↗</span>
                  </button>
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

      {openedImage && (
        <div
          className="roadmap-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada do registro fotográfico"
          onMouseDown={(event) => event.currentTarget === event.target && setOpenedImage(null)}
        >
          <button type="button" className="lightbox-close" onClick={() => setOpenedImage(null)} aria-label="Fechar imagem">×</button>
          {selectedMilestone.images.length > 1 && (
            <button type="button" className="lightbox-arrow lightbox-prev" onClick={() => moveLightbox(-1)} aria-label="Imagem anterior">←</button>
          )}
          <figure>
            <div className="lightbox-image-wrap">
              <Image src={openedImage.src} alt={openedImage.alt} fill priority sizes="96vw" />
            </div>
            <figcaption>{openedImage.alt} · {openedIndex + 1} de {selectedMilestone.images.length}</figcaption>
          </figure>
          {selectedMilestone.images.length > 1 && (
            <button type="button" className="lightbox-arrow lightbox-next" onClick={() => moveLightbox(1)} aria-label="Próxima imagem">→</button>
          )}
        </div>
      )}
    </section>
  );
}
