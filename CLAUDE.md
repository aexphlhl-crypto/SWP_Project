# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`frontend/`)
```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server on http://localhost:3000
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend (`backend/`)
```bash
./mvnw clean package -DskipTests   # Build the JAR
./mvnw spring-boot:run              # Start Spring Boot on http://localhost:8080
```

Swagger UI is available at `http://localhost:8080/swagger-ui.html` when the backend is running.

### Database
MySQL 8.0 must be running locally. The database `cinebook_db` and schema are created automatically by Flyway on first backend startup. Migrations live in `backend/src/main/resources/db/migration/` (`V1__init_schema.sql` for schema, `V2__seed_data.sql` for seed data).

### Frontend environment
Copy `.env` values or set in your environment:
- `VITE_API_BASE_URL=http://localhost:8080/api`
- `VITE_GOOGLE_CLIENT_ID=<your-google-client-id>` (required for Google OAuth)

## Architecture

CineBook is a full-stack cinema booking application. The frontend is a React SPA (Vite) and the backend is a Spring Boot 3.5 REST API backed by MySQL.

### Frontend (`frontend/src/`)

**State management** uses React Context API only — no Redux:
- `contexts/auth-context.jsx` — User session, login/logout, role mapping, JWT storage in `localStorage`
- `contexts/data-context.jsx` — Centralized fetch on mount for movies, cinemas, and showtimes; consumed throughout the app

**API layer** (`api/`) — Axios-based. All requests go through `axiosClient.js` which auto-attaches the JWT Bearer token and redirects 401s to `/login`. Each feature has its own API module (e.g., `bookingApi.js`, `movieApi.js`).

**Routing** is defined in `App.jsx` using React Router v7. The app wraps everything in `GoogleOAuthProvider`, `DataProvider`, and `AuthProvider`. Routes fall into three layout categories:
- Public routes — wrapped in `MainLayoutWrapper` (navbar + footer)
- User-protected routes — additionally wrapped in `ProtectedRoute`
- Admin routes — wrapped in `AdminLayoutWrapper` (sidebar) with role checks

**UI** uses Shadcn/ui (`components/ui/` — 60+ Radix primitives). Do not edit these manually; use the `shadcn` CLI. Custom components are organized by feature under `components/booking/`, `components/movies/`, `components/schedule/`, etc.

**Utilities**: `lib/utils.js` exports `cn()` (clsx + tailwind-merge) — always use it for conditional Tailwind classes. `lib/mock-data.js` provides fallback data. `lib/schedule-utils.js` and `lib/seat-layout.js` contain domain logic.

**Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` — no `tailwind.config.js`. Theme tokens are CSS custom properties in `src/index.css`. Path alias `@/` → `./src` (configured in `vite.config.js`).

**Shadcn/ui config** is in `components.json` (style: "new-york", baseColor: neutral, icons: lucide).

### Backend (`backend/src/main/java/com/cinebook/backend/`)

Organized into feature modules under `modules/`, each containing its own controller, service, repository, and DTOs:

- `auth/` — Login, register, JWT refresh, Google OAuth
- `movies/`, `showtimes/`, `cinemas/`, `rooms/` — Catalog and scheduling
- `bookings/`, `payments/` — Core booking flow and VNPay integration
- `users/`, `promos/`, `fnb/`, `resale/`, `reviews/`, `notifications/`, `news/` — Supporting features
- `dashboard/`, `config/`, `upload/` — Admin and system

**Security** (`security/`): Stateless JWT authentication. `JwtAuthFilter` validates tokens per request. `JwtUtil` handles token generation (24h access / 7d refresh). `SecurityConfig` enforces RBAC with four roles: `SystemAdmin`, `ScheduleManager`, `Customer`, `Guest`.

**Shared code** (`common/`): `response/` — standard API response wrapper used everywhere. `exception/` — custom exceptions. `enums/` — shared enumerations.

**Database config**: `application.yml` sets the datasource, Flyway, JWT secret, VNPay credentials, and CORS allowed origins. File uploads capped at 10MB.
