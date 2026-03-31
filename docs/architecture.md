# Architecture Overview

Fauna Data is a local-first React PWA for wildlife field collection. The app is intentionally client-only: records and collection points live in IndexedDB through Dexie, React Router handles navigation, and the feature flow is optimized for mobile data entry in the field.

## Reading Order

If you are new to the codebase, read these files in order:

1. `src/App.tsx` for the route map and top-level composition.
2. `src/lib/types.ts` for the domain model and shared metadata.
3. `src/lib/db.ts` for persistence shape.
4. `src/hooks/useCollectionPoints.ts` and `src/hooks/useRecords.ts` for reactive CRUD access.
5. `src/pages/` for feature flow.
6. `docs/mobile-first.md` for non-negotiable smartphone UX and layout constraints.

## Project Layers

### 1. App Shell

- `src/App.tsx`
- wires routes, global toast container, and install prompt

### 2. Domain Model

- `src/lib/types.ts`
- owns fauna groups, methodologies, observation fields, and shared option metadata

### 3. Persistence

- `src/lib/db.ts`
- defines the Dexie database and tables for `collectionPoints` and `records`

### 4. Shared Logic

- `src/hooks/useCollectionPoints.ts`
- `src/hooks/useRecords.ts`
- `src/hooks/useStatistics.ts`
- `src/hooks/useExport.ts`
- `src/hooks/useSpeciesCatalog.ts`
- `src/hooks/useRecordForm.ts`
- `src/lib/recordFilters.ts`
- `src/lib/recordForm.ts`
- `src/lib/speciesCatalog.ts`
- `src/lib/format.ts`
- `src/lib/id.ts`

Hooks should wrap React state, persistence, or browser APIs. Pure transformations should live in `src/lib` so they are easier to reuse and test.

`src/hooks/useRecordForm.ts` owns reusable record-form state coordination, while `src/lib/recordForm.ts` remains the pure source of truth for validation and observation-data mapping.

### 5. Presentation

- `src/components/ui/`
- `src/components/shared/`
- `src/components/dashboard/`
- `src/components/records/`
- `src/components/collection-points/`
- `src/pages/`

`src/components/ui/` is reserved for generic primitives. Domain-aware or workflow-aware pieces should live outside that folder, even if they are reused across pages.

Species autocomplete is domain-aware and lives in:

- `src/components/records/SpeciesAutocompleteInput.tsx`

Record form fields (species, identification, environment, stratum, activity, quantity, distance, side, observations) are provided as reusable field components in:

- `src/components/records/RecordFormFields.tsx`

Each field component accepts form value, error state, and onChange handlers, allowing pages to use different input styles (e.g., toggle buttons vs dropdowns) while sharing label, error display, and validation presentation. Both `DataEntryPage` and `RecordDetailPage` compose these fields into their respective forms.

Its data source is a CSV file served statically from:

- `public/data/species-catalog-birds.csv`

## Route Responsibilities

- `/` -> home and primary navigation
- `/methodologies/:group` -> methodology selection
- `/collection-point/:group/:methodology` -> collection point creation
- `/collection-points` -> point browsing
- `/collection-point/:pointId` -> point detail and editing
- `/data-entry/:group/:methodology/:pointId` -> observation capture
- `/records` -> record browsing
- `/records/:recordId` -> record detail and editing
- `/dashboard` -> analytics summaries
- `/export` -> CSV export

## Data Flow

1. A user chooses a fauna group and methodology.
2. The app creates a collection point, optionally with geolocation.
3. One or more fauna records are captured for that point.
4. Hooks expose reactive data from IndexedDB to pages.
5. Statistics and export derive their data from the same stored records.

## Current Boundary Rules

1. Keep routes and behavior stable during structural refactors.
2. Pages should orchestrate data fetching, navigation, and view state.
3. Repeated JSX blocks should move into named components.
4. Duplicated filtering, validation, formatting, and ID logic should live in shared modules.
5. Generic UI primitives should not absorb domain-specific rules unless wrapped intentionally.

## Non-Functional Constraint

This project is smartphone-first by definition. New features must comply with:

- `docs/mobile-first.md`

## Continuous Organization Workflow

Structural improvements are continuous and should be executed when an organization cycle is explicitly triggered using:

- `docs/continuous-organization.md`