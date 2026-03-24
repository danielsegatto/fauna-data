# Fauna Data

Fauna Data is a mobile-first Progressive Web App for field collection, organization, review, analysis, and export of wildlife monitoring data.

The project is designed for real fieldwork conditions:

- offline-first usage after the first load
- local persistence on the device through IndexedDB
- fast data entry on mobile screens
- support for collection points with optional GPS capture
- analytical summaries directly inside the app
- CSV export for sharing or downstream analysis
- installable experience on Android, iOS, and desktop-compatible browsers

This README is intended to be the complete project reference for both humans and AI systems. It explains what the application does, why each part exists, where each concern lives in the codebase, how data moves through the app, what has already been delivered, and what the current implementation state is.

## Where To Start

For a fast architectural read, start here:

1. `src/App.tsx` for routes and top-level composition
2. `src/lib/types.ts` for the domain model
3. `src/lib/db.ts` for persistence shape
4. `src/hooks/useCollectionPoints.ts` and `src/hooks/useRecords.ts` for reactive data access
5. `docs/architecture.md` for the current module map and refactor boundaries

## 1. Project Purpose

The application supports wildlife monitoring workflows in the field where internet access may be unreliable or unavailable. Instead of depending on a backend service, Fauna Data stores operational data locally in the browser using IndexedDB via Dexie.

The main use case is:

1. select a fauna group
2. select a methodology
3. create a collection point
4. optionally capture GPS coordinates
5. enter one or more fauna observation records linked to that point
6. review and edit saved records later
7. inspect aggregated statistics in a dashboard
8. export filtered records to CSV

The app currently covers three fauna groups:

- Birds
- Mammals
- Herpetofauna

The app is intentionally local-first. There is no remote API, no authentication layer, and no cloud synchronization in the current version.

## 2. Current Status

The project is functionally complete for the originally planned local PWA scope. The currently implemented application already includes:

- route-based navigation for the full workflow
- local database schema for collection points and records
- reusable UI primitives for mobile-first interaction
- methodology selection by fauna group
- collection point creation with optional notes and GPS capture
- repeated data entry for observations at a collection point
- saved records listing with filtering and deletion
- record detail screen with in-place editing
- collection point listing and detail screen with editing
- analytics dashboard with charts and summary metrics
- CSV export with filters by group, point, and date range
- install prompt support for PWA installation
- offline-capable packaging via Vite PWA

What the app does not currently include:

- remote sync
- multi-user support
- login/authentication
- automated tests
- server-side storage
- import from CSV or other formats
- record attachments such as photos or audio

## 3. Technology Stack

Runtime and framework:

- React 18
- TypeScript
- React Router v6
- Vite

Persistence:

- IndexedDB through Dexie
- dexie-react-hooks for reactive queries

Styling and UI:

- Tailwind CSS
- custom design tokens in src/lib/theme.ts
- lucide-react for icons

Analytics and export:

- Recharts for dashboard visualizations
- browser Blob download for CSV generation
- PapaParse is installed as a dependency, although the current export implementation builds CSV manually in src/hooks/useExport.ts

PWA:

- vite-plugin-pwa
- manifest generated in vite.config.ts
- standalone display mode
- basic runtime caching for Google Fonts

## 4. Product Characteristics

### 4.1 Offline-First Behavior

The application stores operational data entirely on the client using IndexedDB. This means:

- collection points persist locally in the browser/device
- observation records persist locally in the browser/device
- the app can continue functioning offline after the PWA assets are cached
- data is tied to the browser storage of the device where it was created

Important implication:

- if the browser storage is cleared or the user changes device/browser, the local data does not automatically move with them

### 4.2 Mobile-First Interface

The UI is built primarily for mobile usage:

- full-height layout using min-height with dynamic viewport units
- sticky headers
- fixed bottom action areas for primary actions
- large tap targets
- compact but structured cards for field review
- horizontally scrollable filter tabs

### 4.3 PWA Installation

The app supports installation:

- Android/Desktop: uses the beforeinstallprompt event when available
- iOS: shows manual instructions for Add to Home Screen

The installation UI is handled by:

- src/hooks/useInstallPrompt.ts
- src/components/ui/InstallPrompt.tsx

## 5. Functional Scope

### 5.1 Supported Fauna Groups

Defined in src/lib/types.ts:

- birds
- mammals
- herpetofauna

Human-readable labels are also defined there:

- Aves
- Mamíferos
- Herpetofauna

### 5.2 Supported Methodologies

Methodologies are also defined centrally in src/lib/types.ts, grouped by fauna type.

Birds:

- point-count: fixed point count / listening point
- transect
- mist-net
- mackinnon
- free-observation

Mammals:

- camera-trap
- transect
- track-station
- live-trap

Herpetofauna:

- visual-search
- pitfall
- transect
- acoustic

### 5.3 Record Attributes Captured

Observation records store:

- species
- identification type
- environment
- stratum
- activity
- quantity
- distance
- side
- free-text observations

Those options and related domain constants live in src/lib/types.ts.

## 6. End-to-End User Flow

The actual navigation flow implemented today is:

1. Home page
2. Methodology selection for a fauna group
3. Collection point creation for the selected group and methodology
4. Optional GPS capture on the collection point screen
5. Data entry screen for repeated observation registration
6. Optional navigation back to the collection point detail
7. Review through records list, record detail, collection point list, collection point detail, dashboard, or export

Secondary access flows:

- Home -> Dashboard
- Home -> Collection Points List
- Home -> Records List
- Records List -> Record Detail
- Collection Points List -> Collection Point Detail -> Add Record
- Records List -> Export

## 7. Routing Map

All routes are declared in src/App.tsx.

Implemented routes:

- / -> HomePage
- /methodologies/:group -> MethodologiesPage
- /collection-point/:group/:methodology -> CollectionPointPage
- /collection-points -> CollectionPointsListPage
- /collection-point/:pointId -> CollectionPointDetailPage
- /data-entry/:group/:methodology/:pointId -> DataEntryPage
- /records -> RecordsListPage
- /records/:recordId -> RecordDetailPage
- /dashboard -> DashboardPage
- /export -> ExportPage
- * -> redirect to /

Design note:

- the route namespace collection-point is used for both creation and detail, differentiated by parameter shape

## 8. Data Model

The core domain model is defined in src/lib/types.ts.

### 8.1 CollectionPoint

Represents a named monitoring location associated with a fauna group and a methodology.

Fields:

- id: unique string
- name: user-defined point name
- latitude: optional
- longitude: optional
- accuracy: optional GPS accuracy
- createdAt: timestamp in milliseconds
- group: fauna group
- methodology: methodology id
- notes: optional free text

### 8.2 ObservationData

Represents the biological and contextual information of a single observation.

Fields:

- species
- identification
- environment
- stratum
- activity
- quantity
- distance
- side
- observations

### 8.3 FaunaRecord

Represents a stored observation linked to a collection point.

Fields:

- id: unique string
- collectionPointId: foreign-key-like reference to CollectionPoint.id
- group: fauna group
- methodology: methodology id
- timestamp: creation/update timestamp for the saved record instance
- data: ObservationData payload

## 9. Local Database Design

The local database is implemented in src/lib/db.ts using Dexie.

Database name:

- fauna-data

Tables:

- records
- collectionPoints

Indexed fields:

- records: id, group, methodology, collectionPointId, timestamp
- collectionPoints: id, group, methodology, createdAt

Important behavior:

- collection points and records are queried reactively with Dexie live queries
- deleting a collection point does not automatically delete associated records according to the hook documentation
- reads that require reactivity rely on live queries
- certain detail lookups use one-time reads by ID

## 10. Application Architecture

The codebase is intentionally simple and front-end only.

### 10.1 Architectural Layers

1. App shell and routing
2. Pages
3. Reusable UI primitives
4. Hooks for stateful business behavior and persistence
5. Library modules for shared types, theme utilities, and database

### 10.2 Data Flow

Typical write path:

1. page collects user input
2. page validates required data locally
3. page calls a custom hook action such as saveCollectionPoint or saveRecord
4. hook enriches payload with generated id and timestamp when needed
5. hook writes to Dexie
6. live queries refresh dependent views automatically

Typical read path:

1. page calls useRecords or useCollectionPoints
2. hook exposes reactive arrays and helper functions
3. page filters, formats, and renders records or points

### 10.3 ID Generation

IDs are generated in src/lib/theme.ts through a timestamp-plus-random-string strategy.

This is sufficient for the current local-only scope, but it is not a distributed identity strategy for multi-device synchronization.

## 11. Directory Guide

Top-level files:

- index.html: HTML entry, viewport settings, theme color, Google Fonts include, root element
- package.json: scripts and dependencies
- vite.config.ts: Vite config, alias, PWA manifest, Workbox settings
- tailwind.config.js: Tailwind theme extension and token mapping
- postcss.config.js: PostCSS pipeline
- tsconfig.json: TypeScript configuration
- README.md: project reference documentation

Source root:

- src/main.tsx: React bootstrap and BrowserRouter setup
- src/App.tsx: route table and global UI containers
- src/index.css: Tailwind layers and global utility classes

Libraries:

- src/lib/types.ts: domain types, option lists, methodologies, labels
- src/lib/theme.ts: design tokens, utility helpers, date formatting, id generation
- src/lib/db.ts: Dexie database definition

Hooks:

- src/hooks/useCollectionPoints.ts: reactive CRUD and helpers for collection points
- src/hooks/useRecords.ts: reactive CRUD and helpers for fauna records
- src/hooks/useStatistics.ts: analytics aggregation for the dashboard
- src/hooks/useExport.ts: filtering and CSV generation/export
- src/hooks/useGeolocation.ts: browser geolocation capture and error handling
- src/hooks/useInstallPrompt.ts: PWA installation state and prompt control

Pages:

- src/pages/HomePage.tsx: landing screen and navigation hub
- src/pages/MethodologiesPage.tsx: methodology picker by fauna group
- src/pages/CollectionPointPage.tsx: collection point creation with optional GPS
- src/pages/CollectionPointsListPage.tsx: collection point listing with group filters
- src/pages/CollectionPointDetailPage.tsx: collection point detail, edit, and point-linked records
- src/pages/DataEntryPage.tsx: observation entry form for repeated recording
- src/pages/RecordsListPage.tsx: saved records listing, filtering, deletion, export entry point
- src/pages/RecordDetailPage.tsx: record detail and in-place edit mode
- src/pages/DashboardPage.tsx: metrics and charts
- src/pages/ExportPage.tsx: CSV export workflow with filters

UI primitives:

- src/components/ui/Page.tsx: common page shell with header, back navigation, actions, and fixed footer
- src/components/ui/Button.tsx: button primitive
- src/components/ui/Card.tsx: card primitive
- src/components/ui/Input.tsx: text input and textarea primitives
- src/components/ui/Select.tsx: select/dropdown primitive
- src/components/ui/Badge.tsx: status/group badges
- src/components/ui/EmptyState.tsx: reusable empty-state block
- src/components/ui/ConfirmDialog.tsx: destructive confirmation modal
- src/components/ui/Toast.tsx: lightweight toast system
- src/components/ui/InstallPrompt.tsx: floating install CTA and iOS instructions
- src/components/ui/index.ts: barrel exports for shared UI components

## 12. Page-by-Page Behavior

### 12.1 HomePage

Responsibility:

- acts as the main hub of the application
- lets the user choose the fauna group for data collection
- shows total record count when records exist
- provides direct access to dashboard, collection points, and saved records

Key behavior:

- counts records per fauna group on the fly
- navigates to methodology selection for the chosen group

### 12.2 MethodologiesPage

Responsibility:

- shows all methodologies available for the selected fauna group

Key behavior:

- reads group from route params
- resolves methodology metadata from the central definitions in src/lib/types.ts
- navigates to collection point creation for the chosen methodology

### 12.3 CollectionPointPage

Responsibility:

- creates a new collection point before observation entry begins

Key behavior:

- captures point name and optional notes
- optionally captures GPS position and accuracy through browser geolocation
- persists the collection point through useCollectionPoints
- redirects to DataEntryPage after successful save

### 12.4 CollectionPointsListPage

Responsibility:

- lists all saved collection points
- filters points by fauna group
- shows how many records are associated with each point

Key behavior:

- combines collection point data with record counts derived from saved records

### 12.5 CollectionPointDetailPage

Responsibility:

- shows a collection point in detail
- allows editing of point metadata
- provides a quick path to add a new record from that point
- lists records linked to the point

Key behavior:

- supports edit mode with validation
- recalculates available methodologies when the group changes

### 12.6 DataEntryPage

Responsibility:

- captures fauna observation data for a specific collection point

Key behavior:

- validates required fields locally
- saves records through useRecords
- resets the form after a successful save so fieldwork can continue quickly
- keeps a local saved counter for the current session at that point

Validation currently enforced:

- species is required
- identification is required
- environment is required
- quantity is required and must be positive
- distance, when provided, must be zero or positive

### 12.7 RecordsListPage

Responsibility:

- lists all saved records
- filters by fauna group
- allows deletion of an individual record
- provides entry into export

Key behavior:

- resolves collection point names through a map helper
- shows a dense summary of each record in a mobile card layout
- confirms deletion using a dialog

### 12.8 RecordDetailPage

Responsibility:

- shows the full content of a record
- allows in-place editing with validation

Key behavior:

- resolves the linked collection point name asynchronously
- includes unsaved-change protection when leaving edit mode

### 12.9 DashboardPage

Responsibility:

- provides analytical summaries of the saved records

Key behavior:

- supports time ranges: all, 7 days, 30 days
- shows KPI cards
- shows charts for date distribution, identification type, environment distribution
- shows horizontal bars for groups, methodologies, activities, and top species

### 12.10 ExportPage

Responsibility:

- exports filtered data to CSV

Key behavior:

- filters by fauna group
- filters by collection point
- filters by date range
- previews export scope before download
- downloads a UTF-8 BOM CSV for spreadsheet compatibility

## 13. Hooks and Their Purpose

### 13.1 useCollectionPoints

Purpose:

- single source of collection point CRUD behavior

Exposes:

- reactive collectionPoints list
- loading state
- saveCollectionPoint
- updateCollectionPoint
- deleteCollectionPoint
- getCollectionPointById
- filterCollectionPoints
- getCollectionPointMap

### 13.2 useRecords

Purpose:

- single source of record CRUD behavior

Exposes:

- reactive records list
- loading state
- saveRecord
- updateRecord
- deleteRecord
- clearAllRecords
- getRecordById
- filterRecords

### 13.3 useStatistics

Purpose:

- transforms raw saved records into dashboard-friendly aggregate structures

Outputs include:

- total record count
- unique species count
- average quantity
- maximum quantity
- counts by group
- counts by methodology
- counts by identification type
- counts by environment
- counts by activity
- top species
- counts by date

### 13.4 useExport

Purpose:

- centralizes record filtering and CSV generation for export

Behavior:

- filters records using the same export filter state used by ExportPage
- manually escapes CSV values
- generates a filename with timestamp
- triggers browser download with a UTF-8 BOM

### 13.5 useGeolocation

Purpose:

- wraps browser geolocation into a reusable async hook

Behavior:

- requests high-accuracy location
- returns latitude, longitude, and accuracy
- surfaces user-friendly error messages for permission denied, timeout, and unavailable position

### 13.6 useInstallPrompt

Purpose:

- tracks whether installation is available or already completed

Behavior:

- detects iOS devices
- detects standalone mode
- captures beforeinstallprompt for Android/Desktop browsers
- exposes promptInstall for manual triggering

## 14. UI System

The app does not use an external component library. It uses a small internal UI kit built for this project.

Visual characteristics:

- rounded card-heavy layout
- green primary theme aligned with environmental/wildlife context
- light background surfaces
- mobile-sized controls
- fixed bottom action bars for primary actions

Theme source of truth:

- src/lib/theme.ts

Tailwind extension source:

- tailwind.config.js

Notable utilities and patterns:

- cn helper for simple class merging
- date formatting helpers for pt-BR display
- group-based color mapping for fauna categories
- global classes for cards, buttons, inputs, and hidden scrollbars in src/index.css

## 15. PWA and Browser Behavior

PWA configuration is defined in vite.config.ts.

Manifest characteristics:

- name: Fauna Data
- short_name: Fauna Data
- description: wildlife monitoring application
- theme color: #2E7D32
- display: standalone
- orientation: portrait
- start_url: /

Included assets:

- favicon.ico
- apple-touch-icon.png
- pwa-192x192.png
- pwa-512x512.png

Caching notes:

- build assets are included by Workbox glob patterns
- Google Fonts stylesheets receive CacheFirst runtime caching

HTML-level mobile optimizations in index.html:

- viewport locked for mobile-style usage
- theme color meta tag
- mobile web app capability tags
- Apple-specific home screen tags

## 16. Export Format

The CSV export currently contains these columns:

- ID
- Grupo
- Metodologia
- Data
- Hora
- Espécie
- Identificação
- Ambiente
- Estrato
- Atividade
- Quantidade
- Distância (m)
- Lado
- Ponto de Coleta
- Observações

Encoding behavior:

- UTF-8 with BOM to improve compatibility with spreadsheet software such as Excel

## 17. Analytics Implemented

The dashboard currently computes and displays:

- total records
- unique species count
- average observed quantity
- maximum observed quantity
- record counts over time
- distribution by fauna group
- distribution by methodology
- distribution by identification type
- distribution by environment
- distribution by activity
- top 10 species by occurrence count

Time filtering supported:

- all data
- last 7 days
- last 30 days

## 18. Milestones and Delivered Advancements

The project was originally tracked through the following milestone progression, all of which are now implemented in the codebase:

### Step 1 - Scaffold, design system, and types

Delivered:

- Vite + React + TypeScript application scaffold
- Tailwind integration
- initial design tokens and helpers
- central domain typing for fauna groups, methodologies, and record fields

Current state in code:

- src/lib/types.ts
- src/lib/theme.ts
- tailwind.config.js
- src/index.css

### Step 2 - Local database with Dexie / IndexedDB

Delivered:

- local persistent storage layer
- schema for records and collection points
- indexed fields for filtering and sorting

Current state in code:

- src/lib/db.ts
- hooks that consume this DB in src/hooks/useCollectionPoints.ts and src/hooks/useRecords.ts

### Step 3 - Base UI components

Delivered:

- shared UI building blocks for consistent pages and forms
- confirm modal
- toast notifications
- empty-state patterns

Current state in code:

- src/components/ui

### Step 4 - Home screen

Delivered:

- home hub
- fauna group selection
- direct access to records, collection points, and dashboard

Current state in code:

- src/pages/HomePage.tsx

### Step 5 - Methodologies

Delivered:

- methodology catalog per fauna group
- navigation from group selection into methodology selection

Current state in code:

- methodology definitions in src/lib/types.ts
- UI in src/pages/MethodologiesPage.tsx

### Step 6 - Collection point + GPS

Delivered:

- collection point creation workflow
- optional geolocation capture
- point metadata persistence

Current state in code:

- src/pages/CollectionPointPage.tsx
- src/hooks/useGeolocation.ts
- src/hooks/useCollectionPoints.ts

### Step 7 - Data entry

Delivered:

- observation form linked to a collection point
- validation rules for required fields
- repeated save flow for rapid entry during fieldwork

Current state in code:

- src/pages/DataEntryPage.tsx

### Step 8 - Saved records

Delivered:

- record listing
- fauna group filters
- delete flow with confirmation

Current state in code:

- src/pages/RecordsListPage.tsx
- src/components/ui/ConfirmDialog.tsx

### Step 9 - Record detail

Delivered:

- record view mode
- record edit mode
- discard protection for unsaved changes

Current state in code:

- src/pages/RecordDetailPage.tsx

### Step 10 - Analysis dashboard

Delivered:

- summary KPIs
- charts and ranking visualizations
- time-range filtering

Current state in code:

- src/pages/DashboardPage.tsx
- src/hooks/useStatistics.ts

### Step 11 - Data export

Delivered:

- CSV export screen
- export filters
- download generation in browser

Current state in code:

- src/pages/ExportPage.tsx
- src/hooks/useExport.ts

### Additional advancement beyond the milestone list

The current codebase also includes a dedicated collection point management flow that goes beyond the original linear milestone wording:

- collection point list view
- collection point detail view
- collection point editing
- add-record shortcut from point detail
- record count visibility per point
- PWA install prompt experience

Current state in code:

- src/pages/CollectionPointsListPage.tsx
- src/pages/CollectionPointDetailPage.tsx
- src/hooks/useInstallPrompt.ts
- src/components/ui/InstallPrompt.tsx

## 19. Current Constraints and Design Decisions

These are not bugs; they are present-scope decisions unless the project direction changes:

- storage is local only
- no synchronization or backup exists in-app
- no backend is used
- no authentication exists
- no role separation exists
- analytics are computed client-side from local data
- CSV is the only export format currently implemented
- there is no import path back into the application

## 20. Known Implementation Notes for Future Contributors

- Data is duplicated partially across collection points and records by design because records keep group and methodology directly for easier filtering and analytics.
- The app uses live queries, so UI updates are expected immediately after writes.
- Route params are trusted and cast into domain types in several pages. If stricter runtime hardening is needed, route-param validation would be a good next enhancement.
- Some domain fields are optional in practice at the UI level even when they are represented as strings in the record payload. Review validation and type expectations if the data model becomes stricter.
- CSV generation is currently manual despite PapaParse being installed. That dependency is available if a future implementation chooses to standardize CSV generation/parsing.
- There is no automated migration path yet beyond Dexie version 1 schema setup.

## 21. Development Setup

Requirements:

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

The Vite development server runs on port 5173 by default.

## 22. Scripts

Defined in package.json:

```bash
npm run dev
npm run build
npm run preview
```

There is currently no dedicated lint or test script in package.json.

## 23. Where to Change Things

If you need to change domain concepts:

- edit src/lib/types.ts

If you need to change colors, date formatting, or utility helpers:

- edit src/lib/theme.ts

If you need to change persistence structure:

- edit src/lib/db.ts

If you need to change record CRUD behavior:

- edit src/hooks/useRecords.ts

If you need to change collection point CRUD behavior:

- edit src/hooks/useCollectionPoints.ts

If you need to change GPS behavior:

- edit src/hooks/useGeolocation.ts

If you need to change dashboard metrics:

- edit src/hooks/useStatistics.ts and src/pages/DashboardPage.tsx

If you need to change CSV export behavior:

- edit src/hooks/useExport.ts and src/pages/ExportPage.tsx

If you need to change install behavior:

- edit src/hooks/useInstallPrompt.ts and src/components/ui/InstallPrompt.tsx

If you need to change page layout behavior globally:

- edit src/components/ui/Page.tsx

If you need to change app routing:

- edit src/App.tsx

## 24. AI-Oriented Repository Map

For an AI agent entering this project, the fastest orientation is:

1. read src/App.tsx to understand routing
2. read src/lib/types.ts to understand domain vocabulary and controlled values
3. read src/lib/db.ts to understand persistence
4. read src/hooks/useRecords.ts and src/hooks/useCollectionPoints.ts to understand CRUD behavior
5. read src/pages/DataEntryPage.tsx to understand primary data capture
6. read src/pages/RecordsListPage.tsx and src/pages/RecordDetailPage.tsx to understand record review/edit flows
7. read src/hooks/useStatistics.ts and src/pages/DashboardPage.tsx to understand analytics
8. read src/hooks/useExport.ts and src/pages/ExportPage.tsx to understand export behavior
9. read vite.config.ts to understand PWA packaging

If the goal is UI work, start with:

- src/components/ui
- src/lib/theme.ts
- src/index.css
- the specific page under src/pages

If the goal is data/model work, start with:

- src/lib/types.ts
- src/lib/db.ts
- src/hooks

If the goal is flow/navigation work, start with:

- src/App.tsx
- src/pages/HomePage.tsx
- the relevant destination page

## 25. Summary

Fauna Data is currently a complete local-first wildlife monitoring PWA for field collection workflows. It already supports the full loop from methodology selection to point creation, record capture, record review, point management, analytics, and CSV export.

The codebase is small, direct, and intentionally structured around pages, hooks, and shared domain definitions. The main sources of truth are:

- src/lib/types.ts for domain semantics
- src/lib/db.ts for persistence
- src/hooks for operational behavior
- src/pages for end-user workflows
- src/components/ui for reusable presentation primitives

For the current scope, the project is in a mature implemented state. The main future expansion areas would be synchronization, backup, multi-user capabilities, stronger validation, automated testing, and richer data interchange.
    │   │                               #   FaunaGroup, IdentificationType, EnvironmentType,
    │   │                               #   StratumType, ActivityType, SideType, CollectionPoint,
    │   │                               #   ObservationData, FaunaRecord, SelectOption, Methodology,
    │   │                               #   METHODOLOGIES map, GROUP_LABELS, METHODOLOGY_LABELS,
    │   │                               #   and all dropdown option arrays
    │   ├── theme.ts                    # Design system — color tokens, group colors, chart palette,
    │   │                               #   utility functions: cn(), formatDate(), formatTime(),
    │   │                               #   formatDateTime(), generateId()
    │   └── db.ts                       # Dexie database class (FaunaDB) — two tables:
    │                                   #   "records" and "collectionPoints" with indexed fields
    │
    ├── hooks/                          # Custom React hooks
    │   ├── useRecords.ts              # CRUD operations for FaunaRecord — save, update, delete,
    │   │                               #   clear all, get by ID, filter by group/date/point.
    │   │                               #   Uses useLiveQuery for reactive reads.
    │   ├── useCollectionPoints.ts     # CRUD operations for CollectionPoint — save, update,
    │   │                               #   delete, get by ID, filter by group/methodology,
    │   │                               #   getCollectionPointMap (id→name lookup).
    │   │                               #   Uses useLiveQuery for reactive reads.
    │   ├── useStatistics.ts           # Computed analytics — total records, unique species,
    │   │                               #   avg/max quantity, breakdowns by group/methodology/
    │   │                               #   identification/environment/activity, top 10 species,
    │   │                               #   records by date. Supports time range filters.
    │   ├── useExport.ts               # CSV generation — builds CSV string with 15 columns,
    │   │                               #   applies filters (group, point, date range),
    │   │                               #   triggers file download with UTF-8 BOM.
    │   ├── useGeolocation.ts          # Browser Geolocation API wrapper — capture GPS coordinates
    │   │                               #   with high accuracy, timeout 15s, error handling
    │   │                               #   (permission denied, unavailable, timeout).
    │   └── useInstallPrompt.ts        # PWA install prompt — intercepts beforeinstallprompt event
    │                                   #   (Android/desktop), detects iOS for manual instructions,
    │                                   #   detects standalone mode (already installed).
    │
    ├── components/
    │   └── ui/                         # Reusable UI primitives
    │       ├── index.ts               # Barrel export for all UI components
    │       ├── Page.tsx               # Page layout shell — sticky header with back button,
    │       │                           #   title, subtitle, action slot; scrollable content area;
    │       │                           #   fixed bottom footer slot. Uses `min-h-dvh`.
    │       ├── Card.tsx               # Card container — rounded-2xl, border, shadow, optional
    │       │                           #   pressable (scale on tap), configurable padding.
    │       ├── Button.tsx             # Button — 4 variants (primary/secondary/danger/ghost),
    │       │                           #   3 sizes (sm/md/lg), loading spinner, icon slot.
    │       ├── Input.tsx              # Input + Textarea — labeled, with error/hint states,
    │       │                           #   focus ring, auto-generated IDs from label text.
    │       ├── Select.tsx             # Custom dropdown select — click-to-open options list,
    │       │                           #   click-outside-to-close, checkmark on selected,
    │       │                           #   error/hint states. NOT a native <select>.
    │       ├── Badge.tsx              # Inline badge — 6 variants (default/primary/success/
    │       │                           #   warning/danger/group), "group" variant uses
    │       │                           #   fauna-group-specific colors.
    │       ├── EmptyState.tsx         # Empty state placeholder — icon, title, description,
    │       │                           #   optional action button.
    │       ├── ConfirmDialog.tsx      # Modal confirmation dialog — backdrop blur, title,
    │       │                           #   message, confirm/cancel buttons, danger/primary variant.
    │       │                           #   Bottom-sheet on mobile, centered on desktop.
    │       ├── Toast.tsx              # Toast notification system — pub/sub via listeners array,
    │       │                           #   showToast(type, message) function, auto-dismiss 3s,
    │       │                           #   fixed top position, success/error/warning styles.
    │       └── InstallPrompt.tsx      # PWA install prompt UI — floating "Install App" button
    │                                   #   (Android: triggers native prompt; iOS: opens modal
    │                                   #   with Share → Add to Home Screen instructions).
    │                                   #   Hidden when already installed or unsupported.
    │
    └── pages/                          # Application screens (one component per route)
        ├── HomePage.tsx               # Home screen — fauna group selection cards (Birds,
        │                               #   Mammals, Herpetofauna) with record counts, total
        │                               #   records banner, navigation to Dashboard, Collection
        │                               #   Points list, and Records list.
        ├── MethodologiesPage.tsx       # Methodology selection — displays available methodologies
        │                               #   for the selected fauna group with icons and descriptions.
        ├── CollectionPointPage.tsx     # Create new collection point — name input, notes textarea,
        │                               #   GPS capture button, then navigates to DataEntryPage.
        ├── CollectionPointsListPage.tsx # Browse all collection points — filter tabs by fauna
        │                               #   group, shows record count per point.
        ├── CollectionPointDetailPage.tsx # View/edit a collection point — editable fields (name,
        │                               #   notes, group, methodology, coordinates), linked
        │                               #   records list, "Add Record" button.
        ├── DataEntryPage.tsx          # Observation data entry form — 9 fields with validation,
        │                               #   save-and-continue (form resets after save, counter
        │                               #   shows how many saved in current session).
        ├── RecordsListPage.tsx        # Browse saved records — filter tabs by group, record
        │                               #   cards with species/methodology/data chips/date,
        │                               #   delete with confirmation, link to export.
        ├── RecordDetailPage.tsx       # View/edit a single record — read-only mode with data
        │                               #   grid, edit mode with form, unsaved-changes guard
        │                               #   (ConfirmDialog before discard).
        ├── DashboardPage.tsx          # Analytics dashboard — time range tabs (All/7d/30d),
        │                               #   KPI cards, 6 chart sections (bar, pie, horizontal
        │                               #   bars), top 10 species ranking.
        └── ExportPage.tsx             # CSV export — filter controls (group, point, date range),
                                        #   live record count preview, export summary, column
                                        #   listing, download button.
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (Mobile)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  React SPA   │  │ Service      │  │  IndexedDB             │ │
│  │  (Vite build)│  │ Worker       │  │  (via Dexie.js)        │ │
│  │              │  │ (Workbox)    │  │                        │ │
│  │ React Router │  │              │  │  Table: records        │ │
│  │ 10 routes    │──│ Caches all   │  │  Table: collectionPts  │ │
│  │              │  │ static       │  │                        │ │
│  │ Tailwind CSS │  │ assets +     │  │  All data local-only   │ │
│  │ Recharts     │  │ Google Fonts │  │  Persists across       │ │
│  │ Lucide icons │  │              │  │  sessions              │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Geolocation API — GPS coordinates for collection points   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  PWA Manifest — standalone display, theme color, icons     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Key architectural properties:**

- **No backend** — The entire application is a static SPA. There is no server, no API, no cloud database. Data never leaves the user's device unless they explicitly export a CSV.
- **IndexedDB for persistence** — Dexie.js wraps IndexedDB with a promise-based API. Two tables (`records`, `collectionPoints`) store all user data. Data survives page reloads, browser restarts, and works offline.
- **Reactive data layer** — Dexie's `useLiveQuery` hook makes database queries reactive. Any component using `useRecords()` or `useCollectionPoints()` automatically re-renders when the underlying data changes (e.g., after a save or delete).
- **PWA / Service Worker** — `vite-plugin-pwa` generates a Workbox service worker that caches all static assets (`**/*.{js,css,html,ico,png,svg}`) and Google Fonts (CacheFirst, 365-day expiry). The manifest enables "Add to Home Screen" with standalone display.
- **Mobile-first design** — All layouts use `min-h-dvh` (dynamic viewport height for mobile browsers), touch targets ≥ 44px, tap-highlight suppression, `user-scalable=no`, and a fixed bottom footer pattern for primary actions.

---

## Navigation & Routing

All routes are defined in `src/App.tsx`. The app uses React Router v6 with `<BrowserRouter>`.

| Route Pattern | Component | URL Params | Description |
|---|---|---|---|
| `/` | `HomePage` | — | Home screen: fauna group selection cards, total records counter, nav to dashboard/records/points |
| `/methodologies/:group` | `MethodologiesPage` | `group`: `"birds"` \| `"mammals"` \| `"herpetofauna"` | Lists available methodologies for the selected fauna group |
| `/collection-point/:group/:methodology` | `CollectionPointPage` | `group`: FaunaGroup, `methodology`: methodology ID string | Create a new collection point (name, GPS, notes) for the given group + methodology |
| `/collection-points` | `CollectionPointsListPage` | — | Browse all saved collection points with filter by group |
| `/collection-point/:pointId` | `CollectionPointDetailPage` | `pointId`: string (collection point ID) | View/edit a specific collection point, see linked records |
| `/data-entry/:group/:methodology/:pointId` | `DataEntryPage` | `group`: FaunaGroup, `methodology`: string, `pointId`: string | Data entry form for recording a fauna observation at a specific point. Also receives `pointName` via `location.state`. |
| `/records` | `RecordsListPage` | — | Browse all saved records with filter by group, delete, link to export |
| `/records/:recordId` | `RecordDetailPage` | `recordId`: string (record ID) | View/edit a specific record |
| `/dashboard` | `DashboardPage` | — | Analytics dashboard with charts and statistics |
| `/export` | `ExportPage` | — | Filtered CSV export with preview and download |
| `*` (catch-all) | `Navigate to /` | — | Redirects any unknown path to home |

**Navigation flow (user journey):**

```
HomePage (/)
 ├── Select fauna group → MethodologiesPage (/methodologies/:group)
 │    └── Select methodology → CollectionPointPage (/collection-point/:group/:methodology)
 │         └── Create point → DataEntryPage (/data-entry/:group/:methodology/:pointId)
 │              └── Save record(s) → back to CollectionPointDetailPage or continue
 │
 ├── "Meus Pontos de Coleta" → CollectionPointsListPage (/collection-points)
 │    └── Select point → CollectionPointDetailPage (/collection-point/:pointId)
 │         ├── "Adicionar Registro" → DataEntryPage
 │         └── View record → RecordDetailPage (/records/:recordId)
 │
 ├── "Ver Registros Salvos" → RecordsListPage (/records)
 │    ├── Select record → RecordDetailPage (/records/:recordId)
 │    └── "Exportar" button → ExportPage (/export)
 │
 └── "Painel de Análise" → DashboardPage (/dashboard)
```

---

## Data Model

All types are defined in `src/lib/types.ts`.

### Enums (Union Types)

```typescript
type FaunaGroup = "birds" | "mammals" | "herpetofauna";

type IdentificationType = "A" | "V" | "AV";
//   A = Auditory, V = Visual, AV = Auditory + Visual

type EnvironmentType = "floresta" | "cerrado" | "campo" | "agua" | "urbano" | "outro";
//   Forest, Savanna, Grassland, Water, Urban, Other

type StratumType = "solo" | "sub-bosque" | "dossel" | "aereo";
//   Ground, Understory, Canopy, Aerial

type ActivityType = "repouso" | "alimentacao" | "voo" | "canto" | "ninhacao" | "outro";
//   Resting, Feeding, Flying, Singing, Nesting, Other

type SideType = "esquerda" | "direita" | "frente" | "tras";
//   Left, Right, Front, Behind (relative to observer on transect)
```

### Core Interfaces

```typescript
interface CollectionPoint {
  id: string;              // Auto-generated unique ID (timestamp + random)
  name: string;            // User-given name (e.g., "Ponto A", "Trilha Principal")
  latitude?: number;       // GPS latitude (optional — captured via Geolocation API)
  longitude?: number;      // GPS longitude (optional)
  accuracy?: number;       // GPS accuracy in meters (optional)
  createdAt: number;       // Unix timestamp (milliseconds) of creation
  group: FaunaGroup;       // Which fauna group this point belongs to
  methodology: string;     // Methodology ID (e.g., "point-count", "transect")
  notes?: string;          // Free-text notes about the location
}

interface ObservationData {
  species: string;                  // Species name (free text)
  identification: IdentificationType; // How the species was identified
  environment: EnvironmentType;     // Habitat type
  stratum: StratumType;             // Vertical position in vegetation
  activity: ActivityType;           // Animal behavior at time of observation
  quantity: number;                 // Number of individuals
  distance: number;                 // Distance from observer in meters
  side: SideType;                   // Direction relative to observer
  observations: string;             // Free-text notes
}

interface FaunaRecord {
  id: string;                    // Auto-generated unique ID
  collectionPointId: string;     // FK to CollectionPoint.id
  group: FaunaGroup;             // Fauna group
  methodology: string;           // Methodology ID
  timestamp: number;             // Unix timestamp (ms) when saved
  data: ObservationData;         // The observation payload
}
```

### Supporting Types

```typescript
interface SelectOption {
  label: string;   // Display text (Portuguese)
  value: string;   // Internal value
}

interface Methodology {
  id: string;          // URL-safe slug (e.g., "point-count")
  title: string;       // Display name (Portuguese)
  description: string; // Short description (Portuguese)
}
```

### Constant Maps

| Constant | Type | Purpose |
|---|---|---|
| `METHODOLOGIES` | `Record<FaunaGroup, Methodology[]>` | Maps each fauna group to its available methodologies (see [Domain Knowledge](#domain-knowledge--fauna-groups--methodologies)) |
| `GROUP_LABELS` | `Record<FaunaGroup, string>` | `birds→"Aves"`, `mammals→"Mamíferos"`, `herpetofauna→"Herpetofauna"` |
| `METHODOLOGY_LABELS` | `Record<string, string>` | Maps methodology IDs to display names (e.g., `"point-count"→"Ponto de Escuta"`) |
| `IDENTIFICATION_OPTIONS` | `SelectOption[]` | 3 options: Auditivo (A), Visual (V), Auditivo e Visual (AV) |
| `ENVIRONMENT_OPTIONS` | `SelectOption[]` | 6 options: Floresta, Cerrado, Campo, Água, Urbano, Outro |
| `STRATUM_OPTIONS` | `SelectOption[]` | 4 options: Solo, Sub-bosque, Dossel, Aéreo |
| `ACTIVITY_OPTIONS` | `SelectOption[]` | 6 options: Repouso, Alimentação, Voo, Canto, Ninhação, Outro |
| `SIDE_OPTIONS` | `SelectOption[]` | 4 options: Esquerda, Direita, Frente, Trás |

---

## Database Layer (Dexie / IndexedDB)

Defined in `src/lib/db.ts`. Uses Dexie.js v4 to create a local IndexedDB database named `"fauna-data"`.

### Schema (Version 1)

```typescript
class FaunaDB extends Dexie {
  records!: Table<FaunaRecord, string>;
  collectionPoints!: Table<CollectionPoint, string>;

  constructor() {
    super("fauna-data");
    this.version(1).stores({
      records: "id, group, methodology, collectionPointId, timestamp",
      collectionPoints: "id, group, methodology, createdAt",
    });
  }
}
```

**Table: `records`**
- Primary key: `id` (string)
- Indexed fields: `group`, `methodology`, `collectionPointId`, `timestamp`
- Stores: all `FaunaRecord` fields (including the nested `data` object)

**Table: `collectionPoints`**
- Primary key: `id` (string)
- Indexed fields: `group`, `methodology`, `createdAt`
- Stores: all `CollectionPoint` fields

**Properties:**
- Data persists across page reloads and browser restarts.
- Fully offline — no network requests needed for data operations.
- `useLiveQuery` (from `dexie-react-hooks`) makes queries automatically reactive — components re-render when data changes.
- Deleting a collection point does **not** cascade-delete its records. Records keep the `collectionPointId` as a historical reference.

---

## Design System

Defined in `src/lib/theme.ts` and `tailwind.config.js`.

### Color Tokens (`theme.ts`)

| Token | Value | Usage |
|---|---|---|
| `primary` | `#2E7D32` | Primary green — buttons, active states, focus rings |
| `primaryLight` | `#4CAF50` | Lighter green accent |
| `primaryDark` | `#1B5E20` | Darker green for pressed states |
| `primaryBg` | `#E8F5E9` | Light green background tint |
| `background` | `#FFFFFF` | App background |
| `surface` | `#F5F5F5` | Elevated surface (secondary buttons, inputs) |
| `foreground` | `#11181C` | Primary text |
| `muted` | `#687076` | Secondary text |
| `border` | `#E0E0E0` | Default border color |
| `borderFocus` | `#2E7D32` | Focused input border (= primary) |
| `success` / `successBg` | `#22C55E` / `#F0FDF4` | Success state |
| `warning` / `warningBg` | `#F59E0B` / `#FFFBEB` | Warning state |
| `error` / `errorBg` | `#EF4444` / `#FEF2F2` | Error state |

### Fauna Group Colors

| Group | Color | Background |
|---|---|---|
| Birds (`birds`) | `#2E7D32` (green) | `#E8F5E9` |
| Mammals (`mammals`) | `#795548` (brown) | `#EFEBE9` |
| Herpetofauna (`herpetofauna`) | `#F57C00` (orange) | `#FFF3E0` |

### Chart Palette

Used by Recharts on the dashboard: `["#2E7D32", "#0a7ea4", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]`

### Utility Functions (`theme.ts`)

| Function | Signature | Description |
|---|---|---|
| `cn()` | `(...classes: (string \| undefined \| false \| null)[]) => string` | Joins truthy class names with spaces |
| `formatDate()` | `(timestamp: number) => string` | Formats to `pt-BR` locale date (e.g., `"24/03/2026"`) |
| `formatTime()` | `(timestamp: number) => string` | Formats to `pt-BR` time `HH:mm` (e.g., `"14:30"`) |
| `formatDateTime()` | `(timestamp: number) => string` | Returns `"24/03/2026 às 14:30"` |
| `generateId()` | `() => string` | Returns `"<timestamp>-<random7chars>"` (e.g., `"1711324800000-a3f8k2m"`) |

### Tailwind Configuration (`tailwind.config.js`)

- **Content paths:** `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`
- **Dark mode:** `"class"` (not currently used in the UI but configured)
- **Custom colors:** `primary` (DEFAULT/light/dark), `surface` (DEFAULT/dark), `border` (DEFAULT/dark), `muted` (DEFAULT/dark)
- **Fonts:** `sans` = Inter + system fallbacks, `mono` = JetBrains Mono + Fira Code
- **Border radius:** `xl` = 12px, `2xl` = 16px, `3xl` = 20px
- **Box shadows:** `card` (subtle), `card-hover` (slightly elevated)

### Global CSS (`index.css`)

Tailwind layers with custom component classes:
- `.tap-target` — ensures minimum 44×44px touch target
- `.card` — base card styling (`rounded-2xl`, border, shadow)
- `.btn-primary` / `.btn-secondary` / `.btn-danger` — button presets
- `.form-label` / `.form-input` — form element presets
- `.scrollbar-hide` — hides scrollbar while keeping scroll functionality
- `.scroll-smooth-ios` — enables smooth momentum scrolling on iOS

---

## Pages — Detailed Documentation

### 1. HomePage (`src/pages/HomePage.tsx`)

**Route:** `/`

The landing screen and main navigation hub. Displays:
- **Total records counter** — green banner at top showing total record count (hidden when 0).
- **Fauna group cards** — three large pressable cards for Birds, Mammals, and Herpetofauna. Each shows a colored icon bubble, the group name, a short description, and a badge with the number of records for that group. Tapping a card navigates to `/methodologies/:group`.
- **Footer buttons:**
  - "Painel de Análise" (primary) → `/dashboard`
  - "Meus Pontos de Coleta" (secondary) → `/collection-points`
  - "Ver Registros Salvos" (secondary) → `/records`

**Data used:** `useRecords()` for total count and per-group count.

### 2. MethodologiesPage (`src/pages/MethodologiesPage.tsx`)

**Route:** `/methodologies/:group`

Displays methodology cards for the selected fauna group. Each card shows:
- A methodology-specific icon (from Lucide: `Ear`, `ArrowLeftRight`, `Grid2x2`, `List`, `Binoculars`, `Camera`, `Footprints`, `Rat`, `Search`, `Container`, `Volume2`)
- The methodology title and description
- A colored bottom accent bar matching the fauna group

Tapping a card navigates to `/collection-point/:group/:methodology`.

The methodology list comes from the `METHODOLOGIES` constant in `types.ts`. See [Domain Knowledge](#domain-knowledge--fauna-groups--methodologies) for the full list.

### 3. CollectionPointPage (`src/pages/CollectionPointPage.tsx`)

**Route:** `/collection-point/:group/:methodology`

Form to create a new collection point before starting data entry. Contains:
- **Timestamp card** — shows the creation date/time (captured when the page mounts).
- **Identification section:**
  - Name input (required) — e.g., "Ponto A", "Trilha Principal", "Margem do Rio"
  - Notes textarea (optional) — free-text about the location
- **GPS section:**
  - "Capturar Localização" button → calls `navigator.geolocation.getCurrentPosition` with high accuracy and 15-second timeout
  - When captured: shows latitude, longitude, accuracy (±Xm), and a "Ver no Google Maps" link
  - "Recapturar Localização" button to re-take the reading

**On submit:** Creates the collection point via `useCollectionPoints().saveCollectionPoint()`, then navigates to `/data-entry/:group/:methodology/:pointId` with `pointName` in route state.

### 4. CollectionPointsListPage (`src/pages/CollectionPointsListPage.tsx`)

**Route:** `/collection-points`

A browseable list of all saved collection points. Features:
- **Filter tabs** — pill buttons: "Todos", "Aves", "Mamíferos", "Herpetofauna", each with a count badge
- **Collection point cards** — shows name, group badge, methodology label, creation date/time, and the number of associated records
- Tapping a card navigates to `/collection-point/:pointId`

**Data used:** `useCollectionPoints()` for the list, `useRecords()` to calculate per-point record counts.

### 5. CollectionPointDetailPage (`src/pages/CollectionPointDetailPage.tsx`)

**Route:** `/collection-point/:pointId`

Detailed view and editor for a single collection point. Has two modes:

**View mode:**
- Creation date and group badge
- Name, methodology, notes
- GPS coordinates (if captured)
- **Linked records list** — clickable entries showing species name, date, identification type. Tapping navigates to `/records/:recordId`.
- Footer: "Adicionar Registro" button → navigates to DataEntryPage

**Edit mode** (toggled via "Editar" button):
- Editable fields: name, notes, group (dropdown), methodology (dropdown — updates based on selected group), latitude, longitude, accuracy
- Footer: "Salvar Alterações" + "Cancelar Edição" buttons
- Methodology validation: required field

### 6. DataEntryPage (`src/pages/DataEntryPage.tsx`)

**Route:** `/data-entry/:group/:methodology/:pointId`

The core data entry form for recording a fauna observation. This is the most-used page in the field.

**Context card** at the top shows the collection point name and a counter of records saved in the current session (e.g., "3 salvos").

**Form fields:**

| Field | Type | Required | Validation |
|---|---|---|---|
| Espécie (Species) | Text input | Yes | Non-empty after trim |
| Identificação (Identification) | Custom select | Yes | Must select a value |
| Ambiente (Environment) | Custom select | Yes | Must select a value |
| Estrato (Stratum) | Custom select | No | — |
| Atividade (Activity) | Custom select | No | — |
| Quantidade (Quantity) | Numeric input | Yes | Must be a positive number |
| Distância (Distance) | Numeric input (meters) | No | If provided, must be ≥ 0 |
| Lado (Side) | Custom select | No | — |
| Observações (Observations) | Textarea | No | — |

**Save-and-continue flow:** On save, the record is written to IndexedDB via `useRecords().saveRecord()`, the form resets to empty, the session counter increments, and a success toast appears. The user can immediately start the next observation without navigating away.

**Footer buttons:**
- "Salvar e Novo Registro" (primary) — saves and resets
- "Voltar ao Ponto de Coleta" (secondary) — navigates back

### 7. RecordsListPage (`src/pages/RecordsListPage.tsx`)

**Route:** `/records`

A browseable list of all saved records, sorted newest first.

**Features:**
- **Filter tabs** — "Todos", "Aves", "Mamíferos", "Herpetofauna" with count badges
- **"Exportar" header action** — navigates to `/export` (visible only when records exist)
- **Record cards** — each shows:
  - Species name (bold) + identification badge (A/V/AV)
  - Group label + methodology label
  - Data grid with 6 chips: Quantity, Distance, Side, Environment, Stratum, Activity
  - Collection point name + date/time
  - Delete button (red trash icon) → opens ConfirmDialog
  - Chevron → navigates to `/records/:recordId`
  - Group-colored bottom accent bar

**Data used:** `useRecords()` for list + filter + delete, `useCollectionPoints().getCollectionPointMap()` for point name lookup.

### 8. RecordDetailPage (`src/pages/RecordDetailPage.tsx`)

**Route:** `/records/:recordId`

Detailed view and inline editor for a single record.

**View mode:**
- Meta card: date/time, collection point name (loaded async), identification badge
- Data card: species name (large), 2×3 grid of styled fields (environment, stratum, activity, side, quantity, distance), optional observations section, group-colored accent bar

**Edit mode** (toggled via "Editar" header button):
- Same form fields as DataEntryPage (species, identification, environment, stratum, activity, quantity, distance, side, observations)
- Same validation rules (species, identification, environment, quantity required)
- "Cancelar" header button with **unsaved-changes guard** — if the form was modified, a ConfirmDialog ("Descartar alterações") asks before reverting
- Footer: "Salvar Alterações" button

### 9. DashboardPage (`src/pages/DashboardPage.tsx`)

**Route:** `/dashboard`

Analytics dashboard powered by Recharts. All data comes from `useStatistics(range)`.

**Time range filter** — three tab buttons: "Todos" (all time), "7 dias" (last 7 days), "30 dias" (last 30 days).

**Chart sections** (only appear when data is available):

| Section | Chart Type | Library Component | Data Source |
|---|---|---|---|
| KPI Row | Two stat cards | Custom `StatCard` | `totalRecords`, `uniqueSpecies`, `avgQuantity`, `maxQuantity` |
| Registros por Data | Vertical bar chart | `BarChart` / `Bar` | `stats.byDate` (last 14 data points) |
| Por Grupo de Fauna | Horizontal bars | Custom `HBar` | `stats.byGroup` |
| Tipo de Identificação | Pie chart | `PieChart` / `Pie` / `Cell` | `stats.byIdentification` |
| Metodologias Usadas | Horizontal bars | Custom `HBar` | `stats.byMethodology` (top 6) |
| Distribuição por Ambiente | Pie chart | `PieChart` / `Pie` / `Cell` | `stats.byEnvironment` |
| Distribuição por Atividade | Horizontal bars | Custom `HBar` | `stats.byActivity` |
| Top 10 Espécies | Ranked horizontal bars | Custom `HBar` with rank numbers | `stats.topSpecies` |

**Empty state:** When no records exist, shows an empty state with "Nenhum dado disponível".

### 10. ExportPage (`src/pages/ExportPage.tsx`)

**Route:** `/export`

CSV export interface with real-time preview of how many records will be exported.

**Filter controls:**
- Group dropdown (Todos/Aves/Mamíferos/Herpetofauna)
- Collection point dropdown (filtered by selected group)
- Date range (native date inputs for start/end)
- "Limpar tudo" link to reset all filters

**Export summary card:**
- Shows: records selected count, format (CSV UTF-8), group, collection point, period
- Live-updates as filters change

**CSV columns listing:** Shows all 15 columns that will appear in the file (see [CSV Export Format](#csv-export-format)).

**Footer:** "Exportar CSV (N)" button — triggers CSV generation and download. Shows a success toast with the count, then navigates back.

---

## Custom Hooks

### `useRecords()` — `src/hooks/useRecords.ts`

Central hook for all fauna record operations. Uses `useLiveQuery` for reactive reads.

| Return | Type | Description |
|---|---|---|
| `records` | `FaunaRecord[]` | All records, sorted newest first. Reactively updated. |
| `isLoading` | `boolean` | `true` while the initial query is pending |
| `saveRecord(data)` | `(Omit<FaunaRecord, "id" \| "timestamp">) => Promise<FaunaRecord>` | Creates a new record with auto-generated `id` and `timestamp` |
| `updateRecord(id, changes)` | `(string, Partial<Omit<FaunaRecord, "id">>) => Promise<void>` | Partially updates a record |
| `deleteRecord(id)` | `(string) => Promise<void>` | Deletes a record by ID |
| `clearAllRecords()` | `() => Promise<void>` | Deletes all records (data reset) |
| `getRecordById(id)` | `(string) => Promise<FaunaRecord \| undefined>` | One-time read (not reactive) |
| `filterRecords(options)` | `(options) => FaunaRecord[]` | Client-side filter by group, date range, and/or collectionPointId |

### `useCollectionPoints()` — `src/hooks/useCollectionPoints.ts`

Central hook for all collection point operations. Uses `useLiveQuery` for reactive reads.

| Return | Type | Description |
|---|---|---|
| `collectionPoints` | `CollectionPoint[]` | All points, sorted newest first. Reactively updated. |
| `isLoading` | `boolean` | `true` while the initial query is pending |
| `saveCollectionPoint(data)` | `(Omit<CollectionPoint, "id" \| "createdAt">) => Promise<CollectionPoint>` | Creates a new point with auto-generated `id` and `createdAt` |
| `updateCollectionPoint(id, changes)` | `(string, Partial<Omit<CollectionPoint, "id">>) => Promise<void>` | Partially updates a point |
| `deleteCollectionPoint(id)` | `(string) => Promise<void>` | Deletes a point (records are NOT cascade-deleted) |
| `getCollectionPointById(id)` | `(string) => Promise<CollectionPoint \| undefined>` | One-time read |
| `filterCollectionPoints(options)` | `(options) => CollectionPoint[]` | Client-side filter by group and/or methodology |
| `getCollectionPointMap()` | `() => Record<string, string>` | Returns `{id: name}` lookup map for display |

### `useStatistics(range)` — `src/hooks/useStatistics.ts`

Computes analytics from all records, filtered by a time range. Fully memoized with `useMemo`.

**Input:** `range: "all" | "7days" | "30days"`

**Output (`Statistics`):**

| Field | Type | Description |
|---|---|---|
| `totalRecords` | `number` | Count of records in range |
| `uniqueSpecies` | `number` | Distinct species count |
| `avgQuantity` | `number` | Average quantity per record (1 decimal) |
| `maxQuantity` | `number` | Maximum quantity in any single record |
| `byGroup` | `LabelValue[]` | Record count per fauna group (sorted desc) |
| `byMethodology` | `LabelValue[]` | Record count per methodology (top 6, sorted desc) |
| `byIdentification` | `LabelValue[]` | Record count per identification type |
| `byEnvironment` | `LabelValue[]` | Record count per environment |
| `byActivity` | `LabelValue[]` | Record count per activity |
| `topSpecies` | `SpeciesStat[]` | Top 10 species by record count, with name, count, avgQuantity |
| `byDate` | `LabelValue[]` | Record count per date (last 14 data points, sorted chronologically) |

### `useExport()` — `src/hooks/useExport.ts`

Generates and downloads CSV files.

| Return | Type | Description |
|---|---|---|
| `isExporting` | `boolean` | `true` during export |
| `exportCSV(records, filters, pointMap)` | `(...) => Promise<number>` | Filters records, builds CSV, triggers download, returns count |
| `filterRecords(records, filters)` | `(...) => FaunaRecord[]` | Applies ExportFilters to a record array |

**ExportFilters:** `{ group: string, collectionPointId: string, startDate: string, endDate: string }` (empty string = no filter).

**CSV details:**
- Delimiter: comma
- Encoding: UTF-8 with BOM (`\uFEFF`) for Excel compatibility
- Escaping: values containing commas, quotes, or newlines are wrapped in double quotes
- Filename: `fauna-data_YYYY-MM-DD_HH-MM.csv`

### `useGeolocation()` — `src/hooks/useGeolocation.ts`

Wraps the browser Geolocation API for GPS coordinate capture.

| Return | Type | Description |
|---|---|---|
| `position` | `GeoPosition \| null` | `{ latitude, longitude, accuracy }` or null |
| `isLoading` | `boolean` | `true` while capturing |
| `error` | `string \| null` | Human-readable error message (in Portuguese) |
| `capture()` | `() => Promise<GeoPosition \| null>` | Triggers GPS capture (high accuracy, 15s timeout) |
| `clear()` | `() => void` | Resets position and error to null |

**Error messages (Portuguese):**
- Permission denied: "Permissão de localização negada. Verifique as configurações do navegador."
- Position unavailable: "Localização indisponível. Tente em ambiente aberto."
- Timeout: "Tempo esgotado ao obter localização. Tente novamente."
- Unsupported: "Geolocalização não suportada neste dispositivo."

### `useInstallPrompt()` — `src/hooks/useInstallPrompt.ts`

Manages the PWA installation experience.

| Return | Type | Description |
|---|---|---|
| `installPromptEvent` | `BeforeInstallPromptEvent \| null` | Stashed install prompt event (Android/desktop) |
| `isInstalled` | `boolean` | `true` if running in standalone mode |
| `isIOS` | `boolean` | `true` if the device is iPhone/iPad/iPod |
| `promptInstall()` | `() => Promise<void>` | Shows the native install dialog (Android/desktop) |

---

## UI Component Library

All components are in `src/components/ui/` and re-exported from `src/components/ui/index.ts`.

### `Page`

Layout shell used by every page. Provides:
- **Sticky header** — with optional back button (left arrow), title, subtitle, and right-side action slot
- **Scrollable content area** — flex-1 with auto overflow, bottom padding adjusted based on footer presence
- **Fixed bottom footer** — safe area for primary action buttons, always visible above the fold on mobile

Props: `title`, `subtitle?`, `children`, `back?: boolean | string` (true = go back, string = navigate to path), `actions?: ReactNode`, `footer?: ReactNode`.

### `Card`

Generic card container.

Props: `children`, `pressable?: boolean` (adds scale-on-tap + cursor), `padding?: "none" | "sm" | "md" | "lg"`, plus any div props.

Styling: `bg-white rounded-2xl border border-gray-100 shadow-card`.

### `Button`

Multi-variant button component.

Props: `variant?: "primary" | "secondary" | "danger" | "ghost"`, `size?: "sm" | "md" | "lg"`, `loading?: boolean` (shows spinner SVG), `icon?: ReactNode`, `children`, plus any button props.

Min heights: sm=36px, md=44px, lg=52px.

### `Input` / `Textarea`

Labeled form inputs with error/hint states.

Props: `label: string`, `error?: string`, `hint?: string`, plus native input/textarea props. Auto-generates `id` from label text.

Styling: `rounded-xl`, green focus ring (`ring-primary/30`), red border when error.

### `Select`

Custom (non-native) dropdown select. Renders a button that opens a dropdown options list.

Props: `label`, `options: SelectOption[]`, `value`, `onChange(value)`, `placeholder?`, `error?`, `hint?`.

Features: click-outside-to-close, checkmark icon on selected option, focus ring, z-50 dropdown.

### `Badge`

Small inline badge/pill.

Props: `children`, `variant?: "default" | "primary" | "success" | "warning" | "danger" | "group"`, `group?: FaunaGroup`.

When `variant="group"`, uses the fauna-group-specific color (green for birds, amber for mammals, orange for herpetofauna).

### `EmptyState`

Centered placeholder shown when lists are empty.

Props: `icon: ReactNode`, `title: string`, `description?: string`, `action?: ReactNode`.

### `ConfirmDialog`

Modal confirmation dialog.

Props: `isOpen`, `title`, `message`, `confirmLabel?`, `cancelLabel?`, `variant?: "danger" | "primary"`, `onConfirm()`, `onCancel()`.

Features: backdrop blur overlay, bottom-sheet positioning on mobile, centered on desktop.

### `ToastContainer` / `showToast()`

Global toast notification system using a pub/sub pattern.

`showToast(type: "success" | "error" | "warning", message: string)` — can be called from anywhere (not just inside React components). Creates a toast that auto-dismisses after 3 seconds.

`<ToastContainer />` — rendered once in `App.tsx`. Listens for toast events and renders them in a fixed-top stack.

### `InstallPrompt`

PWA installation prompt.

- On Android/desktop: renders a floating green "Install App" button at the bottom center. Tapping triggers the native browser install prompt.
- On iOS: renders the same button, but tapping opens a modal with step-by-step instructions (share icon → "Add to Home Screen").
- Hidden when the app is already installed (standalone mode) or when the browser doesn't support PWA installation.

---

## Domain Knowledge — Fauna Groups & Methodologies

The app supports three fauna groups, each with a curated list of standardized survey methodologies used in Brazilian wildlife monitoring:

### Birds (Aves) — 5 methodologies

| ID | Title | Description | Icon |
|---|---|---|---|
| `point-count` | Ponto de Escuta | Counting birds at a fixed point (point count method) | `Ear` |
| `transect` | Transecto | Observation along a linear path | `ArrowLeftRight` |
| `mist-net` | Redes de Neblina | Capture with mist nets for banding | `Grid2x2` |
| `mackinnon` | Lista de Mackinnon | Species list method (Mackinnon list) | `List` |
| `free-observation` | Observação Livre | Observation without specific methodology | `Binoculars` |

### Mammals (Mamíferos) — 4 methodologies

| ID | Title | Description | Icon |
|---|---|---|---|
| `camera-trap` | Armadilha Fotográfica | Trail camera recording | `Camera` |
| `transect` | Transecto | Observation along a linear path | `ArrowLeftRight` |
| `track-station` | Estação de Pegadas | Track and footprint recording stations | `Footprints` |
| `live-trap` | Armadilha de Gaiola | Cage trapping and release of small mammals | `Rat` |

### Herpetofauna (Reptiles + Amphibians) — 4 methodologies

| ID | Title | Description | Icon |
|---|---|---|---|
| `visual-search` | Busca Visual | Active visual search for reptiles and amphibians | `Search` |
| `pitfall` | Armadilha de Queda | Pitfall trap capture (buried buckets) | `Container` |
| `transect` | Transecto | Observation along a linear path | `ArrowLeftRight` |
| `acoustic` | Monitoramento Acústico | Acoustic monitoring of amphibian vocalizations | `Volume2` |

> Note: The `transect` methodology (ID `"transect"`) is shared across all three groups.

---

## Domain Knowledge — Dropdown Option Values

### Identification Type (`IdentificationType`)

| Value | Label (Portuguese) | Meaning |
|---|---|---|
| `A` | Auditivo (A) | Auditory identification (heard but not seen) |
| `V` | Visual (V) | Visual identification (seen) |
| `AV` | Auditivo e Visual (AV) | Both auditory and visual identification |

### Environment (`EnvironmentType`)

| Value | Label | English |
|---|---|---|
| `floresta` | Floresta | Forest |
| `cerrado` | Cerrado | Savanna (Brazilian cerrado biome) |
| `campo` | Campo | Grassland / open field |
| `agua` | Água | Water / aquatic |
| `urbano` | Urbano | Urban area |
| `outro` | Outro | Other |

### Stratum (`StratumType`)

| Value | Label | English |
|---|---|---|
| `solo` | Solo | Ground level |
| `sub-bosque` | Sub-bosque | Understory |
| `dossel` | Dossel | Forest canopy |
| `aereo` | Aéreo | Aerial / in flight |

### Activity (`ActivityType`)

| Value | Label | English |
|---|---|---|
| `repouso` | Repouso | Resting |
| `alimentacao` | Alimentação | Feeding |
| `voo` | Voo | Flying |
| `canto` | Canto | Singing / vocalizing |
| `ninhacao` | Ninhação | Nesting |
| `outro` | Outro | Other |

### Side (`SideType`)

| Value | Label | English |
|---|---|---|
| `esquerda` | Esquerda | Left (relative to observer direction on transect) |
| `direita` | Direita | Right |
| `frente` | Frente | Front / ahead |
| `tras` | Trás | Behind |

---

## CSV Export Format

The exported CSV file contains 15 columns:

| # | Column Header | Source Field | Description |
|---|---|---|---|
| 1 | ID | `record.id` | Unique record identifier |
| 2 | Grupo | `record.group` | Fauna group (translated: Aves/Mamíferos/Herpetofauna) |
| 3 | Metodologia | `record.methodology` | Methodology (translated to Portuguese display name) |
| 4 | Data | `record.timestamp` | Date in `pt-BR` format (DD/MM/YYYY) |
| 5 | Hora | `record.timestamp` | Time in `pt-BR` format (HH:MM:SS) |
| 6 | Espécie | `record.data.species` | Species name |
| 7 | Identificação | `record.data.identification` | Identification type (A/V/AV) |
| 8 | Ambiente | `record.data.environment` | Environment type |
| 9 | Estrato | `record.data.stratum` | Stratum |
| 10 | Atividade | `record.data.activity` | Activity |
| 11 | Quantidade | `record.data.quantity` | Number of individuals |
| 12 | Distância (m) | `record.data.distance` | Distance from observer in meters |
| 13 | Lado | `record.data.side` | Side relative to observer |
| 14 | Ponto de Coleta | `pointMap[record.collectionPointId]` | Collection point name (resolved from ID) |
| 15 | Observações | `record.data.observations` | Free-text observations |

**File properties:**
- Encoding: UTF-8 with BOM (`\uFEFF` prefix) for Excel compatibility
- Delimiter: comma (`,`)
- Quoting: fields containing commas, double quotes, or newlines are enclosed in double quotes; internal double quotes are escaped as `""`
- Filename pattern: `fauna-data_YYYY-MM-DD_HH-MM.csv`
- MIME type: `text/csv;charset=utf-8;`

---

## PWA Configuration

Defined in `vite.config.ts` using `vite-plugin-pwa`.

### Web Manifest

```json
{
  "name": "Fauna Data",
  "short_name": "Fauna Data",
  "description": "Aplicativo de monitoramento de fauna silvestre",
  "theme_color": "#2E7D32",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    { "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker (Workbox)

- **Register type:** `autoUpdate` — updates silently in the background
- **Pre-cache:** `**/*.{js,css,html,ico,png,svg}` (all static assets)
- **Runtime caching:** Google Fonts (`fonts.googleapis.com`) — CacheFirst strategy, max 10 entries, 365-day expiry

### HTML Meta Tags (`index.html`)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="theme-color" content="#2E7D32" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Fauna Data" />
```

---

## Development Setup

### Option 1: GitHub Codespace (Recommended)

1. In the GitHub repository, click **Code → Codespaces → Create codespace on main**.
2. The environment installs dependencies automatically via `postCreateCommand`.
3. Run `npm run dev` — Vite starts on port `5173`. The Codespace opens a preview automatically.
4. **To test on a mobile device:** In the VS Code **Ports** panel, change the visibility of port `5173` to **Public**. Copy the URL and open it on your phone.

### Option 2: Local Development

```bash
git clone https://github.com/danielsegatto/fauna-data.git
cd fauna-data
npm install
npm run dev
```

Vite dev server starts at `http://localhost:5173`.

### TypeScript Configuration

- Target: ES2020
- Module: ESNext with bundler resolution
- Strict mode: enabled (`strict: true`)
- No unused locals/parameters enforced
- Path alias: `@/*` → `src/*` (configured in both `tsconfig.json` and `vite.config.ts`)
- JSX transform: `react-jsx` (automatic — no need to import React)

---

## NPM Scripts

```bash
npm run dev       # Start Vite dev server (port 5173, HMR enabled)
npm run build     # Type-check with tsc, then build for production with Vite
npm run preview   # Preview the production build locally
```

---

## Field Usage Instructions

1. **Access the app** on your mobile device's browser (Chrome, Safari, Firefox).
2. **Install as an app:**
   - **Android / Chrome:** Tap the floating "Install App" button, or use the browser menu → "Add to Home Screen".
   - **iOS / Safari:** Tap the Share button → "Add to Home Screen".
3. **The app works fully offline** after the first load. All pages, forms, and data are available without internet.
4. **All data is stored locally** on the device using IndexedDB. Data persists across sessions and browser restarts.
5. **Workflow:**
   - Select a fauna group → select a methodology → create a collection point (with optional GPS) → enter observation data → repeat.
   - Use "Registros Salvos" to review, edit, or delete records.
   - Use "Painel de Análise" to view statistics and charts.
   - Use "Exportar Dados" to generate a filtered CSV file and share with your team.
6. **Data sharing:** The only way to extract data is via CSV export. There is no cloud sync or multi-device sharing.

---

## Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| **No backend / client-only** | Field biologists work in remote areas with no internet. A server-dependent app would be unusable. All data stays on-device. |
| **IndexedDB (via Dexie)** | Needs to store structured data (records, points) that persists across sessions. LocalStorage is limited to 5MB and doesn't support queries. IndexedDB handles thousands of records efficiently. |
| **PWA with Service Worker** | Enables full offline functionality and "Add to Home Screen" for a native-like experience on mobile. |
| **Mobile-first design** | The primary use case is a field researcher using a phone. Desktop is secondary. All layouts, touch targets, and interactions are optimized for small screens. |
| **Brazilian Portuguese UI** | Target users are Brazilian field researchers. Domain terminology (methodology names, habitat types) is in Portuguese to match professional conventions. |
| **Client-side routing (React Router)** | SPA pattern — no page reloads, instant navigation, preserves app state. Route params carry context (fauna group, methodology, point ID). |
| **Custom Select (not native `<select>`)** | Native `<select>` varies wildly across mobile browsers and doesn't support custom styling. The custom component ensures consistent UX. |
| **Save-and-continue flow** | In the field, a researcher might log 20+ observations at one collection point in a row. Resetting the form without navigation saves time. |
| **UseLiveQuery for reactivity** | Avoids manual state synchronization between components. Any data change (save, update, delete) automatically re-renders all consumers. |
| **CSV with BOM for export** | Most users open CSVs in Excel, which requires a BOM (`\uFEFF`) to correctly display accented Portuguese characters (à, ã, ç, é, etc.). |
| **No dark mode in current UI** | Tailwind is configured with `darkMode: "class"` for future support, but the UI currently only implements light mode. Field use typically happens in daylight. |
| **Lucide icons** | Tree-shakeable, consistent style, large library. Only the icons actually imported are included in the bundle. |
| **`generateId()` = timestamp + random** | Simple, collision-resistant for single-user local storage. No need for UUID complexity. |

---

## Development Progress (Milestones)

- [x] **Step 1** — Project scaffold, design system, TypeScript types and constants
- [x] **Step 2** — Database layer (Dexie/IndexedDB) with records and collection points tables
- [x] **Step 3** — Base UI component library (Page, Card, Button, Input, Select, Badge, EmptyState, ConfirmDialog, Toast)
- [x] **Step 4** — Home screen with fauna group selection cards and navigation
- [x] **Step 5** — Methodologies page with per-group methodology listing and icons
- [x] **Step 6** — Collection Point creation with GPS capture (Geolocation API)
- [x] **Step 7** — Data Entry form with validation and save-and-continue workflow
- [x] **Step 8** — Records List page with group filtering and delete functionality
- [x] **Step 9** — Record Detail page with view/edit modes and unsaved-changes guard
- [x] **Step 10** — Analytics Dashboard with charts (Recharts), statistics, and time range filters
- [x] **Step 11** — CSV Export with filtering, live preview, and UTF-8 BOM download
