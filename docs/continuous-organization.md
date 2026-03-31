# Continuous Organization Playbook

This is the canonical guide for continuous project organization.

Use this document when you explicitly decide it is time to run an organization cycle.

## Objective

Keep the codebase modular, predictable, and easy for AI and humans to evolve. The priority is to improve AI execution efficiency by reducing duplication, clarifying ownership, and centralizing repeated logic.

## How To Use This Guide

1. Start an organization cycle only when you explicitly trigger it.
2. Open this document and define the cycle scope.
3. Run the pre-change checklist.
4. Choose one or more small modularization slices in the selected scope.
5. Execute changes with route behavior preserved.
6. Run verification.
7. Record what was modularized and what was deferred.

## Trigger Commands

Use short command-style prompts when you want to start an organization cycle. These are not shell commands. They are stable prompt conventions I should interpret as organization triggers.

### Recommended Short Forms

- `/organize` starts a quick cycle with default assumptions.
- `/organize quick` starts a quick cycle and prioritizes one small modularization slice.
- `/organize full` starts a full cycle and expects a defined scope, goal, and constraints.
- `#organize` is equivalent to `/organize`.
- `#organize quick` is equivalent to `/organize quick`.
- `#organize full` is equivalent to `/organize full`.

### Quick Cycle Format

```md
/organize quick
Scope: data entry flow
Budget: 60m
Priority: immediate
```

If fields are omitted, default behavior is:

- choose one small, safe modularization slice
- preserve route behavior
- run the standard verification protocol
- report modularized and deferred items

### Full Cycle Format

```md
/organize full
Scope: Collection point detail page
Goal: reduce duplication and isolate domain logic
Budget: 120m
Constraints: no route behavior change, no mobile regressions
Priority: near-term
Verification focus: mobile layouts and organize checks
```

If fields are omitted, default behavior is:

- `Budget: 90m`
- `Constraints: preserve behavior and mobile-first constraints`
- `Priority: highest unresolved backlog item in this document`

## Definition Of Organized

A change is considered organized when all conditions below are true:

- no route or user flow regression
- AI can find authoritative logic quickly (single source of truth for repeated transforms/rules)
- repeated logic moved to shared modules when safe
- page-level orchestration kept in pages, reusable logic moved to `src/lib` or hooks
- domain-aware components do not leak into generic `src/components/ui`
- mobile-first constraints verified
- docs updated when architectural boundaries or process changed

## Per-Cycle Organization Budget

Every triggered cycle must include at least one explicit organization action:

- deduplicate logic
- extract a focused component
- extract a pure helper
- simplify a page by moving domain logic into shared modules
- remove dead or obsolete code

Target size: 30 to 180 minutes per cycle, based on the selected scope.

## Pre-Change Checklist

- [ ] Confirm the cycle trigger and selected scope.
- [ ] Confirm affected routes and behaviors.
- [ ] Identify duplication or coupling in touched files.
- [ ] Check current boundaries in `docs/architecture.md`.
- [ ] Check smartphone constraints in `docs/mobile-first.md`.

## Implementation Rules

1. Preserve external behavior first.
2. Extract one concern at a time.
3. Keep public APIs stable unless change is required.
4. Avoid mixing unrelated refactors in the same commit.
5. Prefer shared pure functions for repeated data transforms.
6. Keep commit narrative aligned with `docs/commit.md`.

## Current Modularization Backlog

### Completed

- ✓ Consolidated record form coordination via shared `useRecordForm` hook in DataEntryPage and RecordDetailPage.
- ✓ Extracted reusable form field components into `src/components/records/RecordFormFields.tsx` (SpeciesField, IdentificationToggle/Select, EnvironmentField, StratumField, ActivityField, QuantityStepper, DistanceStepper, SideGrid/Select, ObservationsField) to eliminate duplicated field JSX between pages.
- ✓ Extracted `MackinnonLimitField` into `src/components/collection-points/MackinnonLimitField.tsx` — eliminates duplicated quick-select buttons + Input block shared by CollectionPointPage and CollectionPointDetailPage.
- ✓ Extracted `ViewField` read-only field display component into `src/components/records/RecordFormFields.tsx` — eliminates duplicated local helper in RecordDetailPage and provides canonical representation for displaying observation field-value pairs in grid layouts.
- ✓ Extracted `RecordsListCard` into `src/components/records/RecordsListCard.tsx` — eliminates duplicated record list card structure (title, metadata, empty state, listing) shared by DataEntryPage and CollectionPointDetailPage; supports flexible icon and subtitle for page-specific context.
- ✓ Decomposed `CollectionPointDetailPage` into domain components: `CollectionPointMetadataCard` (view-mode display), `CollectionPointEditForm` (edit-mode form) — reduces page complexity from ~500 to 359 lines; maintains state orchestration and routing in page layer per architecture pattern.
- ✓ Extracted dashboard chart section components: `BarChartSection` (time series), `PieChartWithLegend` (pie with legend), `HBarChartSection` (horizontal bar listings) — reduces DashboardPage from 302 to 133 lines (56% reduction); consolidates 4 HBar patterns and 2 Pie patterns into reusable sections.

- ✓ Decomposed `RecordDetailPage` into display components: `RecordViewCard` (view-mode record display with species, data grid, observations, group accent bar), `RecordFormCard` (edit-mode form fields) — reduces page complexity from ~390 to ~220 lines (44% reduction); eliminates inline card markup duplication; maintains edit/view mode toggling at page level.

### Immediate
### Near-Term
- Further decompose pages (DataEntryPage, RecordDetailPage pagination/layout patterns)
- Extract shared card layout and KPI display patterns
### Near-Term
- Further decompose DataEntryPage: extract record form card container pattern (similar to RecordFormCard)
- Extract KPI card and metadata display patterns (StatCard, section title arrangements)

### Later

- Extract dashboard/chart section composition boundaries.
- Reduce repeated card/list view fragments into domain-level shared components.

## Verification Protocol (Every Triggered Cycle)

Run locally during the cycle:

1. `npm run organize:check`
2. `npm run build`

Then perform manual checks:

- [ ] Mobile viewports verified at 360x800 and 390x844.
- [ ] No horizontal scroll in primary flows.
- [ ] Keyboard interaction for bottom inputs still usable.
- [ ] Main task path remains <= 3 interactions from entry page.

## PR Description Template Addendum

Include this section in PRs that contain organization-cycle changes:

```md
### Organization Delta
- Modularized:
- Deferred:
- Reason for defer:

### Mobile Check
- Viewports tested:
- Notes:
```

## Cycle Recalibration

Run this whenever you trigger a cycle and priorities changed:

1. Reorder backlog priorities based on active pain points.
2. Remove completed items.
3. Add newly discovered hotspots.
4. Tighten or relax organization budget only if needed.

## Cross-References

- `docs/architecture.md`
- `docs/mobile-first.md`
- `docs/commit.md`
- `README.md`
