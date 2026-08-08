"use client";

import { CalendarDays, ChevronDown, Eye, LockKeyhole, MapPin, Save, Sparkles } from "lucide-react";
import { FormEvent, useCallback, useRef, useState } from "react";
import {
  DECLARATION_KINDS,
  makeDeclarationDraft,
  type DeclarationDraft,
  type ParticipantDeclaration,
} from "../data/declarations";
import { BottomSheet } from "./bottom-sheet";
import { SegmentedControl } from "./segmented-control";

type DeclarationFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (draft: DeclarationDraft, editingId?: string, continuationOfId?: string) => void;
  sourceNodeId?: string;
  sourcePath?: string[];
  editing?: ParticipantDeclaration | null;
};

function draftFromRecord(record: ParticipantDeclaration): DeclarationDraft {
  const draft: Partial<ParticipantDeclaration> = { ...record };
  delete draft.id;
  delete draft.createdAt;
  delete draft.updatedAt;
  delete draft.timestamp;
  return draft as DeclarationDraft;
}

export function DeclarationForm({ open, onClose, onSave, sourceNodeId = "", sourcePath = ["Participant Declarations"], editing = null }: DeclarationFormProps) {
  const [draft, setDraft] = useState<DeclarationDraft>(() => editing ? draftFromRecord(editing) : makeDeclarationDraft(sourceNodeId, sourcePath));
  const dirtyRef = useRef(false);
  const sourceKey = sourcePath.join(" / ");

  const update = <K extends keyof DeclarationDraft>(key: K, value: DeclarationDraft[K]) => {
    dirtyRef.current = true;
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const requestClose = useCallback(() => {
    if (dirtyRef.current && !window.confirm("Discard the changes in this LifeLogging record?")) return;
    dirtyRef.current = false;
    onClose();
  }, [onClose]);

  const preparedDraft = () => ({
    ...draft,
    significantEvent: draft.significantEvent.trim(),
    thingsIWantedToBe: draft.thingsIWantedToBe.trim(),
    pointOfViewSummary: draft.pointOfViewSummary.trim(),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.significantEvent.trim() && !draft.thingsIWantedToBe.trim() && !draft.pointOfViewSummary.trim()) return;
    dirtyRef.current = false;
    onSave(preparedDraft(), editing?.id);
  };

  const hasDeclarationContent = Boolean(
    draft.significantEvent.trim() || draft.thingsIWantedToBe.trim() || draft.pointOfViewSummary.trim(),
  );

  return (
    <BottomSheet open={open} onClose={requestClose} title={editing ? "Revisit LifeLogging record" : "Add a LifeLogging record"} kicker="Participant Declarations">
      <form className="declaration-form" onSubmit={submit}>
        <div className="declaration-source-path">
          <Sparkles size={17} aria-hidden="true" />
          <span><small>Source page</small><strong>{sourceKey}</strong></span>
        </div>

        <label>
          <span>LifeLogging record kind</span>
          <select value={draft.kind} onChange={(event) => update("kind", event.target.value as DeclarationDraft["kind"])}>
            {DECLARATION_KINDS.map((kind) => <option key={kind}>{kind}</option>)}
          </select>
        </label>

        <label>
          <span>Significant Events</span>
          <textarea value={draft.significantEvent} onChange={(event) => update("significantEvent", event.target.value)} placeholder="What are you declaring about yourself?" rows={4} />
        </label>

        <label>
          <span>Things I&rsquo;ve wanted to be</span>
          <input value={draft.thingsIWantedToBe} onChange={(event) => update("thingsIWantedToBe", event.target.value)} placeholder="Optional self-description or direction" />
        </label>

        <fieldset className="declaration-view-fieldset">
          <legend>Point of view and access</legend>
          <SegmentedControl
            label="Declaration view"
            value={draft.face}
            options={[{ value: "I", label: "Interior · Personal" }, { value: "O", label: "Exterior · Observer" }]}
            onChange={(value) => update("face", value)}
          />
          <p>{draft.face === "I" ? <><LockKeyhole size={15} aria-hidden="true" /> A declaration to yourself in the Interior (Personal) view.</> : <><Eye size={15} aria-hidden="true" /> A declaration prepared for others in the Exterior (Observer) view.</>}</p>
        </fieldset>

        {draft.face === "O" ? (
          <div className="declaration-audience-fields">
            <label>
              <span>Who can I share something with?</span>
              <input value={draft.audience} onChange={(event) => update("audience", event.target.value)} placeholder="Person, people or group" />
            </label>
            <p className="field-note">Exterior means permissioned Observer view. It is not the same as expressly Public content.</p>
          </div>
        ) : null}

        <details className="declaration-details">
          <summary><span><CalendarDays size={17} aria-hidden="true" /> Time and location</span><ChevronDown size={17} aria-hidden="true" /></summary>
          <div>
            <label><span>Date</span><input type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} /></label>
            <div className="form-two-column">
              <label><span>Date Range 1</span><input type="date" value={draft.dateRange1} onChange={(event) => update("dateRange1", event.target.value)} /></label>
              <label><span>Date Range 2</span><input type="date" value={draft.dateRange2} onChange={(event) => update("dateRange2", event.target.value)} /></label>
            </div>
            <div className="form-two-column">
              <label><span>Location 1</span><input value={draft.location1} onChange={(event) => update("location1", event.target.value)} placeholder="Place or coordinates" /></label>
              <label><span>Location 2</span><input value={draft.location2} onChange={(event) => update("location2", event.target.value)} placeholder="Optional second place" /></label>
            </div>
          </div>
        </details>

        <details className="declaration-details">
          <summary><span><MapPin size={17} aria-hidden="true" /> State, cause and effect</span><ChevronDown size={17} aria-hidden="true" /></summary>
          <div>
            <label><span>Initial State</span><textarea value={draft.initialState} onChange={(event) => update("initialState", event.target.value)} rows={2} /></label>
            <div className="form-two-column">
              <label><span>Cause</span><textarea value={draft.cause} onChange={(event) => update("cause", event.target.value)} rows={2} /></label>
              <label><span>Effect</span><textarea value={draft.effect} onChange={(event) => update("effect", event.target.value)} rows={2} /></label>
            </div>
            <label><span>Resulting State</span><textarea value={draft.resultingState} onChange={(event) => update("resultingState", event.target.value)} rows={2} /></label>
            <div className="form-two-column">
              <label><span>Delay</span><input value={draft.delay} onChange={(event) => update("delay", event.target.value)} /></label>
              <label><span>Reason for Delay</span><input value={draft.reasonForDelay} onChange={(event) => update("reasonForDelay", event.target.value)} /></label>
            </div>
          </div>
        </details>

        <details className="declaration-details">
          <summary><span><Eye size={17} aria-hidden="true" /> Proof and point of view</span><ChevronDown size={17} aria-hidden="true" /></summary>
          <div>
            <label><span>Proof of State</span><textarea value={draft.proofOfState} onChange={(event) => update("proofOfState", event.target.value)} rows={2} /></label>
            <label><span>Proof of Work</span><textarea value={draft.proofOfWork} onChange={(event) => update("proofOfWork", event.target.value)} rows={2} /></label>
            <label><span>Proof of Reputation</span><textarea value={draft.proofOfReputation} onChange={(event) => update("proofOfReputation", event.target.value)} rows={2} /></label>
            <label><span>Point of View Summary</span><textarea value={draft.pointOfViewSummary} onChange={(event) => update("pointOfViewSummary", event.target.value)} rows={3} /></label>
          </div>
        </details>

        <div className="declaration-submit-bar">
          <button className="primary-action wide-action" type="submit" disabled={!hasDeclarationContent}><Save size={18} aria-hidden="true" /> {editing ? "Save correction" : "Save LifeLogging record"}</button>
          {editing ? <button className="secondary-action wide-action" type="button" disabled={!hasDeclarationContent} onClick={() => { dirtyRef.current = false; onSave({ ...preparedDraft(), continuationOfId: editing.id }, undefined, editing.id); }}><Sparkles size={17} aria-hidden="true" /> Re-answer as a new point in time</button> : null}
        </div>
        <p className="prototype-note">Saved only in this browser. Exterior is a permissioned Observer state in this prototype; it is not Public and does not publish or grant access.</p>
      </form>
    </BottomSheet>
  );
}
