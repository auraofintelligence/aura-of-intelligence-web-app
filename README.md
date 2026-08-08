# Aura of Intelligence Web App

A smartphone-first web application reconstructed from Luke Nathan Hayes's original Aura of Intelligence wireframes, interface screenshots, workbooks, pitch material and current Aura source sites.

This repository is the working interface, not a claim that Aura is already a finished or installable native mobile app.

## Current checkpoint

- Adds a real device-local LifeLogging input using the source workbook's Participant Declarations field spine.
- Preserves the complete 383-node `Aura App Page List` hierarchy, including the correct column-based `Timing & Signals` taxonomy.
- Keeps Interior (Personal), Exterior (Observer) and expressly Public concepts distinct; this prototype does not publish or grant access.
- Lets a person revisit a record as a new point in time and keeps the original record.
- Retains the interactive seven-shell horn-torus Matrix and prevents Interior records being placed on an Exterior face, or vice versa.
- Leaves object-specific forms—such as counters, reminders, lists and avatar capture—to be reconstructed from their own source screens rather than inventing one universal form.

## Product boundaries

- The supplied Aura source material remains the product specification.
- The interface preserves Aura's terminology, hierarchy and relationships while using current mobile interaction patterns.
- The horn-torus Matrix contains seven ROYGBIV shells, each with a 12 × 24 address lattice and separate Interior/Personal (`I`) and Exterior/Observer (`O`) faces.
- Private workbook records and source screenshots are not included in the public interface.
- Prototype controls do not claim production encryption, publishing, camera, ledger or algorithm services.
- Device-local prototype choices are stored only in the browser.

## Licence

The original Aura material is public source, not open source. Personal and other allowed non-commercial uses are described in [LICENCE.md](LICENCE.md); commercial rights remain reserved.

## Local preview

```powershell
npm install
npm run dev
```

Open the local address printed in the terminal.

## Validation

```powershell
npm test
npm run lint
```

The test suite builds the application, checks the rendered Aura interface, verifies all 383 workbook-derived directory nodes, protects the correct Timing hierarchy, and protects the seven-shell 12 × 24 horn-torus model.

## Source map

- `research/extracted/aura-page-tree.json` — exact read-only extraction of the Aura App Page List workbook.
- `research/contact-sheets/` — ignored local visual audit sheets generated from the supplied source pack; these are not published.
- `app/data/declarations.ts` — the source-backed LifeLogging record spine used at this checkpoint.
- `app/data/page-tree.ts` — runtime access to the exact extracted hierarchy.
- `app/components/aura-geometry.tsx` — original interactive horn-torus implementation.
