# CineBook Backend

## Tech Stack
- Java 17 + Spring Boot 3.5
- Spring Security + JWT (JJWT 0.12.6)
- Spring Data JPA + Hibernate
- MySQL 8.x
- Flyway (database migration)
- Lombok
- SpringDoc OpenAPI (Swagger UI)
- Bucket4j (rate limiting)

## Prerequisites
- Java 17+
- MySQL 8.x running locally
- No Maven required (uses Maven Wrapper `mvnw`)

## Setup

### 1. Create Database
```sql
CREATE DATABASE cinebook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cinebook_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

Spring Boot reads env vars from system environment. On Windows PowerShell:
```powershell
$env:DB_PASSWORD="your_password"
```
Or use `application-dev.yml` for local development overrides.

### 3. Run
```powershell
# Windows
.\mvnw.cmd spring-boot:run

# After first build (faster)
.\mvnw.cmd spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx512m"
```

Flyway will automatically run `V1__init_schema.sql` and create all 23 tables.

### 4. API Documentation
Swagger UI: http://localhost:8080/swagger-ui.html
API Docs: http://localhost:8080/api-docs

## Project Structure
```
src/main/java/com/cinebook/backend/
├── BackendApplication.java
├── config/
│   └── SecurityConfig.java
├── common/
│   ├── exception/
│   │   ├── AppException.java
│   │   └── GlobalExceptionHandler.java
│   ├── response/
│   │   └── ApiResponse.java
│   └── enums/
│       ├── UserRole.java
│       └── UserStatus.java
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   └── UserDetailsServiceImpl.java
└── modules/
    ├── auth/          (UC-01,02,03,04,05)
    ├── users/         (UC-06,07,32,33)
    ├── movies/        (UC-08,09,25-29) [Sprint 2]
    ├── cinemas/       [Sprint 2]
    ├── showtimes/     [Sprint 2]
    ├── bookings/      [Sprint 3]
    ├── payments/      [Sprint 3 - VNPay Sandbox]
    ├── reviews/       [Sprint 4]
    ├── promos/        [Sprint 4]
    ├── fnb/           [Sprint 4]
    ├── resale/        [Sprint 4]
    ├── news/          [Sprint 4]
    ├── sysconfig/     [Sprint 5]
    └── dashboard/     [Sprint 5]
```

## Auth API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new account |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/forgot-password | Send temporary password |
| POST | /api/auth/change-password | Change password |

> **Note (Dev Mode):** Email sending is not configured yet. OTP and temp passwords are logged to console.

## Security
- BCrypt cost factor: 12
- JWT Access Token TTL: 24 hours
- JWT Refresh Token TTL: 7 days (rotation enabled)
- Account lock after 5 failed attempts: 30 minutes
- Rate limiting: 5 req/min on auth endpoints
