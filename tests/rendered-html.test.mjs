import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function countNodes(node) {
  return 1 + (node.children ?? []).reduce((total, child) => total + countNodes(child), 0);
}

test("server-renders Aura rather than the temporary starter", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Aura of Intelligence .* A Bridge to The Infinite<\/title>/i);
  assert.match(html, /Declare yourself, across time\./i);
  assert.match(html, /Make a declaration/i);
  assert.match(html, /Open exact page tree/i);
  assert.match(html, /Matrix Programmer/i);
  assert.match(html, /Mind Palace Creator/i);
  assert.doesNotMatch(html, /codex-preview|Building your site|Your site is taking shape/i);
});

test("keeps the workbook-derived directory complete and exact", async () => {
  const source = JSON.parse(await readFile(new URL("research/extracted/aura-page-tree.json", root), "utf8"));
  assert.equal(source.source.nonEmptyNavigationCells, 383);
  assert.equal(countNodes(source.navigationTree), 383);
  assert.equal(source.navigationTree.label, "Home");

  const labels = [];
  const collect = (node) => {
    labels.push(node.label);
    (node.children ?? []).forEach(collect);
  };
  collect(source.navigationTree);

  for (const required of [
    "Aura Menu",
    "Matrix Programmer",
    "Avatar Creator",
    "Mind Palace Creator",
    "GAJRA.Earth",
    "The Aura Affinity Marketplace",
    "Multi-Stop Journey Planner",
    "Measuring Tool",
  ]) {
    assert.ok(labels.includes(required), `missing source label: ${required}`);
  }

  const findByLabel = (node, label) => {
    if (node.label === label) return node;
    for (const child of node.children ?? []) {
      const found = findByLabel(child, label);
      if (found) return found;
    }
    return null;
  };
  const timing = findByLabel(source.navigationTree, "Timing & Signals");
  assert.deepEqual(timing.children.map((child) => child.label), [
    "Birthdays",
    "Milestones",
    "Counters",
    "Schedules",
    "Reminders",
    "Ceremonies",
    "Celestial",
    "Learning",
    "Work",
    "Weather",
    "Community",
    "Other",
  ]);
  assert.deepEqual(timing.children[0].children.map((child) => child.label), [
    "Birthday Reminders",
    "Age Calculator",
    "Zodiac Signs",
    "Birthday Countdown",
    "Gift Ideas",
    "Party Planning",
    "Astrological Insights",
  ]);
});

test("preserves the seven-shell, 12 by 24 horn-torus address model", async () => {
  const geometry = await readFile(new URL("app/components/aura-geometry.tsx", root), "utf8");
  assert.match(geometry, /const ROWS = 12;/);
  assert.match(geometry, /const COLUMNS = 24;/);
  assert.match(geometry, /function hornTorusPoint/);
  assert.match(geometry, /const distanceFromAxis = radius \+ radius \* Math\.cos\(crossSection\);/);

  const shellBlock = geometry.match(/export const AURA_SHELLS = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  assert.equal((shellBlock.match(/\{ code:/g) ?? []).length, 7);
});
