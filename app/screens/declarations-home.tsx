"use client";

import { ArrowRight, Boxes, ChevronRight, Clock3, Eye, FilePlus2, LockKeyhole, Orbit, Sparkles } from "lucide-react";
import type { AuraCellSelection } from "../components/aura-geometry";
import { AuraGeometry } from "../components/aura-geometry";
import { SegmentedControl } from "../components/segmented-control";
import { AURA_SHELLS, type AuraFace } from "../data/aura";
import { declarationTitle, type ParticipantDeclaration } from "../data/declarations";
import { AURA_PAGE_TREE, type SourceNode } from "../data/page-tree";

type DeclarationsHomeProps = {
  declarations: ParticipantDeclaration[];
  activeShell: number;
  face: AuraFace;
  selected: AuraCellSelection | null;
  onShellChange: (shell: number) => void;
  onFaceChange: (face: AuraFace) => void;
  onCellSelect: (selection: AuraCellSelection) => void;
  onAddDeclaration: () => void;
  onOpenPages: (node?: SourceNode) => void;
  onOpenRecords: () => void;
  onOpenMatrix: () => void;
  onEditDeclaration: (record: ParticipantDeclaration) => void;
};

function formattedDate(value: string) {
  if (!value) return "Date not set";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function DeclarationsHome({ declarations, activeShell, face, selected, onShellChange, onFaceChange, onCellSelect, onAddDeclaration, onOpenPages, onOpenRecords, onOpenMatrix, onEditDeclaration }: DeclarationsHomeProps) {
  const shell = AURA_SHELLS[activeShell];
  const recent = declarations.slice(0, 3);

  return (
    <div className="screen-stack declaration-home">
      <section className="declaration-hero surface-card">
        <div className="declaration-hero-copy">
          <p className="eyebrow"><Sparkles size={14} aria-hidden="true" /> Participant Declarations</p>
          <h1>Declare yourself, across time.</h1>
          <p>Collect structured data about yourself. Keep it in the Interior (Personal) view or prepare an Exterior (Observer) declaration for the people you choose.</p>
          <div className="declaration-hero-actions">
            <button className="primary-action" type="button" onClick={onAddDeclaration}><FilePlus2 size={19} aria-hidden="true" /> Make a declaration <ArrowRight size={17} aria-hidden="true" /></button>
            <button className="secondary-action" type="button" onClick={() => onOpenPages()}><Boxes size={18} aria-hidden="true" /> Open exact page tree</button>
          </div>
        </div>

        <div className="declaration-summary" aria-label="Participant declaration summary">
          <span><strong>{declarations.length}</strong><small>Declarations</small></span>
          <span><strong>{declarations.filter((item) => item.face === "I").length}</strong><small>Interior</small></span>
          <span><strong>{declarations.filter((item) => item.face === "O").length}</strong><small>Exterior</small></span>
        </div>
      </section>

      <section className="aura-data-map surface-card" style={{ "--shell-colour": shell.colour, "--shell-glow": shell.glow } as React.CSSProperties}>
        <div className="section-title-row">
          <div><p className="eyebrow"><Orbit size={14} aria-hidden="true" /> Aura Matrix</p><h2>Your declarations have a place.</h2></div>
          <button className="text-action" type="button" onClick={onOpenMatrix}>Matrix Programmer <ChevronRight size={16} aria-hidden="true" /></button>
        </div>
        <div className="aura-data-map-canvas">
          <AuraGeometry activeShell={activeShell} face={face} selected={selected} onSelect={onCellSelect} compact />
        </div>
        <SegmentedControl
          label="Aura point of view"
          value={face}
          options={[{ value: "I", label: "I · Interior (Personal)" }, { value: "O", label: "O · Exterior (Observer)" }]}
          onChange={onFaceChange}
        />
        <div className="shell-strip" aria-label="Choose an Aura shell">
          {AURA_SHELLS.map((item, index) => (
            <button key={item.id} type="button" className={index === activeShell ? "is-active" : ""} style={{ "--chip": item.colour } as React.CSSProperties} onClick={() => onShellChange(index)} aria-pressed={index === activeShell}>
              <i aria-hidden="true" /><span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-title-row">
          <div><p className="eyebrow"><Clock3 size={14} aria-hidden="true" /> Across time</p><h2>Your records</h2></div>
          {declarations.length ? <button className="text-action" type="button" onClick={onOpenRecords}>View all <ChevronRight size={16} aria-hidden="true" /></button> : null}
        </div>
        {recent.length ? (
          <div className="declaration-record-list">
            {recent.map((record) => (
              <button key={record.id} type="button" onClick={() => onEditDeclaration(record)}>
                <span className={`record-view-mark ${record.face === "O" ? "is-exterior" : ""}`}>{record.face === "I" ? <LockKeyhole size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</span>
                <span><small>{record.kind} · {formattedDate(record.date)}</small><strong>{declarationTitle(record)}</strong><em>{record.sourcePath.join(" / ")}</em></span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <button className="declaration-empty-state" type="button" onClick={onAddDeclaration}>
            <FilePlus2 size={24} aria-hidden="true" />
            <strong>Your Aura begins with what you choose to declare.</strong>
            <span>Add a narrative, motivation, peak, pain, emotion, first, joy, challenge, gift, choice, hope, belief, value or another source-defined record.</span>
          </button>
        )}
      </section>

      <section className="content-section">
        <div className="section-title-row"><div><p className="eyebrow">Home</p><h2>Source architecture</h2></div><button className="text-action" type="button" onClick={() => onOpenPages()}>Site Map <ChevronRight size={16} aria-hidden="true" /></button></div>
        <div className="source-root-grid">
          {(AURA_PAGE_TREE.children ?? []).map((node) => (
            <button key={node.id} type="button" onClick={() => onOpenPages(node)}>
              <span><Boxes size={18} aria-hidden="true" /></span>
              <strong>{node.label}</strong>
              <small>{node.children?.length ?? 0} direct pathways</small>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
