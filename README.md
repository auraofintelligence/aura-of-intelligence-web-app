# Aura of Intelligence Web App

<!-- github-organisation:start -->

## Project links and history

- First substantive build: 8 August 2026.
- GitHub repository: [aura-of-intelligence-web-app](https://github.com/auraofintelligence/aura-of-intelligence-web-app).
- Public site: no verified project destination was found at the audit date.

## Related public projects

Each link below reflects an evidenced family, lineage or direct connection. This project has 7 relevant public connections.

### Aura interface, geometry and capture architecture

- [aura-components](https://github.com/auraofintelligence/aura-components) - [public page](https://auraofintelligence.github.io/aura-components/) - shared technical architecture.
- [aura-data-mapping](https://github.com/auraofintelligence/aura-data-mapping) - [public page](https://auraofintelligence.github.io/aura-data-mapping/) - shared technical architecture.
- [aura-horn-torus](https://github.com/auraofintelligence/aura-horn-torus) - [public page](https://auraofintelligence.github.io/aura-horn-torus/) - explicit cross-reference, shared technical architecture.
- [aura-scan-pipeline](https://github.com/auraofintelligence/aura-scan-pipeline) - [public page](https://auraofintelligence.github.io/aura-scan-pipeline/) - shared technical architecture.
- [aura-spatial-perception](https://github.com/auraofintelligence/aura-spatial-perception) - [public page](https://auraofintelligence.github.io/aura-spatial-perception/) - explicit cross-reference, shared technical architecture.
- [aura-toy](https://github.com/auraofintelligence/aura-toy) - [public page](https://auraofintelligence.github.io/aura-toy/) - shared technical architecture.
- [new-tori](https://github.com/auraofintelligence/new-tori) - [public page](https://auraofintelligence.github.io/new-tori/) - shared technical architecture.

<!-- github-organisation:end -->

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
