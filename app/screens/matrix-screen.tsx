"use client";

import { Box, ChevronDown, CircleDotDashed, Grid3X3, Layers3, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { AuraCellSelection } from "../components/aura-geometry";
import { AuraGeometry } from "../components/aura-geometry";
import { MatrixGrid } from "../components/matrix-grid";
import { SegmentedControl } from "../components/segmented-control";
import { AURA_SHELLS, type AuraFace } from "../data/aura";

type MatrixScreenProps = {
  activeShell: number;
  face: AuraFace;
  selected: AuraCellSelection | null;
  onShellChange: (shell: number) => void;
  onFaceChange: (face: AuraFace) => void;
  onCellSelect: (selection: AuraCellSelection) => void;
  onProgram: () => void;
};

export function MatrixScreen({ activeShell, face, selected, onShellChange, onFaceChange, onCellSelect, onProgram }: MatrixScreenProps) {
  const [shape, setShape] = useState<"torus" | "flat">("torus");
  const [map, setMap] = useState<"finite" | "infinite">("finite");
  const [resolution, setResolution] = useState<"uniform" | "expanding">("uniform");
  const shell = AURA_SHELLS[activeShell];

  return (
    <div className="screen-stack matrix-screen">
      <section className="screen-intro">
        <p className="eyebrow"><Grid3X3 size={13} aria-hidden="true" /> Matrix Programmer</p>
        <h1>Program your Aura Matrix</h1>
        <p>The flat matrix and the horn torus are two views of the same addressable space. Facet identity stays intact as you move between them.</p>
      </section>

      <section className="matrix-workspace surface-card">
        <div className="matrix-toolbar">
          <SegmentedControl
            label="Matrix shape"
            value={shape}
            options={[{ value: "torus", label: "Torus" }, { value: "flat", label: "Flat 12 × 24" }]}
            onChange={setShape}
            compact
          />
        </div>

        {shape === "torus" ? (
          <div className="matrix-geometry-wrap">
            <AuraGeometry activeShell={activeShell} face={face} selected={selected} onSelect={onCellSelect} compact />
          </div>
        ) : (
          <MatrixGrid activeShell={activeShell} face={face} selected={selected} onSelect={onCellSelect} />
        )}

        {map === "infinite" ? (
          <div className="matrix-mode-banner" role="status">
            <strong>Infinite Map selected</strong>
            <span>The current 12 × 24 matrix remains an address window. A data set containing more than 288 objects and Matrix Program Passthrough are not connected in this prototype.</span>
          </div>
        ) : null}

        <div className="matrix-address-row" aria-live="polite">
          <span className="address-dot" style={{ background: shell.colour, boxShadow: `0 0 18px ${shell.glow}` }} />
          <div>
            <small>Selected address</small>
            <strong>{selected ? `${AURA_SHELLS[selected.shell].name} · ${selected.face}${String(selected.cell).padStart(3, "0")}` : "Tap any facet"}</strong>
          </div>
          <button type="button" onClick={onProgram} disabled={!selected}>Program <ChevronDown size={15} aria-hidden="true" /></button>
        </div>
      </section>

      <section className="surface-card matrix-settings">
        <div className="setting-heading"><Layers3 size={18} aria-hidden="true" /><div><strong>Shell</strong><span>Seven ROYGBIV torus layers</span></div></div>
        <div className="shell-selector-large">
          {AURA_SHELLS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === activeShell ? "is-active" : ""}
              style={{ "--chip": item.colour } as React.CSSProperties}
              onClick={() => onShellChange(index)}
              aria-pressed={index === activeShell}
            >
              <i aria-hidden="true" />
              <span>{item.name}<small>{resolution === "uniform" ? item.uniformGrid : item.expandingGrid}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="surface-card matrix-settings">
        <div className="setting-heading"><CircleDotDashed size={18} aria-hidden="true" /><div><strong>Faces</strong><span>One cell, two distinct views</span></div></div>
        <SegmentedControl
          label="Matrix face"
          value={face}
          options={[{ value: "I", label: "I · Interior" }, { value: "O", label: "O · Exterior" }]}
          onChange={onFaceChange}
        />
        <p className="prototype-note">The source distinguishes Interior and Exterior views. Personal/private and observer/permissioned intent are presented as interface guidance only; encryption, access control and publishing are not implemented.</p>
      </section>

      <section className="surface-card matrix-settings">
        <div className="setting-heading"><SlidersHorizontal size={18} aria-hidden="true" /><div><strong>Matrix options</strong><span>Keep both source configurations available</span></div></div>
        <div className="mode-explainer tool-inventory-explainer">
          <strong>Tool Inventory</strong>
          <span>Shift Your Lists and Data into 3 Dimensional Space</span>
        </div>
        <div className="setting-row">
          <span><Box size={17} aria-hidden="true" /> Map</span>
          <SegmentedControl label="Finite or infinite map" value={map} options={[{ value: "finite", label: "Finite · 0–288" }, { value: "infinite", label: "Infinite · 289+" }]} onChange={setMap} compact />
        </div>
        <div className="setting-row">
          <span><Grid3X3 size={17} aria-hidden="true" /> Resolution</span>
          <SegmentedControl label="Matrix resolution option" value={resolution} options={[{ value: "uniform", label: "All 12 × 24" }, { value: "expanding", label: "Expanding" }]} onChange={setResolution} compact />
        </div>
        <div className="mode-explainer">
          <strong>{map === "finite" ? "Finite Map" : "Infinite Map"}</strong>
          <span>{map === "finite" ? "Is for programming data sets that contain between 0 and 288 objects" : "Is for programming data sets that contain more than 288 objects"}</span>
        </div>
      </section>
    </div>
  );
}
