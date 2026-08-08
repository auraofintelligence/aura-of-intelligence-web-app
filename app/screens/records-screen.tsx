"use client";

import { ChevronRight, Eye, FilePlus2, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SegmentedControl } from "../components/segmented-control";
import { declarationTitle, type ParticipantDeclaration } from "../data/declarations";

type RecordsScreenProps = {
  declarations: ParticipantDeclaration[];
  onAddDeclaration: () => void;
  onEditDeclaration: (record: ParticipantDeclaration) => void;
};

type RecordView = "all" | "I" | "O";

function displayDate(record: ParticipantDeclaration) {
  if (!record.date) return new Date(record.timestamp).toLocaleDateString("en-AU");
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${record.date}T00:00:00`));
}

function recordedAt(record: ParticipantDeclaration) {
  return `Recorded ${new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(record.timestamp))}`;
}

export function RecordsScreen({ declarations, onAddDeclaration, onEditDeclaration }: RecordsScreenProps) {
  const [view, setView] = useState<RecordView>("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("en-AU");
    return [...declarations].sort((left, right) => {
      const leftTime = left.date ? new Date(`${left.date}T12:00:00`).getTime() : new Date(left.timestamp).getTime();
      const rightTime = right.date ? new Date(`${right.date}T12:00:00`).getTime() : new Date(right.timestamp).getTime();
      return rightTime - leftTime;
    }).filter((record) => {
      if (view !== "all" && record.face !== view) return false;
      if (!term) return true;
      return `${record.kind} ${record.significantEvent} ${record.thingsIWantedToBe} ${record.sourcePath.join(" ")} ${record.location1} ${record.location2}`.toLocaleLowerCase("en-AU").includes(term);
    });
  }, [declarations, query, view]);

  return (
    <div className="screen-stack records-screen">
      <section className="screen-intro records-intro">
        <p className="eyebrow">LifeLogging</p>
        <h1>Your declarations across time.</h1>
        <p>Revisit what you declared, the state you began in, what changed, and which point of view the record belongs to.</p>
      </section>

      <SegmentedControl label="Declaration record view" value={view} options={[{ value: "all", label: `All · ${declarations.length}` }, { value: "I", label: `Interior · ${declarations.filter((item) => item.face === "I").length}` }, { value: "O", label: `Exterior · ${declarations.filter((item) => item.face === "O").length}` }]} onChange={setView} />

      <div className="search-field records-search">
        <Search size={19} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your declarations" aria-label="Search participant declarations" />
      </div>

      {filtered.length ? (
        <section className="records-timeline" aria-label="Participant declaration timeline">
          {filtered.map((record) => (
            <article key={record.id}>
              <span className="timeline-dot" aria-hidden="true" />
              <button type="button" onClick={() => onEditDeclaration(record)}>
                <span className="record-time"><strong>{displayDate(record)}</strong><small>{recordedAt(record)}</small></span>
                <span className="record-card-body">
                  <span className={`record-view-mark ${record.face === "O" ? "is-exterior" : ""}`}>{record.face === "I" ? <LockKeyhole size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</span>
                  <span><small>{record.continuationOfId ? "Re-answer · " : ""}{record.kind} · {record.face === "I" ? "Interior (Personal)" : "Exterior (Observer)"}</small><strong>{declarationTitle(record)}</strong>{record.resultingState ? <em>Resulting State: {record.resultingState}</em> : null}<i>{record.sourcePath.join(" / ")}</i></span>
                  <ChevronRight size={17} aria-hidden="true" />
                </span>
              </button>
            </article>
          ))}
        </section>
      ) : (
        <button className="declaration-empty-state" type="button" onClick={onAddDeclaration}>
          <FilePlus2 size={24} aria-hidden="true" />
          <strong>{declarations.length ? "No declarations match this view." : "No participant declarations yet."}</strong>
          <span>{declarations.length ? "Change the point-of-view filter or search, or add another record." : "Make the first record using the source-defined LifeLogging fields."}</span>
        </button>
      )}

      <button className="primary-action wide-action records-add-button" type="button" onClick={onAddDeclaration}><FilePlus2 size={18} aria-hidden="true" /> Make a participant declaration</button>
    </div>
  );
}
