"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { AuraCellSelection } from "./aura-geometry";
import { AURA_SHELLS, type AuraFace } from "../data/aura";

type MatrixGridProps = {
  activeShell: number;
  face: AuraFace;
  selected: AuraCellSelection | null;
  onSelect: (selection: AuraCellSelection) => void;
};

export function MatrixGrid({ activeShell, face, selected, onSelect }: MatrixGridProps) {
  const shell = AURA_SHELLS[activeShell];
  const cells = Array.from({ length: 288 }, (_, index) => index + 1);
  const selectedCell = selected?.shell === activeShell && selected.face === face ? selected.cell : null;
  const [focusCell, setFocusCell] = useState(selectedCell ?? 1);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, cell: number) => {
    const row = Math.floor((cell - 1) / 24);
    const column = (cell - 1) % 24;
    let next = cell;

    if (event.key === "ArrowRight") next = column < 23 ? cell + 1 : cell;
    else if (event.key === "ArrowLeft") next = column > 0 ? cell - 1 : cell;
    else if (event.key === "ArrowDown") next = row < 11 ? cell + 24 : cell;
    else if (event.key === "ArrowUp") next = row > 0 ? cell - 24 : cell;
    else if (event.key === "Home") next = row * 24 + 1;
    else if (event.key === "End") next = row * 24 + 24;
    else return;

    event.preventDefault();
    setFocusCell(next);
    cellRefs.current[next - 1]?.focus();
  };

  return (
    <div className="matrix-scroll" role="region" aria-label={`${shell.name} shell flat 12 by 24 matrix. Scroll horizontally to explore. Use arrow keys to move between DataCells.`}>
      <div className="matrix-axis matrix-axis-top" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => <span key={index}>{index + 1}</span>)}
      </div>
      <div className="matrix-body">
        <div className="matrix-row-axis" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => <span key={index}>{index + 1}</span>)}
        </div>
        <div className="matrix-grid" style={{ "--matrix-colour": shell.colour, "--matrix-glow": shell.glow } as React.CSSProperties}>
          {cells.map((cell) => {
            const row = Math.floor((cell - 1) / 24);
            const column = (cell - 1) % 24;
            const isSelected = selected?.shell === activeShell && selected?.face === face && selected?.cell === cell;
            return (
              <button
                key={cell}
                type="button"
                className={isSelected ? "is-selected" : ""}
                aria-label={`${shell.name} ${face}${String(cell).padStart(3, "0")}, row ${row + 1}, column ${column + 1}`}
                aria-pressed={isSelected}
                tabIndex={cell === focusCell ? 0 : -1}
                ref={(element) => { cellRefs.current[cell - 1] = element; }}
                onFocus={() => setFocusCell(cell)}
                onKeyDown={(event) => moveFocus(event, cell)}
                onClick={() => {
                  setFocusCell(cell);
                  onSelect({ shell: activeShell, row, column, cell, face });
                }}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
