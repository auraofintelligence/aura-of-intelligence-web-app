"use client";

import { FilePlus2, FolderTree, Grid3X3, Home, LibraryBig } from "lucide-react";

export type PrimaryTab = "home" | "pages" | "records" | "matrix";

const NAV_ITEMS = [
  { id: "home", label: "Home", Icon: Home },
  { id: "pages", label: "Page tree", Icon: FolderTree },
  { id: "add", label: "Declare", Icon: FilePlus2 },
  { id: "records", label: "Records", Icon: LibraryBig },
  { id: "matrix", label: "Matrix", Icon: Grid3X3 },
] as const;

type BottomNavProps = {
  active: PrimaryTab;
  onChange: (tab: PrimaryTab) => void;
  onAdd: () => void;
};

export function BottomNav({ active, onChange, onAdd }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary app navigation">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`${active === id ? "is-active" : ""} ${id === "add" ? "nav-add-button" : ""}`}
          aria-current={active === id ? "page" : undefined}
          onClick={() => id === "add" ? onAdd() : onChange(id)}
          aria-label={id === "add" ? "Make a participant declaration" : undefined}
        >
          <span className="nav-icon"><Icon size={21} strokeWidth={active === id ? 2.25 : 1.8} aria-hidden="true" /></span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
