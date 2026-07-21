








SOFTWARE REQUIREMENT SPECIFICATION
CineBook – Online Cinema Ticket Booking System









– Hanoi, Jan 2024 –
Table of Contents


# I. Record of Changes

| Date | A*M, D | In charge | Change Description |
| --- | --- | --- | --- |
| Jan 2025 | A | BA / System Engineer | UC-52 to UC-58: Added full News Management feature (public list/detail + Admin CRUD) and VAT Rate configuration use case. UC-02a: Extended User Login with Google OAuth 2.0 integration flow. |
| Jan 2025 | M | BA / System Engineer | §1.4.2 Screen Authorization: Added News screens (2.14) with Guest/Customer/Admin permissions. §3 Functional Requirements: Added 3.11 News Management screens; updated Login screen (Google button); updated System Config (vat_rate field). §5.1 Business Rules: Full replacement with BR-01 through BR-08 aligned to CineBook domain. UC-34 & §3.8.4: Updated Admin Dashboard spec with time-period filters, Revenue View Toggle, AOV KPI, movie ranking tabs, and revenue composition pie chart. |
| Jun 2026 | M | BA / System Engineer | UC-41 & §3.4.3: Removed admin-entered password — system now auto-generates and emails temporary password to new Schedule Manager. BR-06: Revenue recognition updated to include both CONFIRMED and CHECKED_IN booking statuses. §5.2 System Messages: Replaced generic MSG01–MSG09 table with actual API error codes and HTTP statuses aligned to implementation (UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, BAD_REQUEST, VALIDATION_ERROR, DUPLICATE_ENTRY, INTERNAL_ERROR). UC-36 A3a: Confirmed system blocks deletion of Active promo codes (admin must deactivate first). BR-09 to BR-12 added to §5.1: Schedule Manager cinema scoping, seat hold refresh, OTP retry limits, account lockout duration. NFR-S-01 & UC-02 §3.1: corrected account lockout from 15 minutes to 30 minutes to match implementation. UC-11 step 6: seat hold duration changed from hardcoded 15 minutes to configurable `seat_hold_minutes` (default 10 minutes). UC-40 A2a: Enforced in code — configureSeats() now blocks layout changes when room status is Active. UC-17 A6b: Updated to one review per movie per customer (subsequent submissions edit the existing review). UC-49: Removed anti-scalping price cap rule (A3a3 and step 3a3 deleted); §2.9 table updated. UC-21 A5a: Clarified message text for the 2-hour listing cutoff. |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

*A - Added M - Modified D - Deleted


# II. Software Requirement Specification

## 1. Overall Requirements

### 1.1 Context Diagram
The CineBook Online Cinema Ticket Booking System is a new digital platform designed to replace manual and counter-based ticket purchasing with a seamless online experience. The system enables users to browse movies, check real-time seat availability, select seats, choose food & beverage combos, and securely complete payments.
The context diagram below illustrates the external entities and system interfaces for release 1.0. The system is engineered to integrate with external payment gateways for instant transaction processing, mapping APIs for cinema location services, and email SMTP servers for automated OTP and QR ticket delivery.


>>


### 1.2 Main Business Processes


#### 1.2.1 Order Processing


#### 1.2.2 Customer Support
…


### 1.3 User Requirements

#### 1.3.1 Actors


| # | Actor | Description |
| --- | --- | --- |
| 1 | Guest | An unauthenticated visitor who can browse movies, view cinema locations, check seat availability, and read reviews without logging in. |
| 2 | Customer | A registered and verified user who can book tickets, complete payments, receive QR tickets, write reviews, and view their booking history. |
| 3 | Schedule Manager | A staff member appointed by the Admin who manages showtimes, views seat fill statistics, and handles scheduling via the calendar view. |
| 4 | System Admin | A privileged user who manages movies, cinemas, rooms, user accounts, promo codes, system configuration, and views reports. |
| 5 | Payment Gateway | External payment services (VNPay, MoMo) that process digital wallet and card transactions; the system redirects customers to these gateways and receives payment confirmation via webhook. |
| 6 | Email Service | External SMTP provider that delivers OTP codes, temporary passwords, and QR ticket confirmation emails to users. |
| 7 | Google Maps API | External mapping service used for the Cinema Map screen and customer location address autocomplete. |
| 8 | YouTube / Trailer Svc | External video hosting platform (YouTube or Vimeo) for streaming movie trailers embedded on the Movie Detail page. |
| 9 | QR Verification Svc | Internal subsystem generating HMAC-signed QR ticket codes after payment and validating them at cinema check-in to prevent fraud or reuse. |



#### 1.3.2 Use Cases (UC)


| ID | Use Case | Feature | Use Case Description |
| --- | --- | --- | --- |
| UC-01 | User Registration | 2.1 Authentication & Account Management | Guest registers a new account via email OTP verification. |
| UC-02 | User Login | 2.1 Authentication & Account Management | All roles log in using email/password. |
| UC-02a | User Login via Google OAuth | 2.1 Authentication & Account Management | Extension of UC-02. Guest/Customer clicks ‘Sign in with Google’, is redirected to Google OAuth consent screen, and is logged in (new account auto-created if email is new). |
| UC-03 | Forgot Password / Reset Password | 2.1 Authentication & Account Management | User resets password via email temporary password. |
| UC-04 | Change Password | 2.1 Authentication & Account Management | Logged-in user changes their own password. |
| UC-05 | User Logout | 2.1 Authentication & Account Management | User terminates their session and invalidates tokens. |
| UC-06 | Edit Profile | 2.1 Authentication & Account Management | All roles edit their own profile information. |
| UC-07 | Update Location / Delivery Address | 2.1 Authentication & Account Management | Customer sets or updates their location so that nearby cinemas are prioritized. |
| UC-08 | Home Page / Movie List | 2.6 Customer - Booking Flow | User searches and browses movies from the homepage. |
| UC-09 | Movie Detail / Trailer / Reviews | 2.6 Customer - Booking Flow | User views full movie details, trailer, and audience reviews. |
| UC-10 | Select Cinema -> Select Movie -> Select Showtime | 2.6 Customer - Booking Flow | Customer selects cinema, movie, and showtime before seat selection. |
| UC-11 | Seat Map / Seat Selection | 2.6 Customer - Booking Flow | Customer selects seats on the 2D seat map. |
| UC-12 | Apply Promo Code | 2.6 Customer - Booking Flow | Customer applies a promotional discount code on the payment page. |
| UC-13 | Payment Page | 2.6 Customer - Booking Flow | Customer pays for tickets via VNPay or MoMo gateway. |
| UC-14 | QR Ticket | 2.6 Customer - Booking Flow | System generates and delivers QR ticket after confirmed payment. |
| UC-15 | Booking History | 2.7 Customer Account Features | Customer views list of confirmed/completed bookings. |
| UC-16 | View / Download QR Ticket | 2.7 Customer Account Features | Customer views or downloads QR ticket from booking history. |
| UC-17 | Write Review and Rate Movie | 2.7 Customer Account Features | Customer submits a star rating and written review for a watched movie. |
| UC-18 | Cinema Map (Guest) | 2.8 Guest Features | Guest views cinema locations on an interactive Google Map. |
| UC-19 | Seat Availability (Guest View) | 2.8 Guest Features | Guest sees remaining seat counts per showtime without logging in. |
| UC-20 | Select F&B Combo | 2.10 F&B Combo | Customer selects F&B combo (popcorn/drinks) after seat selection and before payment. |
| UC-21 | List Ticket for Exchange (Pass) | 2.11 P2P Ticket Exchange | Customer lists a purchased ticket for pass/exchange in the community marketplace. |
| UC-22 | Browse Ticket Exchange Community | 2.11 P2P Ticket Exchange | Any logged-in user browses available tickets listed for exchange/pass, filtered by movie, cinema, and date. |
| UC-23 | Contact Ticket Owner | 2.11 P2P Ticket Exchange | Interested user views seller contact info (phone/Facebook link) to arrange ticket transfer. |
| UC-24 | Cancel / Delist Ticket Exchange | 2.11 P2P Ticket Exchange | Customer who listed a ticket removes their listing from the exchange community. |
| UC-25 | List Movies / View Movie List | 2.2 Movie Management (Admin) | Any user views the movie list with filters. |
| UC-26 | Add New Movie | 2.2 Movie Management (Admin) | Admin adds a new movie with details and poster. |
| UC-27 | Edit / Update a Movie | 2.2 Movie Management (Admin) | Admin updates existing movie information. |
| UC-28 | Remove / Delete a Movie | 2.2 Movie Management (Admin) | Admin soft-deletes a movie from the system. |
| UC-29 | Set Movie Public Status | 2.2 Movie Management (Admin) | Admin controls the movie's visibility status (Hidden/Coming Soon/Now Showing). |
| UC-30 | View Cinema Theater List | 2.3 Cinema Theater Management (Admin) | Any user views the list of active cinema locations. |
| UC-31 | Add/Edit Cinema | 2.3 Cinema Theater Management (Admin) | Admin creates or updates a cinema location record. |
| UC-32 | List Users | 2.4 User Management (Admin) | Admin views the paginated list of all users. |
| UC-33 | User Detail / Lock User / Change Role | 2.4 User Management (Admin) | Admin views user details, locks accounts, or changes roles. |
| UC-34 | Admin Dashboard | 2.9 Admin - System Configuration & Reports | Admin views key business KPIs on the dashboard. |
| UC-35 | System Config – Ticket Hold Time | 2.9 Admin - System Configuration & Reports | Admin configures the ticket hold time for seat reservations. |
| UC-36 | Promo Management – Create/Edit/Delete Promo Code | 2.9 Admin - System Configuration & Reports | Admin manages promotional discount codes. |
| UC-37 | Report Dashboard – Revenue Report / Ticket Stats | 2.9 Admin - System Configuration & Reports | Admin views revenue and ticket statistics with filters. |
| UC-38 | Export Excel (Reports) | 2.9 Admin - System Configuration & Reports | Admin exports filtered reports as .xlsx file. |
| UC-39 | Admin Manage F&B Products | 2.10 F&B Combo | Admin creates, edits, or deactivates F&B combo products and pricing. |
| UC-40 | Room Management / Seat Layout Config | 2.3 Cinema Theater Management (Admin) | Schedule Manager manages rooms and configures seat layouts with base Normal seat pricing and percentage multipliers for VIP/Couple. |
| UC-41 | Create Schedule Manager Account | 2.5 Schedule Manager Functions | Admin creates a Schedule Manager account without email verification. |
| UC-42 | Schedule Manager Dashboard – Seat Fill Statistics | 2.5 Schedule Manager Functions | Schedule Manager views occupancy statistics per showtime/room. |
| UC-43 | Monthly / Weekly / Yearly Schedule View | 2.5 Schedule Manager Functions | Schedule Manager views showtimes in calendar view. |
| UC-44 | Create Showtime | 2.5 Schedule Manager Functions | Schedule Manager creates a new showtime with conflict checking. |
| UC-45 | Edit Showtime | 2.5 Schedule Manager Functions | Schedule Manager edits a showtime that has no sold tickets. |
| UC-46 | Cancel Showtime | 2.5 Schedule Manager Functions | Schedule Manager cancels a showtime (only if no tickets have been sold). |
| UC-47 | Conflict Check / Time Slot Selector | 2.5 Schedule Manager Functions | Sub-use case included by UC-44 and UC-45; checks for scheduling conflicts automatically on showtime create/edit. |
| UC-48 | View Concession Order QR | 2.12 Customer – Concession Flow | Customers view the list of purchased food/beverages associated with their booking and the QR ticket after a successful payment. |
| UC-49 | Edit / Delete Resale  Listing | 2.13 Ticket Resale | Customers edit the price/notes or remove their ticket resale listing (UC-24 only includes Cancel; UC-49 adds the Edit function). |
| UC-50 | Manage Resale Listings | 2.14 Admin – Resale Management | Admins manage and hide inappropriate ticket resale listings. |
| UC-51 | View Resale Listing  Report  2.14 Admin – Resale | 2.14 Admin – Resale Management | Admins view statistical reports of resale listings by movie, cinema, and status. |
| UC-52 | View News List (Public) | 2.15 News Management | Any visitor (Guest/Customer) browses the paginated news article list displayed as a grid with thumbnail, title, summary, and publication date. |
| UC-53 | View News Detail (Public) | 2.15 News Management | Any visitor reads the full content of a single news article accessed via /news/:id. Article must have status = Published. |
| UC-54 | Admin – Create News Article | 2.15 News Management | System Admin creates a new article (title, summary, content, thumbnail URL, publish date) and sets its status to Draft or Published. |
| UC-55 | Admin – Edit News Article | 2.15 News Management | System Admin updates any field of an existing article and saves changes. |
| UC-56 | Admin – Delete News Article | 2.15 News Management | System Admin permanently removes a news article. A confirmation dialog is displayed before deletion. |
| UC-57 | Admin – Publish / Unpublish Article | 2.15 News Management | System Admin toggles an article’s status between Published and Hidden. Hidden articles are invisible to the public. |
| UC-58 | Admin – Configure VAT Rate | 2.9 Admin – System Configuration & Reports | System Admin updates the vat_rate key in System Configuration. Value must be a decimal between 0.00 and 1.00 (e.g., 0.10 for 10%). |

…

#### 1.3.2 Use Case Diagrams

##### 1.3.2.1 UCs for Guest



##### 1.3.2.2 UCs for Customer


##### 1.3.2.3 Use case for Schedule Manager


##### 1.3.2.4 Use case for System Admin



### 1.4 System Functionalities

#### 1.4.1 Screens Flow


#### 1.4.2 Screen Authorization

| Screen | Guest | Customer | Schedule Manager | System Admin |
| --- | --- | --- | --- | --- |
| 2.1 Authentication & Account Management |  |  |  |  |
| Register / Sign Up | ✓ |  |  |  |
| Login | ✓ | ✓ | ✓ | ✓ |
| Forgot Password / Reset Password | ✓ | ✓ | ✓ | ✓ |
| Change Password |  | ✓ | ✓ | ✓ |
| Edit Profile |  | ✓ | ✓ | ✓ |
| Update Location / Delivery Address |  | ✓ |  |  |
| 2.2 Movie Management (Admin) |  |  |  |  |
| Movie List (browse/filter) | ✓ | ✓ | ✓ | ✓ |
| Movie Detail / Trailer / Reviews | ✓ | ✓ | ✓ | ✓ |
| Add New Movie |  |  |  | ✓ |
| Edit / Update Movie |  |  |  | ✓ |
| Delete Movie |  |  |  | ✓ |
| Set Movie Public Status |  |  |  | ✓ |
| 2.3 Cinema Theater Management (Admin) |  |  |  |  |
| Cinema Theater List | ✓ | ✓ | ✓ | ✓ |
| Add / Edit Cinema |  |  |  | ✓ |
| Room Management / Seat Layout Config |  |  | ✓ | ✓ |
| 2.4 User Management (Admin) |  |  |  |  |
| User List |  |  |  | ✓ |
| User Detail / Lock User |  |  |  | ✓ |
| 2.5 Schedule Manager Functions |  |  |  |  |
| Schedule Manager Dashboard (Seat Fill Stats) |  |  | ✓ | ✓ |
| Monthly / Weekly / Yearly Schedule View |  |  | ✓ | ✓ |
| Create Showtime |  |  | ✓ |  |
| Edit Showtime |  |  | ✓ |  |
| Cancel Showtime |  |  | ✓ |  |
| Conflict Check / Time Slot Selector |  |  | ✓ |  |
| 2.6 Customer – Booking Flow |  |  |  |  |
| Home Page / Movie List (Search & Browse) | ✓ | ✓ | ✓ | ✓ |
| Select Cinema → Movie → Showtime |  | ✓ |  |  |
| Seat Map / Seat Selection |  | ✓ |  |  |
| Apply Promo Code |  | ✓ |  |  |
| Payment Page |  | ✓ |  |  |
| QR Ticket (post-payment) |  | ✓ |  |  |
| 2.7 Customer Account Features |  |  |  |  |
| Booking History |  | ✓ |  |  |
| View / Download QR Ticket |  | ✓ |  |  |
| Write Review & Rate Movie |  | ✓ |  |  |
| 2.8 Guest Features |  |  |  |  |
| Cinema Map (Google Map) | ✓ | ✓ |  |  |
| Seat Availability View (Guest) | ✓ | ✓ |  |  |
| 2.9 Admin – System Configuration & Reports |  |  |  |  |
| Admin Dashboard (KPIs) |  |  |  | ✓ |
| Admin Profile / Change Password |  |  |  | ✓ |
| System Config (Hold Time / Seat Pricing) |  |  |  | ✓ |
| Adjust Seat Pricing |  |  |  | ✓ |
| Promo Code Management |  |  |  | ✓ |
| Report Dashboard (Revenue / Ticket Stats) |  |  |  | ✓ |
| Export Excel (Reports) |  |  |  | ✓ |
| Showtime Schedule View (Cinema → Showtime) | ✓ | ✓ | ✓ | ✓ |
| View Reviews (on Movie Detail) | ✓ | ✓ | ✓ | ✓ |
| 2.10 F&B Combo |  |  |  |  |
| Select F&B Combo (during booking) |  | ✓ |  |  |
| F&B Product Management (Admin) |  |  |  | ✓ |
| 2.11 P2P Ticket Exchange |  |  |  |  |
| Browse Ticket Exchange Community |  | ✓ |  |  |
| List Ticket for Exchange / Pass |  | ✓ |  |  |
| View Contact Info & Delist Ticket |  | ✓ |  |  |
| 2.12 Customer – Concession Flow |  |  |  |  |
| View Concession Order QR |  | ✓ |  |  |
| 2.13 Ticket Resale |  |  |  |  |
| Edit / Delete Resale Listing |  | ✓ |  |  |
| 2.14 Admin – Resale Management |  |  |  |  |
| Manage Resale Listings |  |  |  | ✓ |
| View Resale Listing Report |  |  |  | ✓ |
| 2.15 News Management |  |  |  |  |
| View News List | ✓ | ✓ | ✓ | ✓ |
| View News Detail | ✓ | ✓ | ✓ | ✓ |
| Admin News Management |  |  |  | ✓ |
| Admin Create / Edit News Article |  |  |  | ✓ |



#### 1.4.3 Non-UI Functions

#### Performance Requirements

| ID | Requirement | Target / Metric |
| --- | --- | --- |
| NFR-P-01 | Page load time (Home, Movie Detail, Seat Map) | All main pages (Home, Movie Detail, Seat Map) load within 3 seconds under normal conditions. |
| NFR-P-02 | API response time (all endpoints except reports) | All API endpoints respond within 2 seconds under normal load. |



#### Usability Requirements

| ID | Requirement | Target / Metric |
| --- | --- | --- |
| NFR-U-01 | Responsive design | All Customer-facing screens render correctly on: mobile (375–480 px), tablet (768–1024 px), and desktop (1280 px+). Core booking flow fully usable on mobile. |
| NFR-U-02 | Language | Application UI is in English. System error and validation messages are in English. |
| NFR-U-03 | New-user learnability | A first-time Customer can complete a full booking (movie → seat → payment) in under 5 minutes without training. |
| NFR-U-04 | Accessibility | Customer-facing pages meet WCAG 2.1 Level AA standards: sufficient colour contrast, keyboard navigability, and screen-reader compatible ARIA labels on interactive elements. |
| NFR-U-05 | User feedback | Every user-triggered action that takes > 1 second must display a loading indicator. All form submissions return a success or error message. |




### 1.5 Entity Relationship Diagram




Entities Description

| # | Entity | Description |
| --- | --- | --- |
| 1 | Users | Stores all user accounts (Guest, Customer, ScheduleManager, SystemAdmin) with authentication credentials, profile data, role, account status, location, and login tracking. |
| 2 | OtpTokens | Holds one-time password and temporary password tokens for email verification and password reset; tracks expiry, usage state, and retry count. |
| 3 | ActivityLog | Audit trail of all significant user and system events (login, booking, role change) with actor, target entity, IP address, and timestamp. |
| 4 | Genres | Reference table of movie genre categories (Action, Comedy, Drama, Horror, Sci-Fi, Animation, Documentary, Other). |
| 5 | Movies | Master catalog of films with full metadata: title, synopsis, duration, release date, age rating, language, director, cast, poster, trailer URL, public status, and computed average rating. |
| 6 | MovieGenres | Junction table linking each movie to one or more genres; enforces a many-to-many relationship between Movies and Genres. |
| 7 | MovieSubtitles | Tracks available subtitle languages per movie; supports multiple language entries per film. |
| 8 | Cinemas | Records for each cinema location: name, address, city, GPS coordinates, phone number, operating hours, and active/inactive status. |
| 9 | Rooms | Screening rooms within a cinema with dimensions (rows x columns), computed capacity, base seat price, active status, and JSON seat-layout map (Normal/VIP/Couple). |
| 10 | Seats | Individual seat records within a room, storing row/column position, seat type (Normal, VIP, Couple), and display label; the atomic unit for booking. |
| 11 | Showtimes | Scheduled movie screenings linking a movie, cinema, and room to a specific start/end time; stores optional price override, status, and cleaning-buffer logic for conflict detection. |
| 12 | Bookings | Core transactional record per ticket purchase: links customer to showtime, tracks subtotal, promo discount, grand total, booking status (Pending/Confirmed/Checked-In/Failed/Cancelled/Expired), hold expiry, and QR code. |
| 13 | BookingSeats | Line-item table associating individual seats with a booking; stores seat type and price at the time of booking to preserve historical pricing. |
| 14 | Payments | Payment transaction records linked to a booking; captures payment method (VNPay, MoMo, etc.), gateway transaction ID, amount, payment status, and timestamp. |
| 15 | Reviews | Customer-submitted star ratings (1-5) and written comments for movies; enforces one review per customer-movie pair, soft-delete support, and automatic average rating recalculation via trigger. |
| 16 | PromoCodes | Promotional discount codes with type (percentage or fixed VND), value, minimum order requirement, usage limits, validity period, and active/inactive status. |
| 17 | PromoUsages | Tracks each redemption of a promo code to a booking, enabling enforcement of per-customer and total usage limits and preventing double-use. |
| 18 | FnBProducts | Food and beverage combo products (Popcorn, Drink, Combo); stores name, description, category, price, image URL, and active/inactive status. |
| 19 | FnBOrderItems | Line items for F&B selections within a booking; records product, quantity, and unit price at the time of order. |
| 20 | TicketExchangeListings | Community marketplace listings for ticket exchange/pass-on; stores asking price, seller contact details, and status (Active/Cancelled/Expired/Hidden/Deleted). |
| 21 | RefreshTokens | JWT refresh token records supporting token rotation; stores hashed token, expiry timestamp, and revocation flag per user session. |
| 22 | SystemConfig | Global key-value system settings (seat price multipliers, hold duration, OTP validity, max seats per booking); editable by System Admin via the configuration UI. |
| 23 | NewsArticles |  |
|  | News articles published by System Admin; stores title, summary, full content, thumbnail URL, publish date, and status (Published/Hidden); displayed publicly on the News List and News Detail pages. |



## 2. Use Case Specifications

### 2.1  Authentication & Account Management


#### UC-01 – User Registration

| Primary Actors | Guest | Secondary Actors | Email Service |
| --- | --- | --- | --- |
| Description | As a guest, I want to register a new account so that I can access authenticated features such as booking tickets and writing reviews. |
| Preconditions | User is not logged in; user has a valid email address. |
| Postconditions | A new Customer account is created and activated after successful email verification. |
| Normal Sequence/Flow | 1  Guest clicks the 'Register' button on the homepage or header. 2  System displays the registration form (full name, email, date of birth, password, confirm password). 3  System prompts the guest to enter their age for movie classification purposes. 4  System displays the Terms & Conditions; guest must accept before proceeding. 5  Guest fills in all required fields, accepts the Terms & Conditions, and clicks 'Register'. 6  System validates inputs: email format, password strength (>=8 chars, uppercase, number, special char), email uniqueness. 7  System creates a pending account and sends a 6-digit OTP to the provided email (valid for 10 minutes). 8  Guest enters the OTP on the verification screen. 9  System verifies the OTP and activates the account. 10  System redirects the user to the Home Page as a logged-in Customer. |
| Alternative Sequences/Flows | A6a  Email already registered -> system shows error message and prompts login or password reset. A6b  Password does not meet strength requirements -> system highlights the specific rule violations. A8a  OTP is incorrect -> system shows error; allows up to 3 retries before requiring a new OTP. A8b  OTP has expired (>10 min) -> system prompts user to request a new OTP. A5a  Guest does not accept Terms & Conditions -> system prevents registration from proceeding. |



#### UC-02 – User Login

| Primary Actors | Customer / Schedule Manager / System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a registered user, I want to log in so that I can access my personalized account and role-specific features. |
| Preconditions | User has a registered and activated account. |
| Postconditions | User is authenticated; a secure session is started; successful login recorded in the Activity Log. |
| Normal Sequence/Flow | 1  User clicks the 'Login' button from the page header or is redirected from an authenticated feature. 2  System displays the Login screen (email, password fields). 3  User enters email and password and clicks 'Login'. 4  System validates credentials (email exists, password matches hash, account is active). 5  System authenticates the user and starts a secure session. 6  System records the successful login in the Activity Log. 7  System redirects the user to the Home Page (or the previously requested page). |
| Alternative Sequences/Flows | A4a  Email or password is blank -> system shows required-field error message (MSG10). A4b  Email or password is incorrect -> system shows generic auth error (MSG09). A4c  Email not yet verified -> system shows verification reminder (MSG11). A4d  Account is locked/inactive -> system shows account-status message (MSG12). A4e  5 consecutive failed attempts -> system temporarily locks the account for 30 minutes and notifies the user (MSG13). |



#### UC-02a – User Login via Google OAuth (Extension of UC-02)

| Use Case ID | UC-02a |
| --- | --- |
| Use Case Name | User Login via Google OAuth |
| Feature | 2.1 Authentication & Account Management |
| Primary Actor | Guest / Customer |
| Secondary Actors | Google OAuth API (external) |
| Preconditions | 1. User is unauthenticated (on the Login screen). 2. The application is registered as an OAuth 2.0 client in Google Cloud Console with valid Client ID and Client Secret. 3. Allowed redirect URIs are configured in both Google Console and the system environment configuration. |
| Postconditions | 1. User is authenticated and receives a valid JWT access token and refresh token. 2. If the Google email was new to the system: a Customer account is automatically created with the Google-provided display name, email, and a system-generated placeholder password. 3. User is redirected to the Home page or the originally requested URL. |
| Normal Flow | 1. User navigates to the Login screen. 2. User clicks the ‘Sign in with Google’ button. 3. System constructs the Google authorization URL with scopes [email, profile] and a CSRF-protection state parameter, then redirects the browser. 4. Google displays its consent screen. User selects or confirms their Google account. 5. Google redirects back to /auth/google/callback with an authorization code and state parameter. 6. System verifies the state parameter (CSRF check). 7. System exchanges the authorization code for an ID token via the Google Token Endpoint. 8. System decodes the ID token to extract: email, sub (Google UID), name, and profile picture URL. 9. System looks up the email in the Users table. If found: logs in with existing account. If not found: auto-creates a new Customer account then logs in. 10. System generates a CineBook JWT access token and refresh token. 11. User is redirected to the Home page. |
| Alternative Flows | A1 – User denies Google consent: system displays ‘Google login was cancelled. Please try again or use email/password.’ A2 – CSRF state mismatch: system displays ‘Authentication error. Please try again.’ A3 – Google account email matches an existing standard-registration account: system merges Google identity (links Google UID) with existing account, then logs in normally. |
| Security Notes | 1. OAuth state parameter must be cryptographically random and stored in session cookie. 2. ID token signature must be verified against Google’s public keys (JWKS endpoint). 3. Client Secret must never be exposed in frontend code; token exchange is server-side only. |


#### UC-03 – Forgot Password / Reset Password

| Primary Actors | Any User (Customer / Schedule Manager / System Admin) | Secondary Actors | Email Service |
| --- | --- | --- | --- |
| Description | As a user who has forgotten their password, I want to reset it via email so that I can regain access to my account. |
| Preconditions | The email address is associated with an existing account. |
| Postconditions | User's password is successfully changed; all existing sessions are invalidated. |
| Normal Sequence/Flow | 1  User clicks 'Forgot Password' on the Login screen. 2  System displays the Forgot Password form. 3  User enters their registered email address and submits. 4  System validates that the email exists, then sends a temporary new password to the provided email address. 5  User opens the email and retrieves the temporary password. The temporary password meets all strength requirements and is stored as a secure hash. 6  User logs in with the temporary password. 7  System prompts the user to set a new permanent password immediately upon first login with the temporary password. 8  User enters and confirms a new password that meets strength requirements. 9  System updates the password (hashed), invalidates all active tokens, and redirects to the Home Page. |
| Alternative Sequences/Flows | A3a  Email not found -> system shows a generic confirmation message (to prevent email enumeration). A7a  Temporary password has expired or already been used -> system shows an error and offers to send a new temporary password. |



#### UC-04 – Change Password

| Primary Actors | Customer / Schedule Manager / System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a logged-in user, I want to change my password so that I can maintain account security. |
| Preconditions | User is logged in. |
| Postconditions | Password is updated; active sessions may be invalidated. |
| Normal Sequence/Flow | 1  User navigates to Profile Settings and clicks 'Change Password'. 2  System displays the Change Password form (current password, new password, confirm new password). 3  User fills in all fields and submits. 4  System verifies the current password is correct. 5  System validates the new password meets strength requirements. 6  System checks that the new password is different from the current password. 7  System updates the password hash in the database. 8  System shows a success message. |
| Alternative Sequences/Flows | A4a  Current password is incorrect -> system shows error and prompts retry. A5a  New password is too weak -> system highlights the failing rule. A6a  New password is the same as the current password -> system shows error: "New password must not be the same as the current password." User must enter a different password. |



#### UC-05 – User Logout

| Primary Actors | Customer / Schedule Manager / System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a logged-in user, I want to log out so that my session is terminated and my account is secured. |
| Preconditions | User is logged in. |
| Postconditions | JWT tokens are invalidated; user is redirected to the Home Page. |
| Normal Sequence/Flow | 1  User clicks the 'Logout' button in the header or profile menu. 2  System invalidates the access token and refresh token server-side. 3  System terminates the session. 4  System redirects the user to the Home Page as a Guest. |
| Alternative Sequences/Flows | None |



#### UC-06 – Edit Profile (Customer / Schedule Manager / System Admin)

| Primary Actors | Customer / Schedule Manager / System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a logged-in user, I want to update my profile information so that my account details are accurate. This use case is shared by all three user roles. |
| Preconditions | User is logged in. |
| Postconditions | Profile is updated and changes are persisted in the database. |
| Normal Sequence/Flow | 1  User navigates to 'My Profile'. 2  System displays current profile information: full name, phone number, date of birth. 3  User edits the desired fields. 4  User clicks 'Save'. 5  System validates inputs (phone number format, date of birth format). 6  System saves the changes and shows a success confirmation. |
| Alternative Sequences/Flows | A5a  Validation fails (e.g., invalid phone format) -> system highlights the error inline. |



#### UC-07 – Update Location / Delivery Address

| Primary Actors | Customer | Secondary Actors | Map Service (optional) |
| --- | --- | --- | --- |
| Description | As a logged-in Customer, I want to set or update my location / delivery address so that the system can suggest the nearest cinemas and streamline my booking experience. |
| Preconditions | Customer is logged in. |
| Postconditions | Customer’s location is saved; cinema suggestions and map view are updated to reflect the new location. |
| Normal Sequence/Flow | 1  Customer navigates to ‘My Profile’ and selects ‘Update Location’. 2  System displays the location form with a search field and an embedded map view showing the current saved location (if any). 3  Customer sets location by one of: (a) typing an address in the search field and selecting from autocomplete suggestions, or (b) clicking ‘Use My Current Location’ to let the browser detect their GPS coordinates. 4  System shows a map pin at the selected location for the Customer to confirm. 5  Customer clicks ‘Save Location’. 6  System saves the latitude/longitude and formatted address to the Customer’s profile. 7  System shows a success message and updates the cinema list / map view to prioritize nearby cinemas based on the new location. |
| Alternative Sequences/Flows | A3a  Customer types an address but no autocomplete results are found -> system shows message: "No matching address found. Please try a different search term." A3b  Customer clicks ‘Use My Current Location’ but browser denies GPS permission -> system shows message: "Location access denied. Please allow location access in your browser settings or enter an address manually." A2a  Map service is unavailable -> system falls back to a plain text address field; Customer types the address manually and system saves it as a plain text string without coordinates. A5a  Customer clicks ‘Save Location’ without selecting a location -> system shows validation error: "Please select a location before saving." |



#### UC-08 – Home Page / Movie List

| Primary Actors | Guest / Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a user, I want to search and view movies from the homepage so that I can choose a movie and start booking. |
| Preconditions | CineBook has active movie data; homepage is accessible. |
| Postconditions | Homepage/movie list is displayed; user can proceed to Movie Detail or booking flow. |
| Normal Sequence/Flow | 1  User opens the CineBook Home Page. 2  System displays promotional banners, search bar, Now Showing movies, and Coming Soon movies. 3  User searches or filters movies by title, genre, cinema/location, age rating, or showing status. 4  System refreshes the movie list based on the search/filter criteria. 5  User selects a movie card to view details or clicks 'Book Now' to start booking. 6  If user clicks 'Book Now', system redirects to Movie Detail or the cinema/movie/showtime selection flow (UC-10). |
| Alternative Sequences/Flows | A4a  No movies match the search/filter -> system shows an empty-state message and allows the user to clear filters. A5a  Guest clicks 'Book Now' -> system prompts login/registration before continuing to booking. |



#### UC-09 – Movie Detail / Trailer / Reviews

| Primary Actors | Guest / Customer | Secondary Actors | YouTube/Trailer Service |
| --- | --- | --- | --- |
| Description | As a user, I want to view full movie details, trailer, and reviews so that I can make an informed booking decision. |
| Preconditions | Movie exists and is visible to the user; movie detail page is accessible. |
| Postconditions | Movie detail page is displayed; user can proceed to booking or read reviews. |
| Normal Sequence/Flow | 1  User clicks a movie card from the Home Page, Movie List, or cinema schedule. 2  System displays: title, poster, trailer area, synopsis, genre, language, duration, director, cast, age rating, average rating, and available reviews. 3  System loads the embedded trailer if a valid trailer URL is available. 4  User can watch the trailer, read paginated reviews, and check available cinemas/showtimes. 5  User clicks 'Book Tickets' to start the booking flow. 6  System redirects the user to cinema/movie/showtime selection (UC-10). |
| Alternative Sequences/Flows | A3a  Trailer URL is invalid or unavailable -> system displays a 'Trailer unavailable' placeholder; the rest of the movie detail page remains usable. A5a  Guest clicks 'Book Tickets' -> system prompts login/registration before continuing. A4a  No reviews are available -> system shows an empty review section with an appropriate message. |



#### UC-10 – Select Cinema -> Select Movie -> Select Showtime

| Primary Actors | Customer | Secondary Actors | Map Service |
| --- | --- | --- | --- |
| Description | As a Customer, I want to select a cinema/location, movie, and showtime so that I can proceed to seat selection. |
| Preconditions | Customer is logged in; at least one active cinema, movie, and available showtime exists. |
| Postconditions | A valid showtime is selected and the system moves to the seat map. |
| Normal Sequence/Flow | 1  Customer starts booking from Movie Detail, Home Page, or Cinema List. 2  System displays available cinema locations in list/map view. 3  Customer selects a cinema/location. 4  System displays movies currently available at the selected cinema. 5  Customer selects a movie or confirms the pre-selected movie. 6  System displays available dates and showtimes with room, start time, and remaining seat count. 7  Customer selects a showtime. 8  System loads the Seat Map (UC-11). |
| Alternative Sequences/Flows | A2a  Map service is unavailable -> system still displays the cinema list view. A6a  No showtimes are available for the selected date -> system shows a message and allows the customer to choose another date/cinema/movie. A7a  Showtime becomes unavailable before selection is confirmed -> system refreshes the list and asks the customer to choose another showtime. |



#### UC-11 – Seat Map / Seat Selection

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer, I want to see and select available seats on the seat map so that I can choose my preferred position. |
| Preconditions | Customer is logged in; a valid showtime has been selected; seat layout exists for the room. |
| Postconditions | Selected seats are temporarily held; booking proceeds to payment. |
| Normal Sequence/Flow | 1  System displays the 2D seat map with statuses: available, booked, held by another user, and selected by this customer. 2  Customer selects 1-8 available seats. 3  System calculates the total price based on seat type and showtime pricing. 4  Customer reviews selected seats and total price. 5  Customer clicks 'Proceed to Payment'. 6  System temporarily holds the selected seats for the duration configured in System Config (`seat_hold_minutes`, default 10 minutes) and creates a PENDING booking. 7  System navigates to the Payment Page (UC-13). |
| Alternative Sequences/Flows | A2a  Customer selects a booked/held seat -> system blocks the action and asks the customer to choose another seat. A2b  Customer selects more than 8 seats -> system shows a limit error. A6a  Seat hold cannot be created because another customer selected the same seat first -> system refreshes the seat map. |



#### UC-12 – Apply Promo Code

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer, I want to apply a promo code so that I can receive a discount on my ticket purchase. |
| Preconditions | Customer has an active PENDING booking with held seats and is on the Payment Page; promo code feature is enabled. |
| Postconditions | Valid promo code is applied/reserved and the payable total is reduced. |
| Normal Sequence/Flow | 1  Customer enters a promo code on the Payment Page. 2  Customer clicks 'Apply'. 3  System validates the code: exists, active, within start/end date, usage limit not exceeded, minimum order value met, and not already consumed by this booking/customer/session. 4  System applies the discount and shows the updated total. 5  System marks the promo application as reserved for the current pending booking until payment succeeds or the booking expires. 6  If promo usage limit is nearly exhausted, the first booking entering Payment Page reserves the promo slot. Other bookings cannot use it until release or payment completion. |
| Alternative Sequences/Flows | A3a  Code is invalid, expired, inactive, or usage limit is exceeded -> system shows an error and total remains unchanged. A3b  Order total does not meet minimum requirement -> system shows the required minimum amount. A3c  Customer cancels payment or booking expires after applying promo -> system releases the promo reservation. A3d  Promo code was already used in another completed booking or tab/session -> system blocks reuse. A3e  Promo quota was reserved by another pending booking -> system blocks promo application. |



#### UC-13 – Payment

| Primary Actors | Customer | Secondary Actors | Payment Gateway; Email Service |
| --- | --- | --- | --- |
| Description | As a Customer, I want to pay for my tickets online so that my booking is confirmed and I receive a QR ticket. |
| Preconditions | Customer has an active PENDING booking with locked seats; payment gateway is available; booking hold timer has not expired. |
| Postconditions | Payment is confirmed; booking status becomes CONFIRMED; QR ticket is generated and sent/displayed. |
| Normal Sequence/Flow | 1  System displays the Payment Page with full booking summary: movie, cinema name, location/address, room, showtime date/time, seats, original total, discount, and final total. 2  Customer selects a payment method. 3  Customer clicks 'Pay Now'. 4  System redirects customer to the selected payment gateway. 5  Customer completes payment on the gateway page. 6  Payment gateway sends callback/webhook to the system. 7  System verifies payment result and transaction signature. 8  System updates booking status to CONFIRMED and selected seats to BOOKED. 9  System generates a unique QR ticket code. 10  System sends the QR ticket information to the customer's email and redirects customer to the booking confirmation page. |
| Alternative Sequences/Flows | A7a  Payment fails or is cancelled -> system marks booking as FAILED/CANCELLED, releases the seat hold, and notifies the customer. A1a  15-minute hold timer expires before payment succeeds -> system releases seats and requires customer to restart from seat selection. A7b  Payment callback is invalid or duplicated -> system rejects the callback and keeps the existing booking status unchanged. |



#### UC-14 – QR Ticket

| Primary Actors | Customer | Secondary Actors | Email Service / QR Verification Service |
| --- | --- | --- | --- |
| Description | As a Customer, I want to receive a QR ticket so that I can present it at the cinema entrance. |
| Preconditions | Booking is confirmed after successful payment; ticket code has been generated. |
| Postconditions | QR ticket is available on confirmation page, email, and booking history; scanning QR shows ticket details. |
| Normal Sequence/Flow | 1  After successful payment, system generates a QR ticket containing a unique ticket code. 2  System stores the QR ticket data for later verification. 3  System displays the QR ticket on the booking confirmation page. 4  System sends QR ticket information to the customer's email. 5  When the QR is scanned, system retrieves and displays: movie, cinema, location/address, room, showtime date/time, seats, ticket code, payment status, and total after discount. |
| Alternative Sequences/Flows | A5a  QR code is invalid, expired, duplicated, or not linked to a confirmed booking -> system shows an invalid ticket message. A4a  Email delivery fails -> QR ticket remains available from Booking History. |



#### UC-15 – Booking History

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer, I want to view my successful booking history so that I can track my paid tickets. |
| Preconditions | Customer is logged in; customer has access to My Bookings. |
| Postconditions | Successful booking history is displayed with ticket details and QR access. |
| Normal Sequence/Flow | 1  Customer navigates to 'My Bookings'. 2  System retrieves only successful/confirmed bookings and completed bookings for the customer. 3  System displays each booking with: movie title, cinema/location, room, showtime, seats, total paid, QR ticket status, and booking status. 4  Customer can filter by date range, cinema, movie, or status. 5  Customer selects a booking to view detail and QR ticket. |
| Alternative Sequences/Flows | A2a  Customer has no successful bookings -> system shows an empty-state message. A4a  Filter returns no result -> system shows no matching bookings and allows clearing filters. |



#### UC-16 – View / Download QR Ticket

| Primary Actors | Customer | Secondary Actors | QR Ticket Storage / QR Verification Service |
| --- | --- | --- | --- |
| Description | As a Customer, I want to view or download my QR ticket so that I can access it again after payment. |
| Preconditions | Customer is logged in; booking belongs to the customer; booking status is CONFIRMED or COMPLETED. |
| Postconditions | QR ticket is displayed or downloaded. |
| Normal Sequence/Flow | 1  Customer navigates to Booking History. 2  Customer selects a confirmed or completed booking. 3  Customer clicks 'View/Download QR Ticket'. 4  System verifies that the booking belongs to the customer and has successful payment status. 5  System retrieves the QR ticket image (PNG) and displays or downloads it for the customer. |
| Alternative Sequences/Flows | A4a  Booking is not confirmed/completed -> system blocks QR ticket download. A4b  QR ticket data is unavailable -> system regenerates the QR from the confirmed ticket code if allowed, otherwise shows an error. |



#### UC-17 – Write Review and Rate Movie

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer, I want to write a review and give a 1-5 star rating so that I can share feedback about a movie. |
| Preconditions | Customer is logged in; customer has a confirmed/completed booking for the movie; the showtime linked to that booking has already ended. |
| Postconditions | Review and rating are saved; average movie rating is recalculated; review appears in paginated review list. |
| Normal Sequence/Flow | 1  Customer opens Movie Detail or Booking History after the showtime has ended. 2  System checks that the customer is eligible to review the movie. 3  Customer clicks 'Write Review'. 4  System displays a review form: 1-5 star rating selector and text comment field. 5  Customer selects a star rating and writes a comment. 6  System validates: required rating, comment length, no inappropriate empty content, and review frequency limit. 7  System saves the review/rating and recalculates the movie average rating. 8  System displays the review on the movie detail page according to review sorting/pagination rules. |
| Alternative Sequences/Flows | A2a  Customer has not purchased a ticket for this movie -> system blocks review submission. A2b  Customer has purchased a ticket but the showtime has not ended yet -> system shows message: “You can review this movie after the showtime ends.” A2c  Booking status is PENDING, FAILED, or CANCELLED -> system blocks review submission. A6a  Comment exceeds the maximum length -> system shows a validation error. A6b  Customer has already submitted a review for this booking -> system updates the existing review with the new rating and comment (one review per booking; subsequent submissions for the same booking are treated as edits). A6c  Rating is missing -> system asks customer to select 1-5 stars. A8a  Review list is long -> system paginates reviews. |



#### UC-18 – Cinema Map (Guest)

| Primary Actors | Guest | Secondary Actors | Google Maps |
| --- | --- | --- | --- |
| Description | As a Guest, I want to view cinemas on a map so that I can plan my visit. |
| Preconditions | Guest has navigated to the Cinema List page. |
| Postconditions | Cinema locations are displayed on an interactive map. |
| Normal Sequence/Flow | 1  Guest navigates to the Home Page and clicks the 'Cinema' menu or link. 2  System displays the Cinema List page showing all active cinemas. 3  Guest selects a cinema from the list. 4  System loads an interactive map (Google Maps embed) with a pin for the selected cinema. 5  Guest can see the cinema name, address, operating hours, and a 'Get Directions' link on the map pin. |
| Alternative Sequences/Flows | A4a  Google Maps fails to load -> system shows the cinema address as text with a fallback link to Google Maps. |



#### UC-19 – Seat Availability (Guest View)

| Primary Actors | Guest | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Guest, I want to see how many seats are available for a showtime so that I can decide when to book. |
| Preconditions | Guest has navigated to a Movie Detail page or Cinema Showtime page; at least one active showtime exists. |
| Postconditions | Seat availability count is displayed for the selected showtime. |
| Normal Sequence/Flow | 1  Guest views the showtime list for a selected movie or cinema. 2  System displays the number of remaining available seats next to each showtime. 3  Guest can see whether a showtime is nearly full (e.g., low-availability indicator). |
| Alternative Sequences/Flows | A3a  All seats for a showtime are sold out -> system displays 'Sold Out' instead of a seat count. |



#### UC-20 – Select F&B Combo

| Primary Actors | Customer | Secondary Actors | F&B Inventory System |
| --- | --- | --- | --- |
| Description | As a Customer, I want to add food & beverage items (popcorn, drinks) to my order after selecting seats so that I can conveniently pick up snacks at the cinema. |
| Preconditions | Customer has selected at least one seat and is about to proceed to payment. |
| Postconditions | F&B items are added to the order; total price is updated to include F&B cost before payment. |
| Normal Sequence/Flow | 1  After confirming seat selection, system displays the F&B selection step. 2  System shows available combo products (name, image, price, description). 3  Customer selects desired items and quantities (or skips this step). 4  Customer optionally applies a combo promo code. 5  Customer clicks 'Proceed to Payment'. 6  System adds F&B items to the order summary and recalculates the grand total. 7  System navigates to the Payment screen with the updated order. |
| Alternative Sequences/Flows | A3a  Customer clicks 'Skip' – system proceeds to Payment without F&B items. A4a  Promo code invalid or not applicable to F&B – system shows error inline. A2a  No F&B products available – system skips this step automatically. |



#### UC-21 – List Ticket for Exchange (Pass)

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer who cannot attend a showtime, I want to list my purchased ticket on the community exchange so that another user can take it. |
| Preconditions | Customer is logged in; customer has at least one confirmed (not yet checked-in) booking for a future showtime. |
| Postconditions | Ticket listing is published on the community exchange board with the customer's contact information. |
| Normal Sequence/Flow | 1  Customer navigates to 'My Bookings' and selects a confirmed future booking. 2  Customer clicks 'Pass / Exchange Ticket'. 3  System displays the listing form: auto-filled movie, cinema, showtime; optional note; contact method (phone number and/or Facebook profile URL); asking price (0 for free pass). 4  Customer reviews and submits the listing. 5  System validates that the showtime is still in the future and the booking is CONFIRMED. 6  System publishes the listing on the Ticket Exchange Community board. 7  System shows success confirmation with a link to the published listing. |
| Alternative Sequences/Flows | A5a  Showtime starts in less than 2 hours – system blocks the listing and displays: "Ticket listing is not allowed less than 2 hours before the showtime starts." A5b  Booking is already listed – system shows the existing listing and offers to update or delist. A3a  Customer provides neither phone nor Facebook URL – system shows validation error: 'At least one contact method is required.' |



#### UC-22 – Browse Ticket Exchange Community

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a user, I want to browse tickets listed for exchange so that I can find available tickets for movies I want to see. |
| Preconditions | User is logged in. |
| Postconditions | User sees a filtered list of available ticket listings with contact information. |
| Normal Sequence/Flow | 1  User navigates to 'Ticket Exchange Community'. 2  System displays all active listings sorted by showtime date ascending. 3  User applies filters: Movie title, Cinema, Date range. 4  System refreshes the list based on applied filters. 5  User clicks a listing to view full details: movie, cinema, showtime, seat type, asking price, seller contact (phone/Facebook). |
| Alternative Sequences/Flows | A4a  No listings match the filter – system shows empty-state message: 'No tickets available for the selected criteria.' |



#### UC-23 – Contact Ticket Owner

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an interested buyer, I want to view the seller's contact details so that I can reach out to arrange the ticket transfer directly. |
| Preconditions | User is logged in and viewing a ticket exchange listing. |
| Postconditions | User can see the seller's phone number and/or Facebook profile link. |
| Normal Sequence/Flow | 1  User opens a listing from the Ticket Exchange Community board. 2  System displays full listing details including contact information. 3  User clicks the phone number to call/copy, or clicks the Facebook link to open the seller's profile. 4  User and seller arrange the transfer outside the CineBook system. |
| Alternative Sequences/Flows | A3a  Listing has already been delisted by the seller – system shows message: 'This listing is no longer available.' |



#### UC-24 – Cancel / Delist Ticket Exchange Listing

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer who has listed a ticket, I want to remove my listing if my plans change so that other users are not misled. |
| Preconditions | Customer is logged in; customer has an active ticket exchange listing. |
| Postconditions | Listing is removed from the Ticket Exchange Community board. |
| Normal Sequence/Flow | 1  Customer navigates to their active listing (from 'My Bookings' or the Exchange board). 2  Customer clicks 'Delist / Cancel Listing'. 3  System shows a confirmation dialog. 4  Customer confirms. 5  System sets the listing status to DELISTED and removes it from the public board. 6  System shows success confirmation. |
| Alternative Sequences/Flows | A4a  Customer cancels the confirmation dialog – no action taken. |



#### UC-25 – List Movies / View Movie List

| Primary Actors | Guest / Customer / Schedule Manager / Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As any user, I want to view the full movie list so that I can browse currently showing and upcoming films. |
| Preconditions | None (public feature). |
| Postconditions | Movie list is displayed with filtering and pagination. |
| Normal Sequence/Flow | 1  User navigates to the Home Page or Movie List page. 2  System retrieves movies filtered by status (Now Showing / Coming Soon). 3  System displays movie cards (poster, title, genre, rating, duration) as defined by the frontend design. 4  User applies optional filters (genre, cinema, age rating, showing status). 5  System refreshes the list according to applied filters and search criteria. |
| Alternative Sequences/Flows | A5a  No movies match the filter -> system shows an empty-state message. |



#### UC-26 – Add New Movie

| Primary Actors | System Admin | Secondary Actors | File Storage Service |
| --- | --- | --- | --- |
| Description | As an Admin, I want to add a new movie to the system so that it can be scheduled and displayed to users. |
| Preconditions | Admin is logged in. |
| Postconditions | New movie record is created and (if marked active) visible on the public movie list. |
| Normal Sequence/Flow | 1  Admin navigates to Movie Management and clicks 'Add New Movie'. 2  System displays the movie creation form. 3  Admin fills in: title, description, genre(s), language, duration, director, cast, release date, status, age rating. 4  Admin uploads a poster image. 5  Admin optionally embeds a YouTube trailer URL. 6  Admin submits the form. 7  System validates all required fields and the image format/size. 8  System saves the movie record and uploads the poster to cloud storage. 9  System confirms success and shows the new movie in the list. |
| Alternative Sequences/Flows | A7a  Required field missing or invalid -> system highlights the problematic fields. A4a  Poster file exceeds size limit or wrong format -> system shows an upload-error message. |



#### UC-27 – Edit / Update a Movie

| Primary Actors | System Admin | Secondary Actors | File Storage Service |
| --- | --- | --- | --- |
| Description | As an Admin, I want to update movie information so that details remain accurate. |
| Preconditions | Admin is logged in; movie record exists. |
| Postconditions | Movie record is updated; changes are reflected immediately on the public site. |
| Normal Sequence/Flow | 1  Admin navigates to Movie Management and selects a movie. 2  System displays the movie detail/edit form with current data. 3  Admin modifies the desired fields. 4  Admin clicks 'Save'. 5  System validates all required fields. 6  System updates the record (and re-uploads the poster if changed). 7  System confirms success. |
| Alternative Sequences/Flows | A5a  Validation fails -> system highlights the errors and does not save. |



#### UC-28 – Remove / Delete a Movie

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to remove a movie so that it is no longer displayed or schedulable. |
| Preconditions | Admin is logged in; movie exists. |
| Postconditions | Movie is soft-deleted; it no longer appears in public lists but historical booking data is preserved. |
| Normal Sequence/Flow | 1  Admin navigates to Movie Management and selects a movie. 2  Admin clicks 'Delete'. 3  System checks whether the movie has any future showtimes. 4  System displays a confirmation dialog. 5  Admin confirms deletion. 6  System soft-deletes the movie (sets status = REMOVED). 7  System confirms success. |
| Alternative Sequences/Flows | A3a  Movie has future showtimes -> system blocks hard deletion and prompts Admin to cancel those showtimes first. A5a  Admin cancels the confirmation dialog -> no action is taken. |



#### UC-29 – Set Movie Public Status

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to set whether a movie is publicly visible so that I can control the release timeline. |
| Preconditions | Admin is logged in; movie record exists. |
| Postconditions | Movie's public status is updated; visibility on the public site changes accordingly. |
| Normal Sequence/Flow | 1  Admin opens the movie record. 2  Admin changes the 'Status' field following the allowed transition rules. 3  Admin saves the change. 4  System validates the transition and updates the status. 5  System refreshes the public movie list. |
| Alternative Sequences/Flows | A2a  Admin attempts to set status to 'Hidden' while the movie is currently showing -> system blocks the action and displays an error. A2b  Status transition rules: Hidden -> Coming Soon -> Now Showing. The system enforces this order. |



#### UC-30 – View Cinema Theater List

| Primary Actors | Guest / Customer / Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As any user, I want to view the list of cinemas so that I can find a location convenient for me. |
| Preconditions | None. |
| Postconditions | Cinema list is displayed with addresses and a map. |
| Normal Sequence/Flow | 1  User navigates to the Cinema page. 2  System retrieves all active cinemas. 3  System displays each cinema with name, address, phone, and operating hours. |
| Alternative Sequences/Flows | None |



#### UC-31 – Add/Edit Cinema

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to add or edit a cinema so that location information is up to date. |
| Preconditions | Admin is logged in. |
| Postconditions | Cinema record is created or updated. |
| Normal Sequence/Flow | 1  Admin navigates to Cinema Theater Management. 2  Admin clicks 'Add Cinema' (or selects an existing one to edit). 3  System displays the cinema form (name, address, latitude/longitude, phone, operating hours). 4  Admin fills in/updates the fields and submits. 5  System validates required fields. 6  System saves and confirms. |
| Alternative Sequences/Flows | A5a  Required field missing -> system highlights the error. |



#### UC-32 – List Users

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to view all registered users so that I can monitor and manage accounts. |
| Preconditions | Admin is logged in. |
| Postconditions | User list is displayed with search, filter, and sort options. |
| Normal Sequence/Flow | 1  Admin navigates to User Management. 2  System retrieves a paginated list of users. 3  Admin can search by name or email, and filter by role or status. 4  Admin can sort users by: registration date (newest/oldest), name (A-Z / Z-A), or status. 5  System updates the list in real time based on filters and sort criteria. |
| Alternative Sequences/Flows | None |



#### UC-33 – User Detail / Lock User / Change Role

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to view, lock, or change the role of a user account so that I can enforce access policies. |
| Preconditions | Admin is logged in; target user account exists. |
| Postconditions | User account status or role is updated. |
| Normal Sequence/Flow | 1  Admin selects a user from the User List. 2  System displays user details: profile information, role, status, and booking history. 3  Admin performs one of: (a) Lock/Unlock account, (b) Change role. 4  System requests confirmation for destructive actions. 5  Admin confirms. 6  System applies the change, invalidates active tokens if locking, and records the action in the Audit Log. |
| Alternative Sequences/Flows | A3b  Admin attempts to demote the last remaining Admin account -> system blocks the action with an error. |



#### UC-34 – Admin Dashboard

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want a dashboard overview so that I can monitor key business metrics at a glance. |
| Preconditions | Admin is logged in. |
| Postconditions | Dashboard KPIs are displayed. |
| Normal Sequence/Flow | 1  Admin navigates to the Admin Dashboard. 2  System displays key metrics: total bookings today, revenue today, seat fill rate. 3  Admin can drill down into any metric for details. |
| Alternative Sequences/Flows | None |



#### UC-35 – System Config – Ticket Hold Time

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to configure the ticket hold time so that seat reservation windows are correctly enforced. |
| Preconditions | Admin is logged in. |
| Postconditions | Configuration is saved and takes effect for new transactions. |
| Normal Sequence/Flow | 1  Admin navigates to 'System Configuration'. 2  System displays current settings: ticket hold time (default 10 min). 3  Admin modifies the desired values. 4  Admin saves the configuration. 5  System validates input ranges and saves. 6  System confirms; new rules apply to all future transactions. |
| Alternative Sequences/Flows | A5a  Invalid value entered (e.g., negative time or zero price) -> system shows a validation error. |



#### UC-36 – Promo Management – Create/Edit/Delete Promo Code

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to manage promotional discount codes so that marketing campaigns can be executed. |
| Preconditions | Admin is logged in. |
| Postconditions | Promo code is created, updated, or deleted. |
| Normal Sequence/Flow | 1  Admin navigates to 'Promo Management'. 2  System lists all promo codes with status, usage count, and expiry. 3  Admin clicks 'Create Promo' (or selects one to edit/delete). 4  System displays the promo form: code, type (percentage / fixed amount), value, minimum order amount, max uses, start date, end date. 5  Admin fills in/modifies fields and submits. 6  System validates all fields (positive values, end date > start date, code uniqueness). 7  System saves and confirms. |
| Alternative Sequences/Flows | A7a  Code is not unique -> system shows a duplicate-code error. A3a  Admin attempts to delete an active/currently-running promo code -> system blocks deletion. Only expired or inactive promo codes can be deleted. |



#### UC-37 – Report Dashboard – Revenue Report / Ticket Stats

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to view revenue and ticket statistics so that I can make data-driven decisions. |
| Preconditions | Admin is logged in. |
| Postconditions | Report data is displayed with export option (Excel). |
| Normal Sequence/Flow | 1  Admin navigates to 'Report Dashboard'. 2  System displays key reports: total revenue (daily/weekly/monthly), top movies by tickets sold, average seat fill rate, cancellation rate. 3  Admin applies filters (date range, cinema, movie). 4  System updates charts and tables accordingly. 5  Admin can click 'Export Excel' to download the report as an Excel file. |
| Alternative Sequences/Flows | None |



#### UC-38 – Export Excel (Reports)

| Primary Actors | System Admin | Secondary Actors | File Generation Service |
| --- | --- | --- | --- |
| Description | As an Admin, I want to export reports as an Excel file so that I can share data with stakeholders or perform further analysis. |
| Preconditions | Admin is on the Report Dashboard. |
| Postconditions | Excel report is generated and downloaded. |
| Normal Sequence/Flow | 1  Admin configures the desired filters on the Report Dashboard. 2  Admin clicks 'Export Excel'. 3  System generates a formatted Excel (.xlsx) report with the current filtered data. 4  Browser initiates the file download. |
| Alternative Sequences/Flows | None |



#### UC-39 – Admin Manage F&B Products

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to create, edit, and deactivate F&B combo products so that the selection available to customers remains up-to-date. |
| Preconditions | Admin is logged in and navigates to F&B Management. |
| Postconditions | F&B product catalogue is updated; changes reflected immediately on customer booking flow. |
| Normal Sequence/Flow | 1  Admin navigates to F&B Management. 2  Admin clicks 'Add Product' (or selects an existing product to edit). 3  System displays form: name, description, image, price (VND), category (Popcorn / Drink / Combo), status (Active/Inactive). 4  Admin fills in fields and submits. 5  System validates required fields and image size. 6  System saves the product and confirms success. |
| Alternative Sequences/Flows | A5a  Required field missing or price invalid – system highlights the error. A2a  Admin deactivates a product – it disappears from customer booking flow immediately. |



#### UC-40 – Room Management / Seat Layout Config

| Primary Actors | Schedule Manager | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Schedule Manager, I want to manage rooms and configure seat layouts so that showtimes can be correctly scheduled and seat maps displayed accurately. |
| Preconditions | Schedule Manager is logged in; parent cinema exists. |
| Postconditions | Room is created/updated with the correct seat configuration. |
| Normal Sequence/Flow | 1  Schedule Manager navigates to Room Management for a specific cinema. 2  Schedule Manager clicks 'Add Room' (or selects a room to edit). 3  System displays the room form: name, capacity, rows, columns, and room status (Active / Under Maintenance / Inactive). 4  Schedule Manager configures seat layout: assigns seat types (Normal / VIP / Couple) per row. 5  Schedule Manager sets the base price for the Normal seat type. VIP and Couple seats are priced automatically using configurable percentage multipliers applied to the Normal seat base price (e.g. VIP = Normal price x 150%, Couple = Normal price x 200%). 6  Schedule Manager submits. 7  System validates capacity and seat-type configuration and saves the seat layout configuration. 8  System confirms. |
| Alternative Sequences/Flows | A4a  Capacity or seat-type configuration is invalid -> system shows a validation error. A2a  Schedule Manager selects a room with status 'Active' to edit the seat layout -> system blocks layout editing. Only rooms with status 'Under Maintenance' or 'Inactive' can have their seat layout reconfigured. |



#### UC-41 – Create Schedule Manager Account

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to create a Schedule Manager account so that staff can manage showtimes without requiring email verification. |
| Preconditions | Admin is logged in. |
| Postconditions | Schedule Manager account is created and the staff member can log in immediately. |
| Normal Sequence/Flow | 1  Admin navigates to User Management -> Create Manager. 2  Admin fills in: full name, email, phone (optional), and assigned cinema. 3  System validates that the email is unique. 4  System generates a random 12-character temporary password. 5  System creates the account with the ScheduleManager role. No email verification is required. 6  System sends the login credentials (email + temporary password) to the new Manager's email address. 7  System confirms account creation. |
| Alternative Sequences/Flows | A3a  Email already exists -> system shows a duplicate-email error. |



#### UC-42 – Schedule Manager Dashboard – Seat Fill Statistics

| Primary Actors | Schedule Manager | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Schedule Manager, I want to view seat fill statistics so that I can optimize showtime scheduling. |
| Preconditions | Schedule Manager is logged in. |
| Postconditions | Seat fill statistics are displayed for the selected period. |
| Normal Sequence/Flow | 1  Schedule Manager opens the Dashboard. 2  System displays seat fill statistics: occupancy rate per showtime, per room, per week. 3  Schedule Manager applies filters (date range, cinema, room). 4  System refreshes the statistics view. |
| Alternative Sequences/Flows | None |



#### UC-43 – Monthly / Weekly / Yearly Schedule View

| Primary Actors | Schedule Manager | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Schedule Manager, I want to view the showtime schedule in weekly, monthly, or yearly views so that I can plan and review all showtimes at a glance. |
| Preconditions | Schedule Manager is logged in. |
| Postconditions | Showtime schedule is displayed in the selected calendar view. |
| Normal Sequence/Flow | 1  Schedule Manager navigates to 'Schedule View'. 2  System defaults to the Weekly view: a 7-column grid (Mon-Sun) with showtimes as blocks. 3  Schedule Manager can switch between Weekly, Monthly, and Yearly views using view-toggle controls. 4  Schedule Manager can navigate to previous or next periods. 5  Schedule Manager can filter by cinema or room. |
| Alternative Sequences/Flows | None |



#### UC-44 – Create Showtime

| Primary Actors | Schedule Manager | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Schedule Manager, I want to create a new showtime so that customers can book tickets for that screening. |
| Preconditions | Schedule Manager is logged in; movie and room records exist. |
| Postconditions | New showtime is saved and immediately visible for booking. |
| Normal Sequence/Flow | 1  Manager navigates to Schedule Management and clicks 'Create Showtime'. 2  System displays the showtime creation form and a time-slot selector showing available (white) and unavailable (blacked-out) slots. 3  Manager selects: movie, cinema, room, date, and start time from available slots. 4  System automatically calculates: End Time = Start Time + Movie Duration + 30-minute cleanup buffer. Timezone: GMT+07. 5  Manager sets pricing per seat type if different from system defaults. 6  Manager submits the form. 7  System validates: (a) no room-time overlap, (b) >=30-minute buffer enforced after previous showtime in same room. 8  System saves the showtime and shows it in the schedule calendar. |
| Alternative Sequences/Flows | A7a  Room-time conflict detected -> system shows an error; manager is redirected to the time-slot selector to choose an available slot. A7b  Insufficient buffer time -> system shows an error specifying the required buffer. |



#### UC-45 – Edit Showtime

| Primary Actors | Schedule Manager | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Schedule Manager, I want to edit an existing showtime so that I can correct scheduling errors. |
| Preconditions | Schedule Manager is logged in; showtime has no sold tickets. |
| Postconditions | Showtime is updated with the new details. |
| Normal Sequence/Flow | 1  Manager selects a showtime from the schedule. 2  System displays the showtime edit form. 3  Manager modifies the desired fields. 4  Manager submits. 5  System re-validates for conflicts. 6  System saves and confirms. |
| Alternative Sequences/Flows | A1a  Showtime already has sold tickets -> system shows the details in read-only mode; only cancellation is allowed. |



#### UC-46 – Cancel Showtime

| Primary Actors | Schedule Manager | Secondary Actors | Email Service |
| --- | --- | --- | --- |
| Description | As a Schedule Manager, I want to cancel a showtime so that it is removed from the schedule. Cancellation is only allowed when no tickets have been sold for the showtime. |
| Preconditions | Schedule Manager is logged in; showtime exists. |
| Postconditions | Showtime is cancelled (only allowed when no tickets have been sold). |
| Normal Sequence/Flow | 1  Schedule Manager selects a showtime and clicks 'Cancel Showtime'. 2  System checks if any tickets have been sold for this showtime. 3  If no tickets have been sold, system displays a confirmation dialog. 4  Schedule Manager confirms cancellation. 5  System cancels the showtime and marks it as CANCELLED. 6  System confirms the cancellation to the Manager. |
| Alternative Sequences/Flows | A2a  Tickets have already been sold for this showtime -> system immediately blocks cancellation and displays error: "Cannot cancel a showtime that already has sold tickets." The cancellation option is disabled and no further action is available. A4a  Manager cancels the confirmation dialog -> no action taken. |



#### UC-47 – Conflict Check / Time Slot Selector

| Primary Actors | Schedule Manager | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | This use case is <<include>>d automatically by UC-44 (Create Showtime) and UC-45 (Edit Showtime). When either parent use case submits showtime data, the system validates that no scheduling conflict exists in the same room. |
| Preconditions | Triggered internally when UC-44 or UC-45 submits showtime data. |
| Postconditions | Showtime is accepted (no conflict) or rejected with a conflict error. |
| Normal Sequence/Flow | 1  UC-44 or UC-45 submits showtime data (movie, room, start time, end time). 2  System queries all non-cancelled showtimes in the same room on the same date. 3  System checks whether the proposed time window (start time to end time + 15-min cleaning buffer) overlaps any existing showtime. 4  If no overlap: system returns a conflict-free status and the parent UC proceeds to save. 5  If overlap detected: system returns a conflict error listing the conflicting showtime(s). The parent UC displays the error and blocks saving. 6  Schedule Manager adjusts the time and re-submits; conflict check runs again. |
| Alternative Sequences/Flows | A3a  All time slots for the selected room and date are occupied -> system displays a message: "No available slots for this room on the selected date." Schedule Manager chooses a different date or room. |


#### UC-48 – View Concession Order QR

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer, I want to view the list of snack/beverage items (Concession items) attached to my booking along with the QR ticket after a successful payment so that I can conveniently pick up my snacks at the cinema. |
| Preconditions | Booking status is CONFIRMED (successful payment) ; the booking contains concession items. |
| Postconditions | Concession details and pickup information are displayed alongside the core QR ticket. |
| Normal Sequence/Flow | 1  Customer navigates to 'Booking History' or clicks the link from the confirmation email.  2  System displays the core QR ticket summary (movie, showtime, room, seats).  3  System retrieves and displays the attached Concession items list (item name, quantity, unit price, subtotal).  4  System displays specific pickup instructions (e.g., counter location, ready status) at the cinema. 5  Customer presents the screen to the theater staff for snack redemption. |
| Alternative Sequences/Flows | A3a Booking has no concession items -> System hides the Concession section or displays a placeholder text: "No food or beverages purchased with this booking." |



#### UC- 49 – Edit / Delete Resale Listing

| Primary Actors | Customer | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As a Customer who has listed a ticket on the community exchange, I want to edit the asking price/notes or completely delete (delist) my active listing so that I can update my plans or prevent misleading other users. (This extends UC-24 by adding Edit capabilities). |
| Preconditions | Customer is logged in; Customer is the verified owner of the listing ; the listing status is currently ACTIVE; the showtime has not yet started. |
| Postconditions | The listing is updated with new details or its status is set to DELETED/DELISTED on the public board. |
| Normal Sequence/Flow | 1 Customer navigates to 'My Bookings' or the 'Ticket Exchange Community' and selects their active listing.  2  System displays the current listing details along with 'Edit Listing' and 'Delete Listing' action buttons. 3  If Customer chooses to Edit: 3a1. Customer modifies the Asking Price or optional note.  3a2. Customer clicks 'Save Changes'. 3a3. System updates the record and displays a success message. 4  If Customer chooses to Delete: 3b1. Customer clicks 'Delete / Cancel Listing'.  3b2. System displays a confirmation dialog box.  3b3. Customer confirms the deletion.  3b4. System updates the status to DELISTED and removes it from the public exchange board. |
| Alternative Sequences/Flows | A1a  Showtime has already started or listing is EXPIRED -> System disables both Edit and Delete buttons, rendering the listing read-only. A1b  Listing has been hidden by Admin (HIDDEN) -> System displays a warning: "This listing has been hidden by administration and cannot be modified." Customer can only view or delete it. |




#### UC- 50 – Manage Resale Listings

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to manage the community marketplace by filtering, reviewing, and hiding inappropriate ticket listings so that I can enforce platform communication policies. |
| Preconditions | Admin is logged in. |
| Postconditions | The target listing's visibility status is changed to HIDDEN, masking it from general user discovery. |
| Normal Sequence/Flow | 1 Admin navigates to the 'Resale Management' dashboard from the Admin panel. 2  System displays a paginated tabular list of all active and past ticket resale listings. 3  Admin applies filters such as Movie Title, Cinema Location, Seller Account, or current Status. 4  System updates the listing view in real time based on the criteria. 5  Admin clicks on a specific listing row to view full details (including user notes and contact info).  6  Admin clicks the 'Hide Listing' button. 7  System prompts for a mandatory 'Reason for Hiding' input. 8  Admin enters the reason and submits. 9  System updates the listing status to HIDDEN, records the admin ID, timestamp (HiddenAt), and reason, then removes the card from public boards. |
| Alternative Sequences/Flows | A6a Listing is already EXPIRED or DELETED $\rightarrow$ System gray-out the 'Hide Listing' action button; Admin can only review historical data. |




#### UC- 51 – View Resale Listing Report

| Primary Actors | System Admin | Secondary Actors | System |
| --- | --- | --- | --- |
| Description | As an Admin, I want to view operational metrics and statistics regarding ticket resales filtered by movie and cinema locations so that I can analyze marketplace behavior and identify potential mass-scalping anomalies. |
| Preconditions | Admin is logged in |
| Postconditions | Analytical charts and aggregated statistics regarding user-to-user ticket exchanges are rendered on screen. |
| Normal Sequence/Flow | 1  Admin navigates to the 'Report Dashboard' and selects the 'Resale Reports' tab. 2  System displays high-level summary tiles (KPI cards): Total Listings Created, Active Volume, Hidden/Flagged Count, and Successful Expirations. 3  Admin configures dynamic filters: Date Range, Specific Movie, Cinema Theater, or Status.  4  Admin chooses a sorting dimension: Listing Count descending, Created Date, or Alphabetical by Movie. 5  System recalculates metrics and updates operational charts (e.g., Top Movies Listed for Resale, Resale Volume by Cinema Location). 6  Admin reviews the data on-screen. |
| Alternative Sequences/Flows | A5a Filter query returns no results $\rightarrow$ System displays an empty-state diagnostic chart pattern with the notification: "No resale data fits the selected timeline or criteria." |





#### UC-52 – View News List (Public)

| Primary Actors | Guest / Customer |
| --- | --- |
| Description | As any visitor, I want to browse the news article list so that I can stay informed about CineBook updates and promotions. |
| Preconditions | None (public feature). |
| Postconditions | Published news articles are displayed in a paginated grid. |
| Normal Flow | 1. User navigates to /news. 2. System retrieves all articles with status = Published, sorted by Publish Date descending. 3. System displays articles in a 3-column grid (desktop) with thumbnail, title, summary, and date. 4. User navigates between pages using Previous/Next pagination controls (12 articles per page). |
| Alternative Flows | A3a No published articles: system displays ‘No news articles yet. Check back soon!’ |


#### UC-53 – View News Detail (Public)

| Primary Actors | Guest / Customer |
| --- | --- |
| Description | As a visitor, I want to read the full content of a news article. |
| Preconditions | Article exists with status = Published. |
| Postconditions | Full article content is displayed to the user. |
| Normal Flow | 1. User clicks an article card on the News List page. 2. System loads /news/:id and displays: Title, Publication Date, Thumbnail image (if available), Full article content. 3. User can click ‘Back to News’ to return to the list. |
| Alternative Flows | A2a Article does not exist or status = Hidden: system returns a 404 not-found page. |


#### UC-54 – Admin: Create News Article

| Primary Actor | System Admin |
| --- | --- |
| Preconditions | 1. Actor authenticated as System Admin. 2. Actor is on /admin/news. |
| Postconditions | 1. New article record persisted in database. 2. If status = Published: article visible on /news immediately. |
| Normal Flow | 1. Admin clicks ‘Add New Article’. 2. Dialog/Modal opens with empty fields. 3. Admin fills in: Title (required), Summary (required), Content (required), Thumbnail URL (optional), Publish Date (optional, defaults to now), Status (Draft/Published). 4. Admin clicks ‘Save’. 5. System validates required fields and URL format for Thumbnail. 6. System creates the article record and closes the dialog. 7. New article appears at top of admin articles table. |
| Alternative Flows | A1 Validation fails: system highlights invalid fields; dialog remains open. A2 Admin cancels: dialog closes; no data saved. |


#### UC-55 – Admin: Edit News Article

| Primary Actor | System Admin |
| --- | --- |
| Preconditions | 1. Actor authenticated as System Admin. 2. Target article exists. |
| Postconditions | 1. Article record updated with new values. 2. Public page reflects changes immediately. |
| Normal Flow | 1. Admin clicks ‘Edit’ on an article row. 2. Dialog opens pre-filled with existing data. 3. Admin modifies fields and clicks ‘Save’. 4. System validates inputs, updates the record, and closes the dialog. |
| Alternative Flows | A1 Validation fails: same as UC-54 A1. A2 Admin cancels: same as UC-54 A2. |


#### UC-56 – Admin: Delete News Article

| Primary Actor | System Admin |
| --- | --- |
| Preconditions | 1. Actor authenticated as System Admin. 2. Target article exists. |
| Postconditions | 1. Article permanently removed from database. 2. Public /news/:id returns 404. |
| Normal Flow | 1. Admin clicks ‘Delete’ on target article row. 2. Confirmation dialog: ‘Delete article “[Title]”? This action cannot be undone.’ 3. Admin confirms. 4. System permanently deletes the record. 5. Table refreshes; deleted article no longer appears. |
| Alternative Flows | A1 Admin cancels confirmation: dialog closes; article is not deleted. |


#### UC-57 – Admin: Publish / Unpublish Article

| Primary Actor | System Admin |
| --- | --- |
| Preconditions | 1. Actor authenticated as System Admin. 2. Target article exists. |
| Postconditions | Article status is toggled. Published: visible on /news. Hidden: invisible on /news. |
| Normal Flow | 1. Admin clicks the status toggle (Publish/Hide) on the target article row. 2. System immediately updates the article’s status in the database. 3. Success toast: ‘Article published.’ or ‘Article hidden.’ 4. Table row status badge updates without full page reload. |
| Alternative Flows | None (toggle is immediate; no confirmation required). |


#### UC-58 – Admin: Configure VAT Rate

| Primary Actor | System Admin |
| --- | --- |
| Preconditions | Admin is authenticated and on the System Configuration screen. |
| Postconditions | New vat_rate value is saved in System Configuration and applied to all subsequent booking calculations. Historical bookings are unaffected. |
| Normal Flow | 1. Admin navigates to System Configuration. 2. Admin locates the ‘VAT Rate’ field (current value shown). 3. Admin enters a new decimal value (0.00–1.00). 4. Admin saves the configuration. 5. System validates the value range. 6. System updates the vat_rate key and confirms success. |
| Alternative Flows | A5a Value is non-numeric or outside [0.00, 1.00]: system shows ‘VAT rate must be a decimal between 0.00 and 1.00.’ |



## 3. Functional Requirements
This section describes all functional requirements of the CineBook system, organized by feature group. Each feature group lists its screens and functions along with field-level specifications.


### 3.1  Authentication & Account Management
Covers UC-01 through UC-07. All public and authenticated entry points for user identity and account settings.


#### 3.1.1  User Registration (UC-01)
Allows a Guest to create a new Customer account using email and OTP verification.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Full Name | Text input | Required. String, max 100 chars. |
| Email | Text input | Required. Must be a valid email format. Unique in the system. |
| Password | Password input | Required. Min 8 chars; must contain at least one uppercase letter, one digit, and one special character. |
| Confirm Password | Password input | Required. Must match Password field exactly. |
| OTP Code | Text input | 6-digit numeric code sent to registered email. Valid for 10 minutes. User has 3 attempts before lockout. |
| Register Button | Button | Disabled until all fields pass client-side validation. Triggers OTP email on success. |
| Verify OTP Button | Button | Submits OTP; on success redirects to Login screen. |



#### User Login (UC-02)
Allows all roles (Customer, Schedule Manager, System Admin) to authenticate via email and password.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Email | Text input | Required. Validated as email format. |
| Password | Password input | Required. Show/hide toggle available. |
| Login Button | Button | Submits credentials. On 5 consecutive failures the account is locked for 30 minutes (BR-12). |
| Forgot Password link | Hyperlink | Navigates to UC-03 Forgot Password flow. |
| Session | System | System authenticates the user and starts a secure session on success. |
| Sign in with Google Button | OAuth button | Displayed below the standard Login form with a separator. Styled per Google Brand Guidelines (white button, Google logo, text ‘Sign in with Google’). Clicking initiates the OAuth 2.0 flow as described in UC-02a. Visible to Guest and Customer actors. |



#### 3.1.3  Forgot Password / Reset Password (UC-03)
Allows any user to reset their password via a temporary password sent to their registered email.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Email | Text input | Required. System verifies email exists; no error revealed if email not found (security best practice). |
| Temporary Password Email | System action | System generates a random 12-character temporary password and emails it within 60 seconds. |
| Temporary Password Validity | System rule | Valid for 30 minutes and single-use. Expired or used tokens are rejected. |



#### 3.1.4  Change Password (UC-04)
Allows a logged-in user to change their own password.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Current Password | Password input | Required. System verifies against stored hash. |
| New Password | Password input | Required. Must meet password policy (min 8 chars, uppercase, digit, special char). Must differ from current password. |
| Confirm New Password | Password input | Required. Must match New Password. |
| Error - same password | System message | Inline error: "New password must not be the same as the current password." |
| Save Button | Button | Disabled until all fields are filled. On success, all existing sessions except the current one are invalidated. |



#### 3.1.5  User Logout (UC-05)
Terminates the current session and invalidates the access and refresh tokens on the server side. User is redirected to the Login screen. No confirmation dialog required.


#### 3.1.6  Edit Profile (UC-06)
Allows any logged-in role to update their own personal information.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Full Name | Text input | Required. String, max 100 chars. |
| Phone Number | Text input | Optional. Must match E.164 format (e.g. +84xxxxxxxxx). Max 15 digits. |
| Date of Birth | Date picker | Optional. Must be a past date. User must be at least 13 years old. |
| Avatar / Profile Photo | File upload | Optional. JPEG or PNG only. Max file size 2 MB. Resized to 256x256 px server-side. |
| Save Button | Button | Persists changes. Shows success toast notification on completion. |



#### 3.1.7  Update Location / Delivery Address (UC-07)
Allows a Customer to set or update their location so that nearby cinemas are prioritised in cinema listings and the map view.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Address Search Field | Autocomplete text input | Queries map service API on each keystroke (debounced 300 ms). Shows up to 5 suggestions. |
| Use My Current Location | Button | Requests Geolocation API. Requires browser permission. Accuracy tolerance: ±50 m. |
| Map View | Embedded map | Displays a draggable pin at the selected coordinates. Zoom level 14 by default. |
| Latitude / Longitude | System (hidden) | Stored as decimal degrees, precision 6 decimal places. |
| Formatted Address | System (display) | Human-readable address returned by the map service, max 200 chars. |
| Save Location Button | Button | Disabled until a location is selected. Persists to the Customer profile and refreshes cinema proximity order. |



### 3.2  Movie Management (Admin) — UC-25 to UC-29
System Admin manages the movie catalogue. The movie list is the central reference for showtime scheduling.


#### 3.2.1  Movie List Screen (UC-25)
Displays all movies. Available to all roles; Admin additionally sees management actions.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Search Bar | Text input | Searches by title (partial match, case-insensitive). |
| Filter: Genre | Dropdown (multi-select) | Values: Action, Comedy, Drama, Horror, Sci-Fi, Animation, Documentary, Other. |
| Filter: Status | Dropdown | Values: All, Public, Hidden. Default: All. |
| Movie Card | Grid item | Shows poster thumbnail (180x270 px), title, genre tags, duration (minutes), release year, and public status badge. |
| Pagination | Paginator | 20 items per page. Sorted by release date descending by default. |
| Add New Movie (Admin) | Button | Navigates to Add New Movie form (UC-26). Visible to Admin only. |



#### 3.2.2  Add / Edit Movie (UC-26, UC-27)
Admin creates a new movie or modifies an existing one.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Title | Text input | Required. String, max 200 chars. Must be unique within the system. |
| Description / Synopsis | Textarea | Required. Max 2000 chars. |
| Genre | Multi-select dropdown | Required. At least one genre must be selected. Max 3 genres. |
| Duration | Number input | Required. Integer, 30–360 minutes. |
| Release Date | Date picker | Required. Can be a future date for upcoming movies. |
| Age Rating | Dropdown | Required. Values: G, PG, PG-13, R, NC-17. |
| Language | Dropdown | Required. Values: Vietnamese, English, Korean, Japanese, Other. |
| Subtitles | Dropdown (multi-select) | Optional. Same value set as Language. |
| Poster Image | File upload | Required for new movies. JPEG or PNG, max 5 MB. Stored and served via CDN. |
| Trailer URL | Text input | Optional. Must be a valid YouTube or Vimeo URL. |
| Director | Text input | Optional. Max 100 chars. |
| Cast | Text input (comma-separated) | Optional. Max 500 chars total. |



#### 3.2.3  Remove Movie (UC-28)
Admin soft-deletes a movie. A movie with at least one upcoming showtime cannot be deleted until all associated showtimes are cancelled. A confirmation dialog must be shown before deletion.


#### 3.2.4  Set Movie Public Status (UC-29)
Admin toggles a movie's visibility between Public and Hidden. Hidden movies do not appear in the Customer-facing home page or search results but remain accessible via direct URL to Admins. Status change takes effect immediately without page reload.


### 3.3  Cinema & Room Management (Admin / Manager) — UC-30 to UC-40


#### 3.3.1  Cinema List & Add/Edit Cinema (UC-30, UC-31 partial)
System Admin manages cinema entities. Each cinema contains one or more rooms.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Cinema Name | Text input | Required. String, max 150 chars. Must be unique. |
| Address | Text input | Required. Max 300 chars. |
| City / Province | Dropdown | Required. Pre-populated list of Vietnamese provinces. |
| Latitude / Longitude | Map pin picker | Required. Set via embedded map or manual entry. Used for proximity search. |
| Phone | Text input | Optional. E.164 format. |
| Status | Toggle / Dropdown | Values: Active, Inactive. Inactive cinemas are hidden from Customer view. |



#### 3.3.2  Room Management / Seat Layout Config (UC-31)
Manager configures rooms and seat layouts for a cinema. Pricing uses a base Normal seat price with percentage multipliers for higher tiers.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Room Name | Text input | Required. String, max 50 chars. Unique within a cinema. |
| Rows | Number input | Required. Integer, 1–30. |
| Columns | Number input | Required. Integer, 1–30. Total seats (Rows x Columns) must not exceed 500. |
| Room Status | Dropdown | Values: Active, Under Maintenance, Inactive. Layout editing locked when Active. |
| Seat Type Assignment | Grid UI | Manager assigns each seat to a type: Normal, VIP, or Couple. Saved as a JSON layout map. |
| Normal Seat Base Price | Currency input | Required. Positive integer, in VND. Minimum 10,000 VND. This is the anchor price. |
| VIP Price Multiplier | Percentage input | System default: 150%. Configurable by Admin (System Config UC-35). Auto-calculated: Normal price x VIP %. |
| Couple Price Multiplier | Percentage input | System default: 200%. Configurable by Admin (System Config UC-35). Auto-calculated: Normal price x Couple %. |
| Calculated Prices (display) | Read-only | VIP and Couple effective prices are shown in real-time as Manager adjusts the base price. |



### 3.4  User Management (Admin) — UC-40 to UC-33


#### 3.4.1  User List (UC-40)
Admin views a paginated list of all system users with search and filter capabilities.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Search | Text input | Searches by name or email (partial match). |
| Filter: Role | Dropdown | Values: All, Customer, Schedule Manager, System Admin. |
| Filter: Status | Dropdown | Values: All, Active, Inactive, Locked. |
| User Table Columns | Table | Columns: #, Full Name, Email, Role, Registration Date, Status, Actions (View / Activate / Deactivate). |
| Pagination | Paginator | 20 items per page. Sorted by registration date descending. |



#### 3.4.2  User Detail (UC-32)
Admin views a read-only profile of any user including name, email, role, registration date, status, total bookings, and last login timestamp. Admin can change the user's status (Activate / Deactivate / Unlock).


#### 3.4.3  Create Schedule Manager Account (UC-33)
Admin creates accounts for Schedule Managers. A temporary password is generated and emailed to the new user.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Full Name | Text input | Required. Max 100 chars. |
| Email | Text input | Required. Valid email; must not already exist in the system. |
| Assigned Cinema | Dropdown | Required. Manager is scoped to one cinema at account creation time. |
| Temporary Password | System-generated | 12-character random string sent via email. User must change it on first login. |



### 3.5  Schedule Management (Schedule Manager) — UC-41 to UC-47


#### 3.5.1  Schedule Manager Dashboard (UC-41)
Landing page for Schedule Managers. Displays: today's showtime count, upcoming showtimes in the next 7 days, rooms under maintenance, and a quick-action panel (Create Showtime, View Schedule).


#### 3.5.2  Schedule View (UC-42)
Weekly/monthly calendar view of all showtimes for the Manager's assigned cinema. Each showtime block shows: movie title, room name, start time, and seat availability percentage.

| Field / Component | Type | Specification |
| --- | --- | --- |
| View Mode | Toggle | Values: Week view, Month view. Default: Week. |
| Filter: Room | Dropdown | Filter schedule by specific room. |
| Filter: Movie | Dropdown | Filter by movie title. |
| Showtime Block | Calendar slot | Click opens showtime detail/edit panel. |
| Colour Coding | System | Green: >50% seats available; Yellow: 20–50%; Red: <20%; Grey: cancelled. |



#### 3.5.3  Create Showtime (UC-43)
Manager schedules a new showtime. The system runs a conflict check before saving.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Movie | Dropdown / Search | Required. Lists only Public status movies. |
| Room | Dropdown | Required. Lists Active rooms of the assigned cinema only. |
| Start Date & Time | DateTime picker | Required. Must be at least 30 minutes in the future. |
| End Time | Read-only (calculated) | Start Time + movie duration + 15-minute cleaning buffer. |
| Price Override (Normal) | Currency input | Optional. Overrides room base price for this showtime only. Min 10,000 VND. |
| Conflict Check | System action | Automatic on submit. Blocks overlapping showtimes in the same room (including cleaning buffer). |



#### 3.5.4  Edit Showtime (UC-44)
Manager edits showtime details. Editing is blocked if any ticket has been purchased. Only future showtimes can be edited. All conflict checks re-run on save.


#### 3.5.5  Cancel Showtime (UC-45)
Manager cancels a scheduled showtime. Cancellation is only permitted when no tickets have been sold. Once cancelled, the showtime status is set to CANCELLED permanently and it cannot be reactivated.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Cancel Button | Button | Visible on showtime detail panel. Triggers pre-check. |
| Tickets-Sold Pre-check | System rule | If any ticket exists with status BOOKED or CHECKED_IN: system shows error "Cannot cancel a showtime that already has sold tickets." and aborts. |
| Confirmation Dialog | Modal | Displayed only when no tickets sold. Contains showtime summary and Confirm / Cancel buttons. |



#### 3.5.6  Showtime Conflict Check (UC-47, sub-UC)
Automatic system rule triggered on create and edit. A conflict occurs when the proposed showtime's time window (start to end + 15-min buffer) overlaps any existing non-cancelled showtime in the same room. The system displays a list of conflicting showtimes and blocks submission until conflicts are resolved.


### 3.6  Customer Booking Flow — UC-08 to UC-16


#### 3.6.1  Home Page (UC-08)
Entry point for Customers. Displays: now-showing movies (Public, with at least one upcoming showtime), coming-soon movies, a promotional banner carousel, and quick links to the Cinema Map.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Now Showing Section | Horizontal scroll list | Movies with showtimes in the next 14 days. Max 10 displayed; 'See All' link. |
| Coming Soon Section | Horizontal scroll list | Movies with future release date and no scheduled showtimes yet. |
| Promotional Banner | Auto-sliding carousel | Up to 5 banners. Each links to a specific movie detail or promo page. Slide interval: 5 seconds. |
| Location-Aware Greeting | Display text | If Customer has saved location: "Cinemas near [city]". Else: "Set your location for nearby cinemas." |



#### 3.6.2  Movie Detail Page (UC-09)
Displays full movie information and allows the Customer to initiate booking.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Movie Info Panel | Display | Poster, title, genre(s), duration, release date, age rating, director, cast, synopsis. |
| Trailer Player | Embedded video | YouTube/Vimeo embed. Displayed if Trailer URL is set. |
| Average Rating | Star display | 1–5 stars calculated from verified reviews. Shows review count. |
| Showtime Selector | Date tabs + showtime buttons | Filter by date (next 7 days) and cinema. Each button shows start time and available seat count. |
| Book Now Button | Button | Navigates to Cinema Selection (UC-09) or directly to Seat Map if cinema already selected. |



#### 3.6.3  Select Cinema & Showtime (UC-10)
Customer selects a cinema and showtime for the chosen movie. Cinemas are sorted by distance from the Customer's saved location (if set); otherwise alphabetically.


#### 3.6.4  Seat Map & Seat Selection (UC-11)
Interactive seat selection screen for a specific showtime.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Seat Map Grid | Interactive grid | Each seat shows type (Normal / VIP / Couple) and status: Available (clickable), Occupied (greyed-out), Selected (highlighted). |
| Seat Selection Limit | System rule | Customer may select 1–8 seats per transaction. |
| Real-time Updates | WebSocket / polling | Seat availability refreshes every 10 seconds to reflect concurrent bookings. |
| Seat Hold Timer | Countdown display | Selected seats are held for 10 minutes. Timer visible on screen. Expired hold releases seats. |
| Price Summary | Display | Shows per-seat price by type and total. Updates live as seats are selected/deselected. |
| Proceed to Payment | Button | Active only when ≥1 seat selected. Navigates to Apply Promo (UC-11). |



#### 3.6.5  Apply Promotional Code (UC-12)
Customer optionally enters a promotional code before payment.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Promo Code Field | Text input | Optional. Case-insensitive. Max 20 chars. |
| Apply Button | Button | Validates code: checks existence, expiry date, usage limit, and minimum order value. |
| Discount Display | Read-only | Shows discount type (% or fixed VND), discount amount, and new total. Updated live. |
| Remove Code Link | Hyperlink | Removes applied promo and restores original total. |



#### 3.6.6  Payment (UC-13)
Customer completes payment for selected seats.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Order Summary | Display | Movie title, cinema, showtime, seat numbers, seat types, subtotal, discount, and grand total. |
| Payment Method | Radio buttons | Options: VNPay, MoMo, Bank Transfer, Credit/Debit Card (Visa, Mastercard). |
| Pay Now Button | Button | Redirects to payment gateway. Transaction timeout: 15 minutes. |
| Payment Status Handling | System | On success: booking status = CONFIRMED; on failure/timeout: seats released, booking status = FAILED. |
| Booking Confirmation Email | System action | Sent within 60 seconds of successful payment. Contains booking reference, QR code, and seat details. |



#### 3.6.7  QR Ticket / E-Ticket (UC-14)
After successful payment, the Customer receives an e-ticket screen with a unique QR code per seat. Each QR code encodes: booking ID, showtime ID, seat ID, and a cryptographic hash for validation. QR codes are valid only for the specific showtime date and become void after check-in.


#### 3.6.8  Booking History (UC-15)
Customer views a list of all their past and upcoming bookings sorted by booking date descending.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Booking List | Table | Columns: Movie Title, Cinema, Showtime Date/Time, Seats, Total Paid, Status (Confirmed / Checked-In / Failed / Cancelled). |
| Filter: Status | Dropdown | All, Upcoming, Past, Cancelled. |
| View Ticket Button | Button per row | Navigates to QR Ticket screen for that booking (UC-15). |



#### 3.6.9  View / Download QR Code (UC-16)
Customer views the QR ticket(s) for a specific booking and can download them as a PNG image. Download generates a single image file containing all seat QR codes for that booking.


### 3.7  Customer Discovery & Reviews — UC-17 to UC-19


#### 3.7.1  Write / Edit Review (UC-17)
A Customer who has a CHECKED_IN booking for a movie may submit one review per movie.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Star Rating | 1–5 star selector | Required. Integer 1–5. |
| Review Text | Textarea | Optional. Max 1000 chars. |
| Submit Button | Button | Disabled until star rating is selected. One review per (Customer, Movie) pair. |
| Edit / Delete Own Review | Link | Customer can edit or delete their own review at any time. Editing is limited to 30 days after the watched showtime. |



#### 3.7.2  Cinema Map View (UC-18)
Interactive map displaying all Active cinemas as pins. If Customer has a saved location, a radius indicator is shown. Clicking a pin shows the cinema name, address, and a 'View Showtimes' shortcut.


#### 3.7.3  Seat Availability Display (UC-19)
Real-time indicator of available seats for a showtime displayed on the showtime selector (UC-08, UC-09). Shown as: count of available seats and a colour-coded bar (Green / Yellow / Red per the same thresholds as the Manager schedule view).


### 3.8  Admin Configuration & Reports — UC-19 to UC-36


#### 3.8.1  

#### 3.8.1a  Dashboard Filters (updated)

| Field / Component | Type | Specification |
| --- | --- | --- |
| Time Period Dropdown | Dropdown (single-select) | Options: ‘This Week’ | ‘This Month’ | ‘This Quarter’ | ‘Custom Range’. Default: ‘This Month’. All Dashboard widgets update simultaneously on change. Period boundaries per BR-08. |
| Custom Range Picker | Date range picker | Shown only when ‘Custom Range’ is selected. Max range: 12 months. Future dates disabled. Applies on ‘Apply’ button click. |
| Revenue View Toggle | Toggle / Switch | Two states: ‘Pre-Tax Revenue’ (default) | ‘After-Tax Revenue’. Toggles which revenue value (Total_Before_Tax or Total_After_Tax per BR-05/BR-06) is displayed across all KPI cards and trend charts. |
| Cinema Filter | Dropdown (optional) | Values: ‘All Cinemas’ (default) | individual cinema names. Filters all metrics to a specific cinema branch. |


#### 3.8.1b  KPI Cards (updated)

| Field / Component | Type | Specification |
| --- | --- | --- |
| Total Pre-Tax Revenue | Metric card | SUM(Total_Before_Tax) for all CONFIRMED bookings in period. Displayed in VND with thousands separator and period-over-period delta. Highlighted when Revenue View Toggle = Pre-Tax (default). |
| Total After-Tax Revenue | Metric card | SUM(Total_After_Tax) for all CONFIRMED bookings in period. Displayed in VND. Highlighted when Revenue View Toggle = After-Tax. |
| Total Tickets Sold | Metric card | COUNT(BookingSeats) linked to CONFIRMED Bookings in period. Includes Normal, VIP, and Couple seats. |
| AOV (Average Order Value) | Metric card | AOV = SUM(Total_Before_Tax) / COUNT(CONFIRMED Bookings in period). Displayed in VND. Tooltip: ‘Average Pre-Tax Revenue per confirmed booking’. If zero bookings in period: display ‘N/A’. When After-Tax toggle active: uses SUM(Total_After_Tax) and label updates to ‘AOV (After-Tax)’. |


#### 3.8.1c  Trend Charts (updated)

| Field / Component | Type | Specification |
| --- | --- | --- |
| Revenue Over Time Chart | Line / Bar chart | X-axis: time dimension per BR-08 (daily for Weekly/Monthly/Custom ≤31 days; monthly for Quarterly/Custom >31 days). Y-axis: revenue per active toggle. Optional comparison overlay for same period last year (dashed line). |
| Movie Sales Ranking | Tabbed table (2 tabs) | Tab 1 Best-Selling: Top 5 movies by ticket count DESC. Tab 2 Worst-Selling: Top 5 movies by ticket count ASC (eligibility per BR-07). Columns: Rank, Movie Title, Total Tickets Sold, Total Revenue. Respects active Time Period Filter. |
| Revenue Composition Pie Chart | Doughnut / Pie chart | Two segments: ‘Ticket Revenue’ (Total_Tickets_Amount) and ‘F&B Revenue’ (Total_FNB_Amount). Labels show segment name, VND amount, and percentage. Hover tooltip shows exact value. Always uses nominal VND amounts regardless of Pre/After-Tax toggle. |


#### Admin Dashboard (UC-34)
Executive summary for System Admin. Displays: total users (by role), total revenue (current month vs previous month), total bookings (current month), top 5 movies by revenue, and top 3 cinemas by booking volume.


#### 3.8.2  System Configuration (UC-35)
Admin manages global system settings stored as key-value pairs.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Setting Key | Read-only text | Unique identifier, snake_case, max 50 chars. Set at system initialisation. |
| Setting Value | Text input | Editable. Max 200 chars. Validated per setting type (e.g., numeric for multipliers). |
| Setting Type | Dropdown | Values: String, Integer, Decimal, Boolean, JSON. |
| Description | Textarea (read-only) | Explains the purpose of the setting and its valid range. |
| Key system settings | Examples | seat_vip_multiplier (default 1.50), seat_couple_multiplier (default 2.00), seat_hold_minutes (default 10), otp_validity_minutes (default 10), max_seats_per_booking (default 8). |
| vat_rate | Decimal | Stores the VAT rate applied to all bookings. Default value: 0.10 (= 10%). Valid range: 0.00 to 1.00. Admin can update at any time; new rate takes effect on all subsequent booking calculations. Historical bookings are unaffected. Validation: reject non-numeric input or values outside [0.00, 1.00]; display error ‘VAT rate must be a decimal between 0.00 and 1.00.’ |



#### 3.8.3  Promotional Code Management (UC-35)
Admin creates, edits, and deactivates promotional discount codes.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Promo Code | Text input | Required. Unique, 4–20 alphanumeric chars, uppercase enforced. |
| Discount Type | Dropdown | Required. Values: Percentage (%), Fixed Amount (VND). |
| Discount Value | Number input | Required. For %: 1–100. For fixed: min 1,000 VND. |
| Minimum Order Value | Currency input | Optional. Booking total must meet or exceed this to use the code. |
| Usage Limit | Number input | Optional. Total redemptions allowed. Blank = unlimited. |
| Validity Period | Date range picker | Required. Start date and end date. Code inactive outside this range. |
| Status | Toggle | Active / Inactive. Inactive codes are rejected at checkout. |



#### 3.8.4  Revenue & Booking Report Dashboard (UC-37)
Admin views analytics charts and summary metrics. Filters apply to all widgets simultaneously.

| Field / Component | Type | Specification |
| --- | --- | --- |
| Time Period Filter | Dropdown + Date range picker | Options: This Week | This Month | This Quarter | Custom Range. Default: This Month. Triggers full dashboard data refresh on change. Period boundaries per BR-08. |
| Cinema Filter | Dropdown | All cinemas or specific cinema. Default: All Cinemas. |
| Revenue View Toggle | Toggle switch | Pre-Tax Revenue (default) | After-Tax Revenue. Affects all revenue-displaying components. See BR-06. |
| KPI Card — Total Pre-Tax Revenue | Metric card | SUM(Total_Before_Tax) for CONFIRMED bookings in period. Formatted in VND with delta indicator vs previous equivalent period. |
| KPI Card — Total After-Tax Revenue | Metric card | SUM(Total_After_Tax) for CONFIRMED bookings. Represents actual cash received. Used for accounting reconciliation (BR-06). |
| KPI Card — Total Tickets Sold | Metric card | COUNT of BookingSeats in CONFIRMED bookings within the period. |
| KPI Card — AOV | Metric card | AOV = SUM(Total_Before_Tax) / COUNT(CONFIRMED Bookings). Displays ‘N/A’ when zero bookings. Switches to SUM(Total_After_Tax) when After-Tax toggle is active. |
| Revenue Over Time Chart | Line chart | X-axis: time units per BR-08 granularity. Y-axis: revenue per active toggle. One data point per unit. Hoverable tooltips showing exact value. |
| Movie Sales Ranking Widget | Tabbed table (2 tabs) | Tab 1 ‘Best-Selling’: Top 5 by tickets sold DESC. Tab 2 ‘Worst-Selling’: Top 5 by tickets sold ASC (eligibility per BR-07). Both tabs show: Rank, Title, Tickets Sold, Revenue. |
| Revenue Composition Pie Chart | Doughnut chart | Two segments: Total_Tickets_Amount vs Total_FNB_Amount. Shows proportion of ticket revenue to F&B revenue within period. Labels show VND amount and percentage. |
| Bookings by Status Pie Chart | Pie chart | Breakdown of all bookings by status: CONFIRMED, CHECKED_IN, FAILED, CANCELLED, EXPIRED. |
| Export to Excel Button | Button | Exports the currently filtered data as .xlsx (UC-38). Sheets: Revenue Summary, Daily/Weekly Revenue Breakdown, Movie Rankings, Bookings by Status. |



#### 3.8.5  Export Report to Excel (UC-36)
Admin exports the filtered report data as an .xlsx file. The file contains: one sheet per data dimension (Revenue by Day, Revenue by Movie, Bookings by Cinema). Column headers match the on-screen table columns. Numeric fields use number cell format for compatibility with Excel formulas.


### 3.9  F&B Combo — UC-20, UC-39
Covers the F&B selection step in the Customer booking flow and the Admin management of F&B products.

#### 3.9.1  F&B Combo Selection Screen (UC-20)

| Field / Component | Type | Specification |
| --- | --- | --- |
| F&B Product Card | Display grid | Shows combo image, name, description, price (VND). Max 12 products displayed. Category tabs: All / Popcorn / Drink / Combo. |
| Quantity Selector | Number stepper | Min 0, Max 10 per item per order. |
| F&B Promo Code | Text input | Optional. Same validation rules as ticket promo codes. Discount applies to F&B subtotal only. |
| F&B Subtotal | Display | Calculated in real-time as customer changes quantities. |
| Skip Button | Button | Skips F&B step entirely; proceeds to Payment with original seat subtotal. |
| Proceed to Payment | Button | Adds F&B items to order and navigates to Payment screen. |



#### 3.9.2  F&B Product Management Admin (UC-39)

| Field / Component | Type | Specification |
| --- | --- | --- |
| Product Name | Text input | Required. String, max 100 chars. Must be unique. |
| Description | Textarea | Optional. Max 500 chars. |
| Category | Dropdown | Required. Values: Popcorn, Drink, Combo. |
| Price | Currency input | Required. Positive integer in VND. Minimum 5,000 VND. |
| Image | File upload | Optional. JPEG/PNG, max 2 MB. |
| Status | Toggle | Active / Inactive. Inactive products are hidden from customer view. |



### 3.10  P2P Ticket Exchange & Community — UC-21, UC-22, UC-23, UC-24
Provides a community marketplace where Customers can list purchased tickets for exchange or pass-on to other users. CineBook facilitates discovery only; the actual transfer is handled between users directly.

#### 3.10.1  Ticket Exchange Community Board (UC-21, UC-22)

| Field / Component | Type | Specification |
| --- | --- | --- |
| Listing Card | Display | Shows movie poster, title, cinema, showtime date/time, seat type, asking price (or FREE), and truncated note. |
| Filter: Movie | Dropdown / Search | Filter listings by movie title. |
| Filter: Cinema | Dropdown | Filter by cinema location. |
| Filter: Date | Date picker | Filter showtime date range. |
| Listing Detail | Modal / Page | Full listing: movie, cinema, showtime, seat type, asking price, note, contact methods. |
| Contact: Phone | Display + Copy | Masked by default (e.g. 09x xxxx x89); revealed on click. User must be logged in. |
| Contact: Facebook | Hyperlink | Opens seller Facebook profile in a new tab. |
| Pass / List Ticket | Button (in My Bookings) | Visible for CONFIRMED future bookings that are not already listed. |
| Listing Form: Note | Textarea | Optional. Max 200 chars. |
| Asking Price | Currency input | Optional. 0 = Free Pass. Max 2x original ticket price enforced to prevent scalping. |
| Delist Button | Button | Removes the listing. Only visible to the listing owner. |



### 3.11  News Management – UC-52 to UC-57

#### 3.11.1  Public News List Screen (UC-52) — /news

| Field / Component | Type | Specification |
| --- | --- | --- |
| Main Navbar Link | Navigation link | A ‘News’ link is added to the main navigation bar and is visible to all actors (Guest included). Routes to /news. |
| News Grid | Responsive grid | Displays all Published articles in a 3-column grid (desktop), 2-column (tablet), 1-column (mobile). Sorted by Publish Date descending. |
| Article Card | Card component | Each card shows: Thumbnail image (fallback placeholder if URL invalid), Title (max 2 lines, truncated), Summary (max 3 lines, truncated), Publication date (formatted: DD MMM YYYY). |
| Card Click | Navigation | Clicking any area of the card navigates to /news/:id (UC-53). |
| Pagination | Paginator | 12 articles per page. Standard Previous / Next controls. |
| Empty State | Inline message | If no published articles exist: ‘No news articles yet. Check back soon!’ |


#### 3.11.2  Public News Detail Screen (UC-53) — /news/:id

| Field / Component | Type | Specification |
| --- | --- | --- |
| Article Title | Heading (H1) | Displays the article’s full title. |
| Publication Date | Display text | Formatted: DD MMM YYYY. |
| Thumbnail Image | Image | Full-width banner. Max height 400 px; object-fit cover. Hidden if URL is empty. |
| Article Content | Rich text area | Renders the article’s full content (plain text or HTML-safe rendered). Supports line breaks and basic formatting. |
| Back to News Button | Link / Button | Navigates back to /news (News List). |
| 404 Handling | Error page | If :id does not exist or article is Hidden: display standard 404 not-found page. |


#### 3.11.3  Admin News Management Screen — /admin/news

| Field / Component | Type | Specification |
| --- | --- | --- |
| Admin Sidebar Link | Navigation item | A ‘News’ menu item is added to the Admin sidebar, linking to /admin/news. Visible only to System Admin role. |
| Articles Table | Data table | Columns: #, Thumbnail (50x50 preview), Title, Status badge (Published / Hidden), Publish Date, Actions. |
| Actions Column | Button group | Each row has: Edit (pencil icon), Delete (trash icon), Publish/Hide toggle (eye icon). Trigger UC-55, UC-56, UC-57 respectively. |
| Add New Article Button | Primary button | Opens the Create Article dialog (UC-54). |
| Create / Edit Dialog | Modal form | Fields: Title (required, max 200 chars), Summary (required, max 500 chars), Content (required, max 10,000 chars), Thumbnail URL (optional, URL format), Publish Date (date picker, defaults to now), Status (Draft / Published). |
| Delete Confirmation | Modal dialog | As specified in UC-56 Normal Flow Step 2. |
| Status Filter | Dropdown | Values: All / Published / Hidden. Filters table rows client-side. |



## 4. Non-Functional Requirements

### 4.1  Security

| ID | Requirement | Target / Metric |
| --- | --- | --- |
| NFR-S-01 | Authentication & session management | All user sessions are managed via JWT (HS256). Access token TTL: 24 hours. Refresh token TTL: 7 days with rotation on refresh. Accounts are locked for **30 minutes** after 5 consecutive failed login attempts (see BR-12). |
| NFR-S-02 | Password storage | Passwords are stored as bcrypt hashes with cost factor ≥ 12. Plain-text passwords are never logged or stored anywhere in the system. |



## 5. Requirement Appendix

### 5.1 Business Rules

| ID | Rule Definition |
| --- | --- |
| BR-01 | Base Ticket Pricing. Time-of-day multiplier (Time_Multiplier): Showtimes starting before 17:00 use a lower base price tier; showtimes starting at or after 17:00 use a higher base price tier. The exact price values for each tier are configured per Room (Normal Seat Base Price) and can be overridden per Showtime. Day-of-week / holiday multiplier: Showtimes on Saturday, Sunday, or any public holiday/Tet holiday apply Day_Multiplier = 1.2 (+20% surcharge). Regular weekdays (Monday-Friday, non-holiday) use Day_Multiplier = 1.0. Holiday dates are maintained as a configurable list in System Configuration (key: holiday_dates, type: JSON array of YYYY-MM-DD strings). |
| BR-02 | Seat Type Price Multipliers. Each seat’s final price is derived from Base_Price by applying the corresponding Seat_Multiplier: Normal seat: Seat_Multiplier = 1.0 VIP seat: Seat_Multiplier = 1.5 Couple seat: Seat_Multiplier = 2.0 (occupies a double slot; seats 2 guests) Seat_Multiplier default values are stored in System Configuration (seat_vip_multiplier, seat_couple_multiplier) and are editable by System Admin. |
| BR-03 | Food & Beverage (F&B) Pricing. Each F&B product has a fixed listed price (FNB_Price) set by Admin in F&B Product Management. F&B subtotal: Total_FNB_Amount = SUM( FNB_Price_i * Quantity_i ) for all selected F&B items. F&B items are priced independently from tickets; no seat-type or time-of-day multiplier applies to F&B. |
| BR-04 | Promotional Code Rules. Discount types: (a) Percentage discount: reduces Sub_Total by a percentage. Requires Max_Discount ceiling (VND) and Min_Order_Value. (b) Fixed Amount discount: deducts a fixed VND amount; if discount exceeds Sub_Total, customer pays 0 VND. Per-booking limit: Only one (1) promo code may be applied per booking. Per-user limit: Each promo code can be used at most once per User account. A promo code is only applicable within its configured validity period and while its status is Active. |
| BR-05 | Order Total Calculation Formulas (computed sequentially by Backend; no client-side total is trusted). Step 1 - Individual Ticket Price: Ticket_Price = Base_Price x Day_Multiplier x Time_Multiplier x Seat_Multiplier Step 2 - Total Ticket Amount: Total_Tickets_Amount = SUM( Ticket_Price_i ) for all selected seats Step 3 - Total F&B Amount: Total_FNB_Amount = SUM( FNB_Price_j x Quantity_j ) for all F&B items Step 4 - Sub-Total: Sub_Total = Total_Tickets_Amount + Total_FNB_Amount Step 5 - Discount Amount: Fixed: MIN(Fixed_Value, Sub_Total). Percentage: MIN(Sub_Total x Pct / 100, Max_Discount). No promo: 0. Step 6 - Total Before Tax (Pre-tax): Total_Before_Tax = Sub_Total - Discount_Amount Step 7 - VAT Amount: VAT_Amount = Total_Before_Tax x VAT_Rate (fetched from System Config; default 0.10; never hardcoded). Step 8 - Total After Tax: Total_After_Tax = Total_Before_Tax + VAT_Amount (amount charged to customer via payment gateway). |
| BR-06 | Revenue Recognition Rules. A booking’s revenue is recognized when Booking.status = CONFIRMED (payment confirmed via gateway webhook) OR Booking.status = CHECKED_IN (customer has checked in at the cinema). Both statuses represent a completed, paid booking. Bookings with status PENDING, FAILED, CANCELLED, or EXPIRED must not be included in any revenue calculation or dashboard metric. Total_Before_Tax (pre-tax revenue) is the primary performance metric: default revenue metric in Dashboard charts and KPI cards. Total_After_Tax (post-tax revenue) is displayed optionally on the Dashboard (After-Tax toggle) and used for accounting reconciliation and VAT filing. |
| BR-07 | Movie Sales Trend Rankings. Best-Selling Movies (Top 5): Ranked by total confirmed ticket sales (COUNT of BookingSeats linked to CONFIRMED Bookings), highest to lowest. No minimum screening-day requirement. Worst-Selling Movies (Top 5 Lowest): Ranked by total confirmed ticket sales, lowest to highest. Eligibility for Worst-Selling: Only movies with release_date <= current date AND at least one showtime active for 3 or more days are included. Both rankings are calculated within the currently selected Dashboard time filter period (BR-08). |
| BR-08 | Time-Based Grouping & Reporting Periods. This Week: Monday 00:00:00 to Sunday 23:59:59 of the current calendar week (ISO week; week starts Monday). This Month: 1st day of current month 00:00:00 to last day 23:59:59. Day-level granularity for trend charts. This Quarter: Q1 Jan 1-Mar 31; Q2 Apr 1-Jun 30; Q3 Jul 1-Sep 30; Q4 Oct 1-Dec 31. Month-level granularity. Custom Range: Admin-specified start date to end date. Max range: 12 months. Day-level if <=31 days; month-level if >31 days. |
| BR-09 | Schedule Manager Cinema Scoping. A Schedule Manager account is scoped to exactly one cinema at creation time. All showtime and room operations (create, edit, cancel, view) are automatically restricted to that assigned cinema. Any attempt to access or modify showtimes or rooms belonging to a different cinema is rejected with HTTP 403 FORBIDDEN. System Admin has no cinema restriction and can manage all cinemas. |
| BR-10 | Seat Hold Refresh. Each seat can have at most one active hold record per showtime at any time. If the same Customer attempts to hold a seat they are already holding, the system refreshes (extends) the existing hold timer to `seat_hold_minutes` from the current time instead of creating a duplicate hold. A seat held by another Customer cannot be held by a second Customer until the first hold expires. |
| BR-11 | OTP Retry Limits. Registration OTP: valid for 10 minutes; maximum 3 verification attempts. Exceeding 3 attempts invalidates the OTP — the user must restart registration. Password Reset OTP: valid for 5 minutes; maximum 3 verification attempts. Exceeding 3 attempts invalidates the OTP — the user must request a new one. Both OTP types are single-use; successful verification immediately invalidates the token. |
| BR-12 | Account Lockout Duration. After 5 consecutive failed login attempts the account is temporarily locked for **30 minutes**. The lock is lifted automatically when the duration expires. During the lock period all login attempts are rejected with UNAUTHORIZED ("Account locked for 30 minutes due to 5 failed login attempts."). The failed attempt counter resets to zero on any successful login. |



### 5.2 System Messages

All API responses follow the wrapper format `ApiResponse<T>` with fields: `success` (boolean), `data` (payload), `error` (object with `code` and `message`).

Error responses use the following standardised error codes. All messages are in **English**.

| # | Error Code | HTTP Status | Trigger / Context | Example Message |
| --- | --- | --- | --- | --- |
| 1 | `UNAUTHORIZED` | 401 | Wrong password, expired token, account locked | "Invalid credentials." / "Account is locked. Try again in 30 minutes." |
| 2 | `INVALID_CREDENTIALS` | 401 | Wrong email or password on login | "Invalid email or password." |
| 3 | `FORBIDDEN` | 403 | Authenticated user lacks permission for this resource | "You are not authorized to perform this action." |
| 4 | `ACCESS_DENIED` | 403 | Spring Security role check fails before reaching controller | "Access denied." |
| 5 | `NOT_FOUND` | 404 | Requested resource does not exist | "Booking not found." / "Movie not found." / "Genre not found." |
| 6 | `CONFLICT` | 409 | Duplicate unique field (email, genre name, promo code) | "Email already exists." / "Genre name already exists." |
| 7 | `BAD_REQUEST` | 400 | Business rule violation (promo expired, cancel non-pending booking, delete active promo) | "Promo code has expired or is not yet valid." / "Only pending bookings can be cancelled." / "Cannot delete an active promo code. Please deactivate it first." |
| 8 | `VALIDATION_ERROR` | 400 | Jakarta Bean Validation constraint failed on a request DTO field | "Full name is required." / "Email must be a valid email address." |
| 9 | `DUPLICATE_ENTRY` | 400 | Database unique-constraint violation (fallback when not caught earlier) | "A record with this value already exists." |
| 10 | `INTERNAL_ERROR` | 500 | Unexpected server-side exception not covered by a specific error code | "An unexpected error occurred. Please try again later." |



### 5.3 Other Requirements…

### 5.4 Mock-up Screen

#### 5.4.1 Seat Picking



#### 5.4.2 Movie Management & Browsing



#### 5.4.3 Account Login



#### 5.4.4 Profit Calculation



#### 5.4.5 Customer Booking Flow & Payment



#### 5.4.6 Account Registration & Authentication



#### 5.4.7 Admin Dashboard & System Configuration



#### 5.4.8 P2P Ticket Payment

