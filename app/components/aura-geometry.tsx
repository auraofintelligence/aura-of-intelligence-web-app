"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type AuraFace = "I" | "O";

export type AuraCellSelection = {
  shell: number;
  row: number;
  column: number;
  cell: number;
  face: AuraFace;
};

export type AuraGeometryProps = {
  activeShell: number;
  face: AuraFace;
  selected?: AuraCellSelection | null;
  onSelect?: (selection: AuraCellSelection) => void;
  compact?: boolean;
  className?: string;
};

export const AURA_SHELLS = [
  { code: "R", name: "Red", colour: "#f04458", scale: 0.46 },
  { code: "O", name: "Orange", colour: "#ff8638", scale: 0.55 },
  { code: "Y", name: "Yellow", colour: "#f7c94a", scale: 0.64 },
  { code: "G", name: "Green", colour: "#3fca8c", scale: 0.73 },
  { code: "B", name: "Blue", colour: "#4298ef", scale: 0.82 },
  { code: "I", name: "Indigo", colour: "#6670ef", scale: 0.91 },
  { code: "V", name: "Violet", colour: "#ad62e8", scale: 1 },
] as const;

const ROWS = 12;
const COLUMNS = 24;
const TAU = Math.PI * 2;

type Point3 = { x: number; y: number; z: number };
type Point2 = { x: number; y: number };
type Rotation = { yaw: number; pitch: number };
type Viewport = { width: number; height: number; dpr: number };

type HitCell = {
  polygon: [Point2, Point2, Point2, Point2];
  centre: Point2;
  depth: number;
  selection: AuraCellSelection;
};

type RenderCell = HitCell & {
  colour: string;
  isActive: boolean;
  isSelected: boolean;
  normalZ: number;
};

type PointerGesture = {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  moved: boolean;
};

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normaliseShell(shell: number) {
  if (!Number.isFinite(shell)) return 0;
  return clamp(Math.round(shell), 0, AURA_SHELLS.length - 1);
}

function hornTorusPoint(radius: number, sweep: number, crossSection: number): Point3 {
  // A horn torus has equal major and minor radii. At crossSection = PI,
  // every sweep angle resolves to the same absolute zero point (0, 0, 0).
  const distanceFromAxis = radius + radius * Math.cos(crossSection);

  return {
    x: distanceFromAxis * Math.cos(sweep),
    y: radius * Math.sin(crossSection),
    z: distanceFromAxis * Math.sin(sweep),
  };
}

function torusNormal(sweep: number, crossSection: number): Point3 {
  return {
    x: Math.cos(crossSection) * Math.cos(sweep),
    y: Math.sin(crossSection),
    z: Math.cos(crossSection) * Math.sin(sweep),
  };
}

function rotatePoint(point: Point3, rotation: Rotation): Point3 {
  const cosYaw = Math.cos(rotation.yaw);
  const sinYaw = Math.sin(rotation.yaw);
  const cosPitch = Math.cos(rotation.pitch);
  const sinPitch = Math.sin(rotation.pitch);
  const yawX = point.x * cosYaw + point.z * sinYaw;
  const yawZ = -point.x * sinYaw + point.z * cosYaw;

  return {
    x: yawX,
    y: point.y * cosPitch - yawZ * sinPitch,
    z: point.y * sinPitch + yawZ * cosPitch,
  };
}

function projectPoint(
  point: Point3,
  rotation: Rotation,
  width: number,
  height: number,
  compact: boolean,
) {
  const rotated = rotatePoint(point, rotation);
  const cameraDistance = 5.1;
  const perspective = cameraDistance / (cameraDistance - rotated.z);
  const unit = Math.min(width, height) * (compact ? 0.228 : 0.222);

  return {
    point: {
      x: width / 2 + rotated.x * unit * perspective,
      y: height / 2 - rotated.y * unit * perspective,
    },
    depth: rotated.z,
  };
}

function rgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${clamp(alpha, 0, 1)})`;
}

function tracePolygon(
  context: CanvasRenderingContext2D,
  polygon: [Point2, Point2, Point2, Point2],
) {
  context.beginPath();
  context.moveTo(polygon[0].x, polygon[0].y);
  context.lineTo(polygon[1].x, polygon[1].y);
  context.lineTo(polygon[2].x, polygon[2].y);
  context.lineTo(polygon[3].x, polygon[3].y);
  context.closePath();
}

function pointInsidePolygon(point: Point2, polygon: readonly Point2[]) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const crosses =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y || Number.EPSILON) +
          currentPoint.x;

    if (crosses) inside = !inside;
  }

  return inside;
}

function sameSelection(
  selection: AuraCellSelection | null | undefined,
  candidate: AuraCellSelection,
) {
  return (
    selection?.shell === candidate.shell &&
    selection.row === candidate.row &&
    selection.column === candidate.column &&
    selection.face === candidate.face
  );
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

export function AuraGeometry({
  activeShell,
  face,
  selected = null,
  onSelect,
  compact = false,
  className = "",
}: AuraGeometryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitCellsRef = useRef<HitCell[]>([]);
  const pointerRef = useRef<PointerGesture | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const statusId = useId();
  const reducedMotion = usePrefersReducedMotion();
  const shellIndex = normaliseShell(activeShell);
  const shell = AURA_SHELLS[shellIndex];
  const [rotation, setRotation] = useState<Rotation>({ yaw: -0.5, pitch: -0.52 });
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0, dpr: 1 });
  const [dragging, setDragging] = useState(false);

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current !== null) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  useEffect(() => stopInertia, [stopInertia]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const measure = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const dprCap = compact ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

      setViewport((current) =>
        current.width === width && current.height === height && current.dpr === dpr
          ? current
          : { width, height, dpr },
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [compact]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewport.width <= 1 || viewport.height <= 1) return;

    const backingWidth = Math.round(viewport.width * viewport.dpr);
    const backingHeight = Math.round(viewport.height * viewport.dpr);
    if (canvas.width !== backingWidth) canvas.width = backingWidth;
    if (canvas.height !== backingHeight) canvas.height = backingHeight;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    context.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
    context.clearRect(0, 0, viewport.width, viewport.height);
    context.lineJoin = "round";
    context.lineCap = "round";

    const renderedCells: RenderCell[] = [];

    AURA_SHELLS.forEach((currentShell, currentShellIndex) => {
      for (let row = 0; row < ROWS; row += 1) {
        const crossStart = (row / ROWS) * TAU;
        const crossEnd = ((row + 1) / ROWS) * TAU;
        const crossMiddle = (crossStart + crossEnd) / 2;

        for (let column = 0; column < COLUMNS; column += 1) {
          const sweepStart = (column / COLUMNS) * TAU;
          const sweepEnd = ((column + 1) / COLUMNS) * TAU;
          const sweepMiddle = (sweepStart + sweepEnd) / 2;
          const vertices = [
            hornTorusPoint(currentShell.scale, sweepStart, crossStart),
            hornTorusPoint(currentShell.scale, sweepEnd, crossStart),
            hornTorusPoint(currentShell.scale, sweepEnd, crossEnd),
            hornTorusPoint(currentShell.scale, sweepStart, crossEnd),
          ] as const;
          const projected = vertices.map((vertex) =>
            projectPoint(vertex, rotation, viewport.width, viewport.height, compact),
          );
          const normal = rotatePoint(torusNormal(sweepMiddle, crossMiddle), rotation);
          const belongsToFace = face === "O" ? normal.z > -0.14 : normal.z < 0.14;

          if (!belongsToFace) continue;

          const polygon: [Point2, Point2, Point2, Point2] = [
            projected[0].point,
            projected[1].point,
            projected[2].point,
            projected[3].point,
          ];
          const selection: AuraCellSelection = {
            shell: currentShellIndex,
            row,
            column,
            cell: row * COLUMNS + column + 1,
            face,
          };
          const centre = polygon.reduce(
            (sum, point) => ({ x: sum.x + point.x / 4, y: sum.y + point.y / 4 }),
            { x: 0, y: 0 },
          );

          renderedCells.push({
            polygon,
            centre,
            depth: projected.reduce((sum, vertex) => sum + vertex.depth / 4, 0),
            selection,
            colour: currentShell.colour,
            isActive: currentShellIndex === shellIndex,
            isSelected: sameSelection(selected, selection),
            normalZ: normal.z,
          });
        }
      }
    });

    renderedCells.sort((left, right) => left.depth - right.depth);

    for (const cell of renderedCells) {
      const facingLight = clamp(Math.abs(cell.normalZ), 0, 1);
      const activeFill = face === "I" ? 0.072 : 0.088;
      const fillAlpha = cell.isActive
        ? activeFill + facingLight * 0.055
        : 0.007 + facingLight * 0.008;
      const strokeAlpha = cell.isActive
        ? 0.22 + facingLight * 0.22
        : 0.045 + facingLight * 0.045;

      tracePolygon(context, cell.polygon);
      context.fillStyle = rgba(cell.colour, fillAlpha);
      context.fill();
      context.strokeStyle = rgba(cell.colour, strokeAlpha);
      context.lineWidth = cell.isActive ? 0.78 : 0.42;
      context.stroke();
    }

    const selectedCell = renderedCells.find((cell) => cell.isSelected);
    if (selectedCell) {
      tracePolygon(context, selectedCell.polygon);
      context.save();
      context.shadowBlur = compact ? 10 : 16;
      context.shadowColor = selectedCell.colour;
      context.fillStyle = rgba(selectedCell.colour, 0.62);
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = "rgba(255, 255, 255, 0.94)";
      context.lineWidth = compact ? 1.4 : 1.8;
      context.stroke();
      context.restore();
    }

    const zero = projectPoint(
      { x: 0, y: 0, z: 0 },
      rotation,
      viewport.width,
      viewport.height,
      compact,
    ).point;
    const glowRadius = compact ? 17 : 23;
    const zeroGlow = context.createRadialGradient(
      zero.x,
      zero.y,
      0,
      zero.x,
      zero.y,
      glowRadius,
    );
    zeroGlow.addColorStop(0, "rgba(255, 255, 255, 0.92)");
    zeroGlow.addColorStop(0.14, rgba(shell.colour, 0.66));
    zeroGlow.addColorStop(1, rgba(shell.colour, 0));
    context.fillStyle = zeroGlow;
    context.beginPath();
    context.arc(zero.x, zero.y, glowRadius, 0, TAU);
    context.fill();
    context.fillStyle = "rgba(255, 255, 255, 0.94)";
    context.beginPath();
    context.arc(zero.x, zero.y, compact ? 1.6 : 2.1, 0, TAU);
    context.fill();

    hitCellsRef.current = renderedCells
      .filter((cell) => cell.isActive)
      .sort((left, right) => right.depth - left.depth)
      .map(({ polygon, centre, depth, selection }) => ({ polygon, centre, depth, selection }));
  }, [compact, face, rotation, selected, shell, shellIndex, viewport]);

  const resolveSelection = useCallback(
    (point: Point2) => {
      const directHit = hitCellsRef.current.find((cell) =>
        pointInsidePolygon(point, cell.polygon),
      );
      if (directHit) return directHit.selection;

      const nearest = hitCellsRef.current.reduce<
        { distance: number; selection: AuraCellSelection } | undefined
      >((closest, cell) => {
        const distance = Math.hypot(point.x - cell.centre.x, point.y - cell.centre.y);
        return !closest || distance < closest.distance
          ? { distance, selection: cell.selection }
          : closest;
      }, undefined);
      const tolerance = Math.max(22, Math.min(viewport.width, viewport.height) * 0.055);

      return nearest && nearest.distance <= tolerance ? nearest.selection : null;
    },
    [viewport.height, viewport.width],
  );

  const startInertia = useCallback(
    (velocityX: number, velocityY: number) => {
      stopInertia();
      if (reducedMotion || Math.hypot(velocityX, velocityY) < 0.012) return;

      let xVelocity = clamp(velocityX, -0.055, 0.055);
      let yVelocity = clamp(velocityY, -0.055, 0.055);

      const step = () => {
        xVelocity *= 0.9;
        yVelocity *= 0.9;

        if (Math.hypot(xVelocity, yVelocity) < 0.001) {
          inertiaFrameRef.current = null;
          return;
        }

        setRotation((current) => ({
          yaw: current.yaw + xVelocity,
          pitch: clamp(current.pitch + yVelocity, -1.35, 1.35),
        }));
        inertiaFrameRef.current = window.requestAnimationFrame(step);
      };

      inertiaFrameRef.current = window.requestAnimationFrame(step);
    },
    [reducedMotion, stopInertia],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (event.button !== 0 || !event.isPrimary) return;
      stopInertia();
      event.currentTarget.setPointerCapture(event.pointerId);
      pointerRef.current = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: event.timeStamp,
        velocityX: 0,
        velocityY: 0,
        moved: false,
      };
      setDragging(true);
    },
    [stopInertia],
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const gesture = pointerRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;

    const deltaX = event.clientX - gesture.lastX;
    const deltaY = event.clientY - gesture.lastY;
    const elapsed = Math.max(8, event.timeStamp - gesture.lastTime);
    const travelled = Math.hypot(
      event.clientX - gesture.startX,
      event.clientY - gesture.startY,
    );
    const sensitivity = 0.009;

    gesture.moved ||= travelled > 7;
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    gesture.lastTime = event.timeStamp;
    gesture.velocityX = (deltaX * sensitivity * 16) / elapsed;
    gesture.velocityY = (deltaY * sensitivity * 16) / elapsed;

    setRotation((current) => ({
      yaw: current.yaw + deltaX * sensitivity,
      pitch: clamp(current.pitch + deltaY * sensitivity, -1.35, 1.35),
    }));
  }, []);

  const finishPointer = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>, cancelled = false) => {
      const gesture = pointerRef.current;
      if (!gesture || gesture.id !== event.pointerId) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      pointerRef.current = null;
      setDragging(false);

      if (!cancelled && !gesture.moved) {
        const bounds = event.currentTarget.getBoundingClientRect();
        const selection = resolveSelection({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
        if (selection) onSelect?.(selection);
        return;
      }

      if (!cancelled) startInertia(gesture.velocityX, gesture.velocityY);
    },
    [onSelect, resolveSelection, startInertia],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
      const rotationStep = event.shiftKey ? 0.22 : 0.1;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        stopInertia();
        setRotation((current) => ({
          ...current,
          yaw: current.yaw + (event.key === "ArrowLeft" ? -rotationStep : rotationStep),
        }));
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        stopInertia();
        setRotation((current) => ({
          ...current,
          pitch: clamp(
            current.pitch + (event.key === "ArrowUp" ? -rotationStep : rotationStep),
            -1.35,
            1.35,
          ),
        }));
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        stopInertia();
        setRotation({ yaw: -0.5, pitch: -0.52 });
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const selection = resolveSelection({ x: viewport.width / 2, y: viewport.height / 2 });
        if (selection) onSelect?.(selection);
      }
    },
    [onSelect, resolveSelection, stopInertia, viewport.height, viewport.width],
  );

  const faceDescription =
    face === "O"
      ? "O exterior observer view of permissioned data"
      : "I interior personal view of personal data";
  const selectedDescription = useMemo(() => {
    if (!selected) return "No DataCell selected.";
    const selectedShell = AURA_SHELLS[normaliseShell(selected.shell)];
    return `${selectedShell.name} ${selected.face} DataCell ${selected.cell}, row ${selected.row + 1}, column ${selected.column + 1} selected.`;
  }, [selected]);
  const classes = [
    "aura-geometry",
    compact && "aura-geometry--compact",
    dragging && "aura-geometry--dragging",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      data-face={face}
      data-shell={shell.code}
      data-dragging={dragging || undefined}
      style={{
        position: "relative",
        width: "100%",
        minHeight: compact ? 184 : 280,
        height: compact ? 220 : "min(62svh, 520px)",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        className="aura-geometry__canvas"
        aria-describedby={statusId}
        aria-label={`Interactive Aura horn-torus map. ${shell.name} ${shell.code} shell active. ${faceDescription}. Twelve by twenty-four address lattice. Drag to rotate; use arrow keys to rotate, Enter to choose a DataCell, and Home to reset the view.`}
        role="img"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerCancel={(event) => finishPointer(event, true)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishPointer(event)}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        Interactive Aura geometry needs a browser with canvas support.
      </canvas>
      <span id={statusId} className="aura-geometry__status" aria-live="polite" style={visuallyHidden}>
        {selectedDescription}
      </span>
    </div>
  );
}

export default AuraGeometry;
