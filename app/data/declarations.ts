import type { AuraFace } from "./aura";

export const DECLARATION_KINDS = [
  "Narrative",
  "Motivations",
  "Peaks",
  "Pains",
  "Emotions",
  "Firsts",
  "Joys",
  "Challenges",
  "Gifts",
  "Empathy",
  "Choices",
  "Hopes",
  "Beliefs",
  "Values",
  "Attitudes",
  "Happiness",
  "Tools",
  "Models",
] as const;

export type DeclarationKind = (typeof DECLARATION_KINDS)[number];

export type ParticipantDeclaration = {
  id: string;
  kind: DeclarationKind;
  thingsIWantedToBe: string;
  significantEvent: string;
  timestamp: string;
  date: string;
  dateRange1: string;
  dateRange2: string;
  location1: string;
  location2: string;
  initialState: string;
  cause: string;
  effect: string;
  resultingState: string;
  delay: string;
  reasonForDelay: string;
  proofOfState: string;
  proofOfWork: string;
  proofOfReputation: string;
  pointOfViewSummary: string;
  face: AuraFace;
  audience: string;
  sourceNodeId: string;
  sourcePath: string[];
  continuationOfId: string;
  createdAt: string;
  updatedAt: string;
};

export type DeclarationDraft = Omit<ParticipantDeclaration, "id" | "createdAt" | "updatedAt" | "timestamp">;

export function declarationTitle(record: Pick<ParticipantDeclaration, "kind" | "significantEvent" | "thingsIWantedToBe" | "pointOfViewSummary">) {
  return record.significantEvent || record.thingsIWantedToBe || record.pointOfViewSummary || record.kind;
}

export function makeDeclarationDraft(sourceNodeId = "participant-declarations", sourcePath: string[] = ["Participant Declarations"]): DeclarationDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    kind: "Narrative",
    thingsIWantedToBe: "",
    significantEvent: "",
    date: today,
    dateRange1: "",
    dateRange2: "",
    location1: "",
    location2: "",
    initialState: "",
    cause: "",
    effect: "",
    resultingState: "",
    delay: "",
    reasonForDelay: "",
    proofOfState: "",
    proofOfWork: "",
    proofOfReputation: "",
    pointOfViewSummary: "",
    face: "I",
    audience: "",
    sourceNodeId,
    sourcePath,
    continuationOfId: "",
  };
}
