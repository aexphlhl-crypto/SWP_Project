# CineBook - Cinema Booking System

CineBook is a full-stack cinema booking system featuring a modern, dynamic user interface with React + Vite and a robust backend built with Spring Boot.

## Architecture

* **Frontend**: React, Vite, TailwindCSS, `react-router-dom`, `axios`.
* **Backend**: Spring Boot 3.5, Spring Security, JWT, Spring Data JPA.
* **Database**: MySQL.
* **Database Migrations**: Flyway.
* **Payment Gateway**: VNPay.

## Prerequisites

* **Node.js** (v18+)
* **Java 17**
* **MySQL 8.0**
* **Maven** (Embedded `mvnw` provided)

## Setup Instructions

### 1. Database Setup

1. Start your local MySQL server.
2. Create a database named `cinebook`.
   ```sql
   CREATE DATABASE cinebook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Update `backend/src/main/resources/application.yml` with your local MySQL credentials:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/cinebook
       username: root
       password: 123456
   ```

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build the project:
   ```bash
   ./mvnw clean package -DskipTests
   ```
3. Run the Spring Boot application:
   ```bash
   $env:DB_PASSWORD="123456"; .\mvnw spring-boot:run
   $env:DB_PASSWORD="mật_khẩu_của_bạn";
    .\mvnw clean spring-boot:run
   $env:DB_PASSWORD="123456"; $env:GOOGLE_CLIENT_ID="219011529691-co0vj5gls3url1dd2ljkl3tsvtqr8f7s.apps.googleusercontent.com"; .\mvnw spring-boot:run
   ./mvnw spring-boot:run
   ```
   Alternatively, you can run the built JAR:
   ```bash
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

*Note: Flyway will automatically run database migrations and seed default data upon startup.*

### 3. Frontend Setup

1. Navigate to the root directory (where `package.json` is located):
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file at the root directory with the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Security & Compliance

This project complies with strict security standards including:
* **Stateless Token Auth**: JWTs are used for authentication. 
* **Role-based Access Control (RBAC)**: Validated on both the client (via protected routes) and backend (via Spring Security Method Security).
* **Clickjacking Protection**: Configured via Content Security Policy `frame-ancestors 'none'`.
* **API Rate Limiting** & CSRF Protection.

## VNPay Sandbox

The checkout process uses VNPay Sandbox. Test credentials and configuration are located in `backend/src/main/resources/application.yml`.