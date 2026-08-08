"use client";

import { ArrowRight, Boxes, Check, ChevronRight, Database, Eye, FilePlus2, LockKeyhole, Search, Trash2, UserRound } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DeclarationsHome } from "../screens/declarations-home";
import { MatrixScreen } from "../screens/matrix-screen";
import { PageTreeScreen } from "../screens/page-tree-screen";
import { RecordsScreen } from "../screens/records-screen";
import { AURA_SHELLS, type AuraFace } from "../data/aura";
import { declarationTitle, type DeclarationDraft, type ParticipantDeclaration } from "../data/declarations";
import { ALL_AURA_PAGES, AURA_PAGE_TREE, findSourceNode, type SourceNode } from "../data/page-tree";
import type { AuraCellSelection } from "./aura-geometry";
import { AppHeader } from "./app-header";
import { BottomNav, type PrimaryTab } from "./bottom-nav";
import { BottomSheet } from "./bottom-sheet";
import { DeclarationForm } from "./declaration-form";

type Binding = {
  kind: "declaration" | "source-page" | "operation";
  referenceId: string;
  label: string;
};

type DeclarationSource = {
  nodeId: string;
  path: string[];
};

function readLocalValue<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function routeFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.startsWith("pages/")) return { tab: "pages" as PrimaryTab, nodeId: decodeURIComponent(hash.slice(6)) };
  if (["home", "pages", "records", "matrix"].includes(hash)) return { tab: hash as PrimaryTab, nodeId: AURA_PAGE_TREE.id };
  return { tab: "home" as PrimaryTab, nodeId: AURA_PAGE_TREE.id };
}

function newRecordId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `aura-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AuraApp() {
  const [tab, setTab] = useState<PrimaryTab>("home");
  const [pageNodeId, setPageNodeId] = useState(AURA_PAGE_TREE.id);
  const [activeShell, setActiveShell] = useState(6);
  const [face, setFace] = useState<AuraFace>("I");
  const [selected, setSelected] = useState<AuraCellSelection | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [declarationOpen, setDeclarationOpen] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState<ParticipantDeclaration | null>(null);
  const [declarationSource, setDeclarationSource] = useState<DeclarationSource>({ nodeId: "participant-declarations", path: ["Participant Declarations"] });
  const [programOpen, setProgramOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [declarations, setDeclarations] = useState<ParticipantDeclaration[]>([]);
  const [bindings, setBindings] = useState<Record<string, Binding>>({});
  const [bindingKind, setBindingKind] = useState<Binding["kind"]>("declaration");
  const [bindingReference, setBindingReference] = useState("");
  const [bindingLabel, setBindingLabel] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const closeDeclaration = useCallback(() => {
    setDeclarationOpen(false);
    setEditingDeclaration(null);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const route = routeFromHash();
      setTab(route.tab);
      if (findSourceNode(route.nodeId)) setPageNodeId(route.nodeId);
      setDeclarations(readLocalValue("aura.participant-declarations.v1", []));
      setBindings(readLocalValue("aura.matrix-bindings.v1", {}));
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onLocationChange = () => {
      const route = routeFromHash();
      setTab(route.tab);
      if (findSourceNode(route.nodeId)) setPageNodeId(route.nodeId);
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("popstate", onLocationChange);
    window.addEventListener("hashchange", onLocationChange);
    return () => {
      window.removeEventListener("popstate", onLocationChange);
      window.removeEventListener("hashchange", onLocationChange);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("aura.participant-declarations.v1", JSON.stringify(declarations));
  }, [declarations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("aura.matrix-bindings.v1", JSON.stringify(bindings));
  }, [bindings, hydrated]);

  const changeTab = useCallback((next: PrimaryTab) => {
    setTab(next);
    const nextHash = next === "pages" && pageNodeId !== AURA_PAGE_TREE.id ? `#pages/${encodeURIComponent(pageNodeId)}` : `#${next}`;
    if (window.location.hash !== nextHash) window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [pageNodeId]);

  const openPages = useCallback((node?: SourceNode) => {
    const nextId = node?.id ?? AURA_PAGE_TREE.id;
    setPageNodeId(nextId);
    setTab("pages");
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#pages/${encodeURIComponent(nextId)}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const changePageNode = (nodeId: string) => {
    if (!findSourceNode(nodeId)) return;
    setPageNodeId(nodeId);
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#pages/${encodeURIComponent(nodeId)}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const beginDeclaration = () => {
    setDeclarationSource({ nodeId: "participant-declarations", path: ["Participant Declarations"] });
    setEditingDeclaration(null);
    setDeclarationOpen(true);
  };

  const editDeclaration = (record: ParticipantDeclaration) => {
    setDeclarationSource({ nodeId: record.sourceNodeId, path: record.sourcePath });
    setEditingDeclaration(record);
    setDeclarationOpen(true);
  };

  const saveDeclaration = (draft: DeclarationDraft, editingId?: string, continuationOfId?: string) => {
    const now = new Date().toISOString();
    setDeclarations((current) => {
      if (editingId) {
        return current.map((record) => record.id === editingId ? { ...record, ...draft, updatedAt: now } : record);
      }
      return [{ ...draft, continuationOfId: continuationOfId ?? draft.continuationOfId, id: newRecordId(), timestamp: now, createdAt: now, updatedAt: now }, ...current];
    });
    setDeclarationOpen(false);
    setEditingDeclaration(null);
    changeTab("records");
  };

  const bindingKey = useMemo(() => selected ? `${selected.shell}:${selected.face}:${selected.cell}` : "", [selected]);
  const currentBinding = bindingKey ? bindings[bindingKey] : undefined;

  const onSelectCell = (selection: AuraCellSelection) => {
    setSelected(selection);
    setActiveShell(selection.shell);
    setFace(selection.face);
  };

  const openProgramSheet = () => {
    if (!selected) return;
    const declarationsForFace = declarations.filter((record) => record.face === selected.face);
    const suggestedKind: Binding["kind"] = declarationsForFace.length ? "declaration" : "source-page";
    setBindingKind(currentBinding?.kind ?? suggestedKind);
    setBindingReference(currentBinding?.referenceId ?? (suggestedKind === "declaration" ? declarationsForFace[0]?.id ?? "" : AURA_PAGE_TREE.id));
    setBindingLabel(currentBinding?.label ?? "");
    setProgramOpen(true);
  };

  const saveBinding = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    let label = bindingLabel.trim();
    if (bindingKind === "declaration") {
      const record = declarations.find((item) => item.id === bindingReference);
      if (!record || record.face !== selected.face) return;
      label = record ? declarationTitle(record) : "";
    }
    if (bindingKind === "source-page") label = findSourceNode(bindingReference)?.label ?? "";
    if (!label) return;
    setBindings((current) => ({ ...current, [bindingKey]: { kind: bindingKind, referenceId: bindingReference, label } }));
    setProgramOpen(false);
  };

  const removeBinding = () => {
    if (!bindingKey) return;
    setBindings((current) => {
      const next = { ...current };
      delete next[bindingKey];
      return next;
    });
    setBindingReference("");
    setBindingLabel("");
  };

  const pageSearchResults = useMemo(() => {
    const term = globalQuery.trim().toLocaleLowerCase("en-AU");
    if (!term) return ALL_AURA_PAGES.slice(0, 8);
    return ALL_AURA_PAGES.filter((node) => `${node.label} ${node.path.map((item) => item.label).join(" ")}`.toLocaleLowerCase("en-AU").includes(term)).slice(0, 40);
  }, [globalQuery]);

  const recordSearchResults = useMemo(() => {
    const term = globalQuery.trim().toLocaleLowerCase("en-AU");
    if (!term) return [];
    return declarations.filter((record) => `${record.kind} ${record.significantEvent} ${record.sourcePath.join(" ")}`.toLocaleLowerCase("en-AU").includes(term)).slice(0, 12);
  }, [declarations, globalQuery]);

  const title = tab === "pages" ? findSourceNode(pageNodeId)?.label : tab === "records" ? "Participant Declarations" : tab === "matrix" ? "Matrix Programmer" : "Aura of Intelligence";

  return (
    <div className="aura-app-shell">
      <a className="skip-link" href="#aura-content">Skip to Aura content</a>
      <AppHeader title={title} onSearch={() => setSearchOpen(true)} onProfile={() => setProfileOpen(true)} />

      <main id="aura-content" className="app-content" tabIndex={-1}>
        <div className="screen-transition" key={`${tab}-${tab === "pages" ? pageNodeId : ""}`}>
          {tab === "home" ? <DeclarationsHome declarations={declarations} activeShell={activeShell} face={face} selected={selected} onShellChange={setActiveShell} onFaceChange={setFace} onCellSelect={onSelectCell} onAddDeclaration={() => beginDeclaration()} onOpenPages={openPages} onOpenRecords={() => changeTab("records")} onOpenMatrix={() => changeTab("matrix")} onEditDeclaration={editDeclaration} /> : null}
          {tab === "pages" ? <PageTreeScreen currentNodeId={pageNodeId} declarations={declarations} onNodeChange={changePageNode} onEditDeclaration={editDeclaration} /> : null}
          {tab === "records" ? <RecordsScreen declarations={declarations} onAddDeclaration={() => beginDeclaration()} onEditDeclaration={editDeclaration} /> : null}
          {tab === "matrix" ? <MatrixScreen activeShell={activeShell} face={face} selected={selected} onShellChange={setActiveShell} onFaceChange={setFace} onCellSelect={onSelectCell} onProgram={openProgramSheet} /> : null}
        </div>
      </main>

      <BottomNav active={tab} onChange={changeTab} onAdd={() => beginDeclaration()} />

      {declarationOpen ? <DeclarationForm open onClose={closeDeclaration} onSave={saveDeclaration} sourceNodeId={declarationSource.nodeId} sourcePath={declarationSource.path} editing={editingDeclaration} /> : null}

      <BottomSheet open={searchOpen} onClose={() => setSearchOpen(false)} title="Search Aura" kicker="Quick Navigation and Site Map">
        <div className="search-field sheet-search-field">
          <Search size={19} aria-hidden="true" />
          <input value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} placeholder="Search all 383 page-tree names and your records" aria-label="Search Aura page tree and participant declarations" />
        </div>
        {recordSearchResults.length ? <div className="search-result-section"><p className="eyebrow">Your declarations</p><div className="global-search-actions">{recordSearchResults.map((record) => <button key={record.id} type="button" onClick={() => { editDeclaration(record); setSearchOpen(false); setGlobalQuery(""); }}><span className="search-action-icon"><FilePlus2 size={19} aria-hidden="true" /></span><span><strong>{declarationTitle(record)}</strong><small>{record.kind} · {record.sourcePath.join(" / ")}</small></span><ChevronRight size={17} aria-hidden="true" /></button>)}</div></div> : null}
        <div className="search-result-section"><p className="eyebrow">Exact page tree</p><div className="global-search-actions">{pageSearchResults.map((node) => <button key={node.id} type="button" onClick={() => { openPages(node); setSearchOpen(false); setGlobalQuery(""); }}><span className="search-action-icon"><Boxes size={19} aria-hidden="true" /></span><span><strong>{node.label}</strong><small>{node.path.map((item) => item.label).join(" / ")}</small></span><ChevronRight size={17} aria-hidden="true" /></button>)}</div></div>
      </BottomSheet>

      <BottomSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Your Aura" kicker="Device-local prototype">
        <div className="profile-sheet-hero"><span><UserRound size={28} aria-hidden="true" /></span><div><strong>Self-directed participant record</strong><small>No account or external service connected</small></div></div>
        <div className="profile-status-list">
          <div><LockKeyhole size={18} aria-hidden="true" /><span><strong>Interior (Personal)</strong><small>{declarations.filter((record) => record.face === "I").length} declarations to yourself</small></span><span className="status-ok"><Check size={13} /> Local</span></div>
          <div><Eye size={18} aria-hidden="true" /><span><strong>Exterior (Observer)</strong><small>{declarations.filter((record) => record.face === "O").length} permission states; nothing published</small></span><span className="status-off">Not shared</span></div>
          <div><Database size={18} aria-hidden="true" /><span><strong>Structured data</strong><small>Participant declarations and matrix bindings stay in this browser</small></span><span className="status-ok"><Check size={13} /> {declarations.length}</span></div>
        </div>
        <button className="primary-action wide-action" type="button" onClick={() => { changeTab("records"); setProfileOpen(false); }}>Review your records <ArrowRight size={17} aria-hidden="true" /></button>
        <p className="prototype-note">The source distinguishes operator-only Interior data, permissioned Exterior data and expressly public pathways. This prototype records intent but does not grant access, encrypt, sync or publish.</p>
      </BottomSheet>

      <BottomSheet open={programOpen && Boolean(selected)} onClose={() => setProgramOpen(false)} title={selected ? `${AURA_SHELLS[selected.shell].name} · ${selected.face}${String(selected.cell).padStart(3, "0")}` : "Program facet"} kicker="Matrix Programmer">
        <div className="address-summary">
          <span style={{ background: selected ? AURA_SHELLS[selected.shell].colour : undefined }} />
          <div><strong>{selected ? `Row ${selected.row + 1} · Segment ${selected.column + 1}` : ""}</strong><small>{selected?.face === "I" ? "Interior (Personal) View" : "Exterior (Observer) View"}</small></div>
          <span className="kind-pill">{selected?.face}</span>
        </div>
        <form className="sheet-form" onSubmit={saveBinding}>
          <label><span>Bind this facet to</span><select value={bindingKind} onChange={(event) => { const kind = event.target.value as Binding["kind"]; setBindingKind(kind); setBindingReference(kind === "declaration" ? declarations[0]?.id ?? "" : kind === "source-page" ? AURA_PAGE_TREE.id : ""); }}><option value="declaration">Participant declaration</option><option value="source-page">Exact source page</option><option value="operation">Operation</option></select></label>
          {bindingKind === "declaration" ? <label><span>{selected?.face === "I" ? "Interior" : "Exterior"} participant declaration</span><select value={bindingReference} onChange={(event) => setBindingReference(event.target.value)}><option value="">Choose a declaration for this view</option>{declarations.filter((record) => record.face === selected?.face).map((record) => <option key={record.id} value={record.id}>{record.kind}: {declarationTitle(record)}</option>)}</select></label> : null}
          {bindingKind === "source-page" ? <label><span>Exact source page</span><select value={bindingReference} onChange={(event) => setBindingReference(event.target.value)}>{ALL_AURA_PAGES.map((node) => <option key={node.id} value={node.id}>{node.path.map((item) => item.label).join(" / ")}</option>)}</select></label> : null}
          {bindingKind === "operation" ? <label><span>Operation name</span><input value={bindingLabel} onChange={(event) => setBindingLabel(event.target.value)} placeholder="Description, question, order, prediction or action" /></label> : null}
          <button className="primary-action wide-action" type="submit" disabled={bindingKind === "operation" ? !bindingLabel.trim() : !bindingReference}>Save matrix binding <ArrowRight size={17} aria-hidden="true" /></button>
          {currentBinding ? <button className="danger-text-action" type="button" onClick={removeBinding}><Trash2 size={16} aria-hidden="true" /> Remove local binding</button> : null}
        </form>
        <p className="prototype-note">The source supports assigning meaning as a description, question or value, and function as an order, prediction or action. This prototype stores only a local link.</p>
      </BottomSheet>
    </div>
  );
}
