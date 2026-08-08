export type AuraFace = "I" | "O";

export type AuraShell = {
  id: string;
  name: string;
  chakra: string;
  colour: string;
  glow: string;
  uniformGrid: string;
  expandingGrid: string;
};

export const AURA_SHELLS: AuraShell[] = [
  { id: "red", name: "Red", chakra: "Red Chakra", colour: "#ff5145", glow: "rgba(255,81,69,.42)", uniformGrid: "12 × 24", expandingGrid: "12 × 24" },
  { id: "orange", name: "Orange", chakra: "Orange Chakra", colour: "#ff9d42", glow: "rgba(255,157,66,.4)", uniformGrid: "12 × 24", expandingGrid: "24 × 45" },
  { id: "yellow", name: "Yellow", chakra: "Yellow Chakra", colour: "#ffd84b", glow: "rgba(255,216,75,.38)", uniformGrid: "12 × 24", expandingGrid: "36 × 72" },
  { id: "green", name: "Green", chakra: "Green Chakra", colour: "#4ee29a", glow: "rgba(78,226,154,.38)", uniformGrid: "12 × 24", expandingGrid: "40 × 90" },
  { id: "blue", name: "Blue", chakra: "Blue Chakra", colour: "#58a9ff", glow: "rgba(88,169,255,.4)", uniformGrid: "12 × 24", expandingGrid: "45 × 120" },
  { id: "indigo", name: "Indigo", chakra: "Indigo Chakra", colour: "#7d72ff", glow: "rgba(125,114,255,.42)", uniformGrid: "12 × 24", expandingGrid: "60 × 180" },
  { id: "violet", name: "Violet", chakra: "Violet Chakra", colour: "#c16dff", glow: "rgba(193,109,255,.44)", uniformGrid: "12 × 24", expandingGrid: "90 × 200" },
];
