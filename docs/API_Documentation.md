# CineBook API Documentation

> Base URL: `http://localhost:8080/api`

## 1. Auth & Users

### 1.1 Login
**POST** `/auth/login`

- **Auth required**: No
- **Request Body** (application/json):
```json
{
  "email": "admin@cinebook.vn",
  "password": "password123"
}
```

---

### 1.2 Register
**POST** `/auth/register`

- **Auth required**: No
- **Request Body** (application/json):
```json
{
  "fullName": "New User",
  "email": "new@cinebook.vn",
  "phone": "0909999999",
  "password": "password123"
}
```

---

### 1.3 Verify OTP
**POST** `/auth/verify-otp`

- **Auth required**: No
- **Request Body** (application/json):
```json
{
  "email": "new@cinebook.vn",
  "otp": "123456"
}
```

---

### 1.4 Get Profile
**GET** `/auth/me`

- **Auth required**: Yes (Bearer Token)

---

### 1.5 Update Profile
**PUT** `/auth/profile`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "fullName": "Updated Name",
  "phone": "0123456789",
  "dateOfBirth": "1990-01-01",
  "address": "HCMC"
}
```

---

### 1.6 Refresh Token
**POST** `/auth/refresh-token`

- **Auth required**: No
- **Request Body** (application/json):
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

---

### 1.7 Change Password
**PUT** `/auth/change-password`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

### 1.8 Get All Users (Admin)
**GET** `/admin/users`

- **Auth required**: Yes (Bearer Token)

---

### 1.9 Update User Status (Admin)
**PUT** `/admin/users/1/status`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "status": "Locked"
}
```

---

### 1.10 Lock User (Admin)
**PUT** `/admin/users/1/lock`

- **Auth required**: Yes (Bearer Token)

---

### 1.11 Unlock User (Admin)
**PUT** `/admin/users/1/unlock`

- **Auth required**: Yes (Bearer Token)

---

### 1.12 Add Manager (Admin)
**POST** `/admin/users/managers`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "fullName": "New Manager",
  "email": "manager@cinebook.vn",
  "password": "password123",
  "phone": "0999888777",
  "cinemaId": 1
}
```

---

### 1.13 Remove Manager (Admin)
**DELETE** `/admin/users/managers/1`

- **Auth required**: Yes (Bearer Token)

---

## 2. Core (Movies & Cinemas)

### 2.1 Get All Movies
**GET** `/movies`

- **Auth required**: No

---

### 2.2 Get Now Showing
**GET** `/movies/now-showing`

- **Auth required**: No

---

### 2.3 Get Coming Soon
**GET** `/movies/coming-soon`

- **Auth required**: No

---

### 2.4 Get Movie Details
**GET** `/movies/1`

- **Auth required**: No

---

### 2.5 Create Movie (Admin)
**POST** `/movies`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "title": "New Movie",
  "durationMinutes": 120,
  "releaseDate": "2026-07-01",
  "description": "Movie desc",
  "genre": "Action",
  "director": "John Doe",
  "cast": "Actor A",
  "posterUrl": "http://example.com/poster.jpg",
  "trailerUrl": "http://youtube.com",
  "status": "NowShowing"
}
```

---

### 2.6 Update Movie (Admin)
**PUT** `/movies/1`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "title": "Updated Movie",
  "durationMinutes": 130
}
```

---

### 2.7 Delete Movie (Admin)
**DELETE** `/movies/1`

- **Auth required**: Yes (Bearer Token)

---

### 2.8 Get All Cinemas
**GET** `/cinemas`

- **Auth required**: No

---

### 2.9 Get Cinema Details
**GET** `/cinemas/1`

- **Auth required**: No

---

### 2.10 Create Cinema (Admin)
**POST** `/cinemas`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "name": "CineBook Q2",
  "location": "District 2",
  "mapUrl": "http://maps.google.com"
}
```

---

### 2.11 Update Cinema (Admin)
**PUT** `/cinemas/1`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "name": "CineBook Q2 Updated"
}
```

---

### 2.12 Delete Cinema (Admin)
**DELETE** `/cinemas/1`

- **Auth required**: Yes (Bearer Token)

---

### 2.13 Get Rooms by Cinema
**GET** `/rooms/cinema/1`

- **Auth required**: No

---

### 2.14 Create Room (Admin)
**POST** `/rooms`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "cinemaId": 1,
  "name": "Room 1",
  "roomType": "STANDARD",
  "rowsCount": 10,
  "columnsCount": 10
}
```

---

### 2.15 Update Room (Admin)
**PUT** `/rooms/1`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "name": "Room 1 VIP",
  "roomType": "VIP"
}
```

---

### 2.16 Search Showtimes
**GET** `/showtimes/search?movieId=1&date=2026-06-02&cinemaId=1`

- **Auth required**: No
- **Query Parameters**:
  - `movieId`: 1
  - `date`: 2026-06-02
  - `cinemaId`: 1

---

### 2.17 Get Showtime Details
**GET** `/showtimes/1`

- **Auth required**: No

---

### 2.18 Get Seats for Showtime
**GET** `/showtimes/1/seats`

- **Auth required**: No

---

### 2.19 Create Showtime (Admin)
**POST** `/showtimes`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "movieId": 1,
  "roomId": 1,
  "startTime": "2026-06-02T10:00:00",
  "endTime": "2026-06-02T12:00:00"
}
```

---

## 3. Booking & Payment

### 3.1 Get My Bookings
**GET** `/bookings/my-bookings`

- **Auth required**: Yes (Bearer Token)

---

### 3.2 Create Booking
**POST** `/bookings`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "showtimeId": 1,
  "seatIds": [
    1,
    2
  ],
  "fnbItems": [
    {
      "fnbId": 1,
      "quantity": 2
    }
  ],
  "promoCode": "SUMMER10"
}
```

---

### 3.3 Get Booking Details
**GET** `/bookings/1`

- **Auth required**: Yes (Bearer Token)

---

### 3.4 Generate VNPay URL
**GET** `/payments/create-url?bookingId=1`

- **Auth required**: Yes (Bearer Token)
- **Query Parameters**:
  - `bookingId`: 1

---

### 3.5 VNPay Return Callback
**GET** `/payments/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=1`

- **Auth required**: No
- **Query Parameters**:
  - `vnp_ResponseCode`: 00
  - `vnp_TxnRef`: 1

---

## 4. Products & Promos

### 4.1 Get Active Promos
**GET** `/promos`

- **Auth required**: No

---

### 4.2 Validate Promo Code
**POST** `/promos/validate`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "code": "SUMMER10"
}
```

---

### 4.3 Create Promo (Admin)
**POST** `/promos`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "code": "NEWYEAR",
  "discountPercent": 15,
  "validFrom": "2026-01-01T00:00:00",
  "validTo": "2026-01-31T23:59:59"
}
```

---

### 4.4 Get F&B Items
**GET** `/concessions`

- **Auth required**: No

---

### 4.5 Create F&B (Admin)
**POST** `/concessions`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "name": "Popcorn M",
  "type": "FOOD",
  "price": 45000,
  "description": "Medium Popcorn",
  "imageUrl": "http://example.com/popcorn.jpg"
}
```

---

## 5. Resale

### 5.1 List Active Resales
**GET** `/resale/active`

- **Auth required**: No

---

### 5.2 Get My Resales
**GET** `/resale/my-listings?sellerId=1`

- **Auth required**: Yes (Bearer Token)
- **Query Parameters**:
  - `sellerId`: 1

---

### 5.3 Create Resale Ticket
**POST** `/resale`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "bookingId": 1,
  "sellerId": 1,
  "askingPrice": 50000,
  "note": "Busy",
  "phone": "0912345678",
  "facebookUrl": "fb.com/abc"
}
```

---

### 5.4 Hide Resale Ticket (Admin)
**PUT** `/resale/1/hide?reason=Spam`

- **Auth required**: Yes (Bearer Token)
- **Query Parameters**:
  - `reason`: Spam

---

## 6. News, Settings & Dashboard

### 6.1 Get Active News
**GET** `/news`

- **Auth required**: No

---

### 6.2 Get News Details
**GET** `/news/1`

- **Auth required**: No

---

### 6.3 Create News (Admin)
**POST** `/news`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "title": "Promotion Event",
  "content": "Big discount this week!",
  "category": "PROMOTION",
  "summary": "Short desc"
}
```

---

### 6.4 Get System Config
**GET** `/config`

- **Auth required**: No

---

### 6.5 Update Config (Admin)
**PUT** `/config/maintenance_mode`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "configValue": "false"
}
```

---

### 6.6 Get KPI (Admin)
**GET** `/dashboard/kpi`

- **Auth required**: Yes (Bearer Token)

---

### 6.7 Get Revenue Chart (Admin)
**GET** `/dashboard/revenue`

- **Auth required**: Yes (Bearer Token)

---

### 6.8 Get Top Movies (Admin)
**GET** `/dashboard/top-movies`

- **Auth required**: Yes (Bearer Token)

---

### 6.9 Upload File
**POST** `/upload`

- **Auth required**: Yes (Bearer Token)

---

## 7. Reviews

### 7.1 Get Movie Reviews
**GET** `/reviews/movie/1`

- **Auth required**: No

---

### 7.2 Create Review
**POST** `/reviews`

- **Auth required**: Yes (Bearer Token)
- **Request Body** (application/json):
```json
{
  "customerId": 1,
  "movieId": 1,
  "bookingId": 1,
  "rating": 5,
  "comment": "Great movie!"
}
```

---

## 8. Notifications

### 8.1 Get My Notifications
**GET** `/notifications`

- **Auth required**: Yes (Bearer Token)

---

### 8.2 Mark as Read
**PUT** `/notifications/1/read`

- **Auth required**: Yes (Bearer Token)

---

### 8.3 Mark All as Read
**PUT** `/notifications/read-all`

- **Auth required**: Yes (Bearer Token)

---

