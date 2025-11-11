# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Event Charm Arrange is a full-stack seating arrangement planner with shareable URLs. Each venue gets a unique slug for persistence and collaboration. PIN-protected edit mode ensures creator control.

**Tech Stack:**
- **Frontend:** Vite + React + TypeScript + Jotai (state) + Konva (canvas) + shadcn/ui + Tailwind
- **Backend:** Express + PostgreSQL + bcrypt (PIN hashing)
- **Package Manager:** Bun (preferred) or npm

## Development Commands

### Starting Development Servers

```sh
# Start both frontend (port 8080) and backend (port 3000) concurrently
bun run dev

# Start only frontend (Vite dev server with API proxy)
bun run dev:frontend

# Start only backend (Express server with hot reload)
bun run dev:backend
```

**Important:** The Vite dev server proxies `/api/*` requests to the backend at `http://localhost:3000`.

### Building

```sh
# Build frontend for production (outputs to dist/)
bun run build

# Build backend TypeScript to JavaScript (outputs to server/dist/)
bun run build:backend

# Build frontend in development mode
bun run build:dev
```

### Code Quality

```sh
# Lint with ESLint
bun run lint

# Format with Prettier
bun run format
```

### Database

```sh
# Initialize PostgreSQL database (creates venues table)
# Requires PostgreSQL running on localhost:5433
bun run db:init
```

**Backend .env requirements:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
PORT=3000
```

## Architecture Overview

### State Management (Jotai)

All application state lives in **Jotai atoms** (`src/lib/atoms.ts`):

**Core Data:**
- `baseShapesAtom`: All tables and venue elements (stage, bar, etc.)
- `guestsAtom`: Guest assignments with table/seat associations
- `eventTitleAtom`, `tableCounterAtom`: Event metadata

**Key Patterns:**
- **Atom Splitting:** `shapeAtomsAtom` uses `splitAtom()` to create individual atoms per shape for fine-grained reactivity
- **Derived Atoms:** `venueDataAtom` aggregates data for persistence; read-only computed value
- **UI State:** `selectedShapeIdAtom`, `isPanningAtom`, `stageScaleAtom`, `editModeAtom`, etc.

**Usage:**
```typescript
// Read-only access
const shapes = useAtomValue(baseShapesAtom);

// Read/write access
const [guests, setGuests] = useAtom(guestsAtom);
```

### Data Flow

```
Jotai Atoms ←→ useVenuePersistence Hook
                      ↓ (2s debounce)
                localStorage + React Query
                      ↓
                Backend API (Express)
                      ↓
                PostgreSQL (JSONB venue_data)
```

**Persistence Strategy:**
1. User edits update atoms immediately
2. `useVenuePersistence` hook debounces changes (2 seconds)
3. Saves to localStorage (instant) + server (async)
4. PIN validation happens server-side with rate limiting

### Canvas Architecture (Konva + React)

**Component Structure** (`src/components/CanvasStage.tsx`):
- Two Konva layers: `venue-layer` (background) and `tables-layer` (interactive)
- `AtomRenderer`: Conditionally renders `TableCircle` or `ElementRect` based on shape type
- `TableCircle`: Circular tables with `ChairCircle` components for each seat
- `ElementRect`: Rectangular venue elements with Konva Transformer for resizing

**Canvas Interactions:**
- Zoom: Mouse wheel
- Pan: Alt + drag
- Select: Click shapes
- Delete: Delete key
- Fit all: Ctrl+0 (Cmd+0 on Mac)

**Rendering Pattern:**
```typescript
// CanvasStage manages zoom/pan/interactions
<Stage>
  <Layer name="venue-layer">
    {/* Background elements */}
  </Layer>
  <Layer name="tables-layer">
    {/* Always-on-top interactive tables */}
  </Layer>
</Stage>
```

### API Structure

**Frontend API Hooks** (`src/hooks/useVenueApi.ts`):
- `useVenueQuery(slug)`: Fetch venue data
- `useCreateVenueMutation()`: Create new venue
- `useUpdateVenueMutation()`: Update/upsert venue
- `validatePinOnServer(slug, pin)`: Validate PIN

**Backend Routes** (`server/src/routes/venueRoutes.ts`):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/venues` | POST | Create venue (returns slug) |
| `/api/venues/:slug` | GET | Fetch venue data |
| `/api/venues/:slug` | PUT | Upsert venue |
| `/api/venues/:slug/validate-pin` | POST | Validate PIN (rate-limited) |

**Security:**
- PINs are bcrypt-hashed (saltRounds: 10)
- Rate limiting: 10 PIN attempts per 15 minutes
- Hashed PINs never sent to frontend

### Type System

**Shared types** (`shared/types/venue.ts`):
- `VenueData`: Persisted data structure (shapes, guests, eventTitle, tableCounter)
- `Venue`: API response with slug, venue_data, timestamps
- `CreateVenueResponse`: Slug-only response on creation

**Frontend types** (`src/types/seatingChart.ts`):
- `Table`, `VenueElement`, `Guest`: Local domain types

**Always update shared types when modifying API contracts.**

## Workflow Guidelines (from .cursor/rules)

### Pre-Implementation Verification

**CRITICAL:** Before proposing any code modifications:
1. Consult external resources (Perplexity, docs) to confirm the approach
2. Explicitly state the verification step (e.g., "I checked Perplexity about X, confirmed Y")
3. Ensure changes align with existing patterns in the codebase

### Development Principles

1. **Follow the Plan:** Adhere to established design/documentation before implementing
2. **Code Correctness:** Logic must correctly implement intended functionality
3. **Contextual Fit:** Changes must integrate seamlessly with existing patterns
4. **Regression Prevention:** Analyze side effects; ensure no breakage

## Common Development Tasks

### Adding New Atoms

Edit `src/lib/atoms.ts`:
```typescript
export const myNewAtom = atom<MyType>(initialValue);
```

Use in components with `useAtom()` or `useAtomValue()`.

### Adding Canvas Shapes

1. Create component in `src/components/` using Konva primitives
2. Add Transformer for selection/resizing if needed
3. Update `AtomRenderer` to conditionally render new shape type
4. Add shape type to `baseShapesAtom`

### Extending Persistence

1. Add new fields to `VenueData` type in `shared/types/venue.ts`
2. Update `venueDataAtom` in `src/lib/atoms.ts` to include new fields
3. Modify `useVenuePersistence.ts` load/save logic if special handling needed

### Adding Backend Endpoints

1. Create route in `server/src/routes/venueRoutes.ts`
2. Wrap route handler in `asyncHandler` utility for error handling
3. Update database schema in `server/src/sql/init_db.sql` if needed
4. Run `bun run db:init` to apply schema changes

### Theme Support

Use `useTheme()` hook from `src/components/ThemeProvider.tsx`:
```typescript
const { theme } = useTheme();
const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
```

### Mobile Responsiveness

Check `useMediaQuery()` in `src/components/SeatingChartApp.tsx` for mobile/desktop branching:
```typescript
const isMobile = useMediaQuery("(max-width: 768px)");
```

## Package Installation

Use Bun for all package operations:
```sh
# Frontend dependencies (in project root)
bun install <package-name>

# Backend dependencies
cd server && bun install <package-name>
```

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:
- `@/*`: Maps to `./src/*`
- `@shared/*`: Maps to `./shared/*`

Example:
```typescript
import { VenueData } from '@shared/types/venue';
import { myUtility } from '@/lib/utils';
```

## Testing

No test framework currently configured. When adding tests, follow patterns in `.cursor/rules/testing.mdc` (if created).

## Deployment

**Docker:** `Dockerfile` present for containerized deployment
**Fly.io:** `fly.toml` configured for deployment

Production build process:
1. Build frontend: `bun run build`
2. Build backend: `bun run build:backend`
3. Backend serves static frontend from `dist/` folder
