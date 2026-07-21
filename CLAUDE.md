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

There are no frontend tests — no vitest/jest/cypress is configured. Linting is the only automated check.

### Backend (`backend/`)
```bash
./mvnw clean package -DskipTests   # Build the JAR
./mvnw spring-boot:run              # Start Spring Boot on http://localhost:8080
./mvnw test                         # Run all tests
./mvnw test -Dtest=AuthServiceTest  # Run a single test class
./mvnw test -Dtest=AuthServiceTest#testVerifyOtp  # Run a single test method
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

### Database
MySQL 8.0 must be running locally. The database `cinebook_db` and schema are created automatically by Flyway on first backend startup. Migrations live in `backend/src/main/resources/db/migration/` (currently V1–V13). To add a migration: create `V{n}__description.sql` and Flyway runs it on next startup.

### Environment variables

**Frontend** (`.env` in `frontend/`):
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

**Backend** (set as env vars or in `application.yml`):
```
DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
JWT_SECRET
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
MAIL_USERNAME, MAIL_PASSWORD
VNPAY_TMN_CODE, VNPAY_HASH_SECRET
GOOGLE_CLIENT_ID
```

## Architecture

CineBook is a full-stack cinema booking application. The frontend is a React SPA (Vite) and the backend is a Spring Boot 3.5 REST API backed by MySQL.

### Frontend (`frontend/src/`)

**State management** uses React Context API only — no Redux:
- `contexts/auth-context.jsx` — User session, login/logout, role mapping, JWT storage in `localStorage`
- `contexts/data-context.jsx` — Centralized fetch on mount for movies, cinemas, and showtimes; consumed throughout the app

**API layer** (`api/`) — Axios-based. All requests go through `axiosClient.js` which auto-attaches the JWT Bearer token and redirects 401s to `/login`. Each feature has its own API module (e.g., `bookingApi.js`, `movieApi.js`). Interceptors already unwrap `response.data`, so callers receive the payload directly.

**Routing** is defined in `App.jsx` using React Router v7. The app wraps everything in `GoogleOAuthProvider`, `DataProvider`, and `AuthProvider`. Routes fall into three layout categories:
- Public routes — wrapped in `MainLayoutWrapper` (navbar + footer)
- User-protected routes — additionally wrapped in `ProtectedRoute`
- Admin routes — wrapped in `AdminLayoutWrapper` (sidebar) with role checks

**UI** uses Shadcn/ui (`components/ui/` — 60+ Radix primitives). Do not edit these manually; use the `shadcn` CLI. Custom components are organized by feature under `components/booking/`, `components/movies/`, `components/schedule/`, etc.

**Utilities**: `lib/utils.js` exports `cn()` (clsx + tailwind-merge) — always use it for conditional Tailwind classes. `lib/mock-data.js` provides fallback data. `lib/schedule-utils.js` and `lib/seat-layout.js` contain domain logic.

**Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` — no `tailwind.config.js`. Theme tokens are CSS custom properties in `src/index.css`. Path alias `@/` → `./src` (configured in `vite.config.js`).

**Shadcn/ui config** is in `components.json` (style: "new-york", baseColor: neutral, icons: lucide).

### Backend (`backend/src/main/java/com/cinebook/backend/`)

Organized into feature modules under `modules/`, each following the same layout:
```
modules/{feature}/
  controller/   @RestController with @RequestMapping and Swagger @Operation annotations
  service/      @Service with business logic
  repository/   extends JpaRepository
  entity/       @Entity with @Table
  dto/          request/response DTOs with Jakarta Bean Validation annotations
```

Feature modules:
- `auth/` — Login, register, OTP, JWT refresh, Google OAuth; account locks after 5 failed attempts (30 min)
- `movies/`, `showtimes/`, `cinemas/`, `rooms/` — Catalog and scheduling
- `bookings/`, `payments/` — Core booking flow; seats are held for `seat_hold_minutes` (default 10) before release
- `users/`, `promos/`, `fnb/`, `resale/`, `reviews/`, `notifications/`, `news/` — Supporting features
- `dashboard/`, `config/`, `upload/` — Admin and system

**Security** (`security/`): Stateless JWT authentication. `JwtAuthFilter` validates tokens per request. `JwtUtil` handles token generation (24h access / 7d refresh). `SecurityConfig` enforces RBAC with four roles: `SystemAdmin`, `ScheduleManager`, `Customer`, `Guest`.

**Shared code** (`common/`):
- `response/ApiResponse<T>` — all endpoints return this wrapper: `ApiResponse.ok(data)` for success, `ApiResponse.error(code, message)` for failures
- `exception/AppException` — use its factory methods: `.notFound()`, `.badRequest()`, `.unauthorized()`, `.conflict()`, `.forbidden()`; caught globally by `GlobalExceptionHandler`
- `enums/` — `UserRole` (Guest, Customer, ScheduleManager, SystemAdmin), `UserStatus`

**Tests** use Mockito (`@Mock`, `@InjectMocks`, `@ExtendWith(MockitoExtension.class)`) with an H2 in-memory database. The test profile disables Flyway (`spring.flyway.enabled=false`) and uses `ddl-auto=create-drop`. Config lives in `backend/src/test/resources/application-test.properties`.

**Database config**: `application.yml` sets the datasource, Flyway, JWT secret, VNPay credentials, CORS allowed origins, and timezone (`Asia/Ho_Chi_Minh`). File uploads capped at 10MB. Key runtime values (seat pricing multipliers, VAT rate, max seats per booking) are stored in the `SystemConfig` table and managed via the `/api/config` endpoints.
