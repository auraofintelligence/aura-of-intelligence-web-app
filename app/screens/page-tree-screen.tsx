"use client";

import { ArrowLeft, Boxes, ChevronRight, FolderTree, LockKeyhole, Eye } from "lucide-react";
import { declarationTitle, type ParticipantDeclaration } from "../data/declarations";
import { AURA_PAGE_TREE, findSourceNode, sourcePathLabels, type SourceNode } from "../data/page-tree";

type PageTreeScreenProps = {
  currentNodeId: string;
  declarations: ParticipantDeclaration[];
  onNodeChange: (nodeId: string) => void;
  onEditDeclaration: (record: ParticipantDeclaration) => void;
};

export function PageTreeScreen({ currentNodeId, declarations, onNodeChange, onEditDeclaration }: PageTreeScreenProps) {
  const indexed = findSourceNode(currentNodeId) ?? findSourceNode(AURA_PAGE_TREE.id)!;
  const current = indexed as SourceNode;
  const path = indexed.path;
  const parent = path.length > 1 ? path[path.length - 2] : null;
  const pageRecords = declarations.filter((record) => record.sourceNodeId === current.id);

  return (
    <div className="screen-stack page-tree-screen">
      <section className="screen-intro page-tree-intro">
        <p className="eyebrow"><FolderTree size={14} aria-hidden="true" /> Aura App Page List</p>
        <div className="page-title-with-back">
          {parent ? <button className="round-control" type="button" onClick={() => onNodeChange(parent.id)} aria-label={`Back to ${parent.label}`}><ArrowLeft size={19} aria-hidden="true" /></button> : null}
          <div><h1>{current.label}</h1><p>{current.id === AURA_PAGE_TREE.id ? "The exact workbook hierarchy, kept as navigation rather than flattened into invented app categories." : "This pathway remains in its original source position. Its source-specific input will preserve this exact page path."}</p></div>
        </div>
      </section>

      <nav className="source-breadcrumbs" aria-label="Current Aura page path">
        {path.map((node, index) => (
          <span key={node.id}>
            <button type="button" onClick={() => onNodeChange(node.id)} aria-current={index === path.length - 1 ? "page" : undefined}>{node.label}</button>
            {index < path.length - 1 ? <ChevronRight size={13} aria-hidden="true" /> : null}
          </span>
        ))}
      </nav>

      <section className="source-page-card surface-card">
        <div className="source-page-meta">
          <span><Boxes size={17} aria-hidden="true" /> {current.kind}</span>
          <span>{current.sourceCell ? `Source ${current.sourceCell}` : "Workbook source"}</span>
        </div>
        <h2>{current.children?.length ? `${current.children.length} direct pathways` : "Source-defined page"}</h2>
        {current.children?.length ? (
          <div className="exact-child-list">
            {current.children.map((child) => {
              const directRecords = declarations.filter((record) => record.sourceNodeId === child.id).length;
              return (
                <button key={child.id} type="button" onClick={() => onNodeChange(child.id)}>
                  <span><strong>{child.label}</strong><small>{child.children?.length ? `${child.children.length} direct pathways` : "Open source page"}{directRecords ? ` · ${directRecords} declaration${directRecords === 1 ? "" : "s"}` : ""}</small></span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="source-leaf-message">
            <FolderTree size={22} aria-hidden="true" />
            <strong>{current.label}</strong>
            <span>{sourcePathLabels(indexed).join(" / ")}</span>
          </div>
        )}
        <p className="source-input-note">This checkpoint keeps the workbook hierarchy exact. Each data-collecting pathway will receive its own source-specific input rather than sharing an invented universal form.</p>
      </section>

      {pageRecords.length ? (
        <section className="content-section">
          <div className="section-title-row"><div><p className="eyebrow">Participant Declarations</p><h2>Data attached here</h2></div></div>
          <div className="declaration-record-list">
            {pageRecords.map((record) => (
              <button key={record.id} type="button" onClick={() => onEditDeclaration(record)}>
                <span className={`record-view-mark ${record.face === "O" ? "is-exterior" : ""}`}>{record.face === "I" ? <LockKeyhole size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</span>
                <span><small>{record.kind} · {record.date || "Date not set"}</small><strong>{declarationTitle(record)}</strong><em>{record.face === "I" ? "Interior (Personal)" : "Exterior (Observer)"}</em></span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
