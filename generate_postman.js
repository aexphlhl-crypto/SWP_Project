const fs = require('fs');

const collection = {
  info: {
    name: 'CineBook API Collection',
    description: 'Postman Collection for CineBook Backend APIs',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [],
  variable: [
    { key: 'baseUrl', value: 'http://localhost:8080/api', type: 'string' },
    { key: 'token', value: '', type: 'string' }
  ]
};

function createItem(name, method, path, body = null, requireAuth = true, queryParams = []) {
  const item = {
    name,
    request: {
      method,
      url: {
        raw: '{{baseUrl}}' + path + (queryParams.length > 0 ? '?' + queryParams.map(q => q.key + '=' + q.value).join('&') : ''),
        host: ['{{baseUrl}}'],
        path: path.split('/').filter(p => p),
        query: queryParams
      }
    }
  };

  if (requireAuth) {
    item.request.header = [{ key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }];
  } else {
    item.request.header = [];
  }

  if (body) {
    item.request.header.push({ key: 'Content-Type', value: 'application/json', type: 'text' });
    item.request.body = {
      mode: 'raw',
      raw: body,
      options: { raw: { language: 'json' } }
    };
  }

  return item;
}

// 1. Auth & Users
collection.item.push({
  name: "1. Auth & Users",
  item: [
    createItem("1.1 Login", "POST", "/auth/login", JSON.stringify({ email: "admin@cinebook.vn", password: "password123" }, null, 2), false),
    createItem("1.2 Register", "POST", "/auth/register", JSON.stringify({ fullName: "New User", email: "new@cinebook.vn", phone: "0909999999", password: "password123" }, null, 2), false),
    createItem("1.3 Verify OTP", "POST", "/auth/verify-otp", JSON.stringify({ email: "new@cinebook.vn", otp: "123456" }, null, 2), false),
    createItem("1.4 Get Profile", "GET", "/auth/me", null, true),
    createItem("1.5 Update Profile", "PUT", "/auth/profile", JSON.stringify({ fullName: "Updated Name", phone: "0123456789", dateOfBirth: "1990-01-01", address: "HCMC" }, null, 2), true),
    createItem("1.6 Refresh Token", "POST", "/auth/refresh-token", JSON.stringify({ refreshToken: "YOUR_REFRESH_TOKEN" }, null, 2), false),
    createItem("1.7 Change Password", "PUT", "/auth/change-password", JSON.stringify({ oldPassword: "password123", newPassword: "newpassword123" }, null, 2), true),
    createItem("1.8 Get All Users (Admin)", "GET", "/admin/users", null, true),
    createItem("1.9 Update User Status (Admin)", "PUT", "/admin/users/1/status", JSON.stringify({ status: "Locked" }, null, 2), true),
    createItem("1.10 Lock User (Admin)", "PUT", "/admin/users/1/lock", null, true),
    createItem("1.11 Unlock User (Admin)", "PUT", "/admin/users/1/unlock", null, true),
    createItem("1.12 Add Manager (Admin)", "POST", "/admin/users/managers", JSON.stringify({ fullName: "New Manager", email: "manager@cinebook.vn", password: "password123", phone: "0999888777", cinemaId: 1 }, null, 2), true),
    createItem("1.13 Remove Manager (Admin)", "DELETE", "/admin/users/managers/1", null, true)
  ]
});

// 2. Core (Movies, Cinemas, Rooms, Showtimes, Seats)
collection.item.push({
  name: "2. Core (Movies & Cinemas)",
  item: [
    createItem("2.1 Get All Movies", "GET", "/movies", null, false),
    createItem("2.2 Get Now Showing", "GET", "/movies/now-showing", null, false),
    createItem("2.3 Get Coming Soon", "GET", "/movies/coming-soon", null, false),
    createItem("2.4 Get Movie Details", "GET", "/movies/1", null, false),
    createItem("2.5 Create Movie (Admin)", "POST", "/movies", JSON.stringify({ title: "New Movie", durationMinutes: 120, releaseDate: "2026-07-01", description: "Movie desc", genre: "Action", director: "John Doe", cast: "Actor A", posterUrl: "http://example.com/poster.jpg", trailerUrl: "http://youtube.com", status: "NowShowing" }, null, 2), true),
    createItem("2.6 Update Movie (Admin)", "PUT", "/movies/1", JSON.stringify({ title: "Updated Movie", durationMinutes: 130 }, null, 2), true),
    createItem("2.7 Delete Movie (Admin)", "DELETE", "/movies/1", null, true),
    
    createItem("2.8 Get All Cinemas", "GET", "/cinemas", null, false),
    createItem("2.9 Get Cinema Details", "GET", "/cinemas/1", null, false),
    createItem("2.10 Create Cinema (Admin)", "POST", "/cinemas", JSON.stringify({ name: "CineBook Q2", location: "District 2", mapUrl: "http://maps.google.com" }, null, 2), true),
    createItem("2.11 Update Cinema (Admin)", "PUT", "/cinemas/1", JSON.stringify({ name: "CineBook Q2 Updated" }, null, 2), true),
    createItem("2.12 Delete Cinema (Admin)", "DELETE", "/cinemas/1", null, true),
    
    createItem("2.13 Get Rooms by Cinema", "GET", "/rooms/cinema/1", null, false),
    createItem("2.14 Create Room (Admin)", "POST", "/rooms", JSON.stringify({ cinemaId: 1, name: "Room 1", roomType: "STANDARD", rowsCount: 10, columnsCount: 10 }, null, 2), true),
    createItem("2.15 Update Room (Admin)", "PUT", "/rooms/1", JSON.stringify({ name: "Room 1 VIP", roomType: "VIP" }, null, 2), true),
    
    createItem("2.16 Search Showtimes", "GET", "/showtimes/search", null, false, [{key: "movieId", value: "1"}, {key: "date", value: "2026-06-02"}, {key: "cinemaId", value: "1"}]),
    createItem("2.17 Get Showtime Details", "GET", "/showtimes/1", null, false),
    createItem("2.18 Get Seats for Showtime", "GET", "/showtimes/1/seats", null, false),
    createItem("2.19 Create Showtime (Admin)", "POST", "/showtimes", JSON.stringify({ movieId: 1, roomId: 1, startTime: "2026-06-02T10:00:00", endTime: "2026-06-02T12:00:00" }, null, 2), true)
  ]
});

// 3. Booking & Payment
collection.item.push({
  name: "3. Booking & Payment",
  item: [
    createItem("3.1 Get My Bookings", "GET", "/bookings/my-bookings", null, true),
    createItem("3.2 Create Booking", "POST", "/bookings", JSON.stringify({ showtimeId: 1, seatIds: [1, 2], fnbItems: [{ fnbId: 1, quantity: 2 }], promoCode: "SUMMER10" }, null, 2), true),
    createItem("3.3 Get Booking Details", "GET", "/bookings/1", null, true),
    createItem("3.4 Generate VNPay URL", "GET", "/payments/create-url", null, true, [{key: "bookingId", value: "1"}]),
    createItem("3.5 VNPay Return Callback", "GET", "/payments/vnpay-return", null, false, [{key: "vnp_ResponseCode", value: "00"}, {key: "vnp_TxnRef", value: "1"}])
  ]
});

// 4. Products & Promos (F&B, Promos)
collection.item.push({
  name: "4. Products & Promos",
  item: [
    createItem("4.1 Get Active Promos", "GET", "/promos", null, false),
    createItem("4.2 Validate Promo Code", "POST", "/promos/validate", JSON.stringify({ code: "SUMMER10" }, null, 2), true),
    createItem("4.3 Create Promo (Admin)", "POST", "/promos", JSON.stringify({ code: "NEWYEAR", discountPercent: 15, validFrom: "2026-01-01T00:00:00", validTo: "2026-01-31T23:59:59" }, null, 2), true),
    
    createItem("4.4 Get F&B Items", "GET", "/concessions", null, false),
    createItem("4.5 Create F&B (Admin)", "POST", "/concessions", JSON.stringify({ name: "Popcorn M", type: "FOOD", price: 45000, description: "Medium Popcorn", imageUrl: "http://example.com/popcorn.jpg" }, null, 2), true)
  ]
});

// 5. Resale
collection.item.push({
  name: "5. Resale",
  item: [
    createItem("5.1 List Active Resales", "GET", "/resale/active", null, false),
    createItem("5.2 Get My Resales", "GET", "/resale/my-listings", null, true, [{key: "sellerId", value: "1"}]),
    createItem("5.3 Create Resale Ticket", "POST", "/resale", JSON.stringify({ bookingId: 1, sellerId: 1, askingPrice: 50000, note: "Busy", phone: "0912345678", facebookUrl: "fb.com/abc" }, null, 2), true),
    createItem("5.4 Hide Resale Ticket (Admin)", "PUT", "/resale/1/hide", null, true, [{key: "reason", value: "Spam"}])
  ]
});

// 6. News, Settings & Dashboard
collection.item.push({
  name: "6. News, Settings & Dashboard",
  item: [
    createItem("6.1 Get Active News", "GET", "/news", null, false),
    createItem("6.2 Get News Details", "GET", "/news/1", null, false),
    createItem("6.3 Create News (Admin)", "POST", "/news", JSON.stringify({ title: "Promotion Event", content: "Big discount this week!", category: "PROMOTION", summary: "Short desc" }, null, 2), true),
    
    createItem("6.4 Get System Config", "GET", "/config", null, false),
    createItem("6.5 Update Config (Admin)", "PUT", "/config/maintenance_mode", JSON.stringify({ configValue: "false" }, null, 2), true),
    
    createItem("6.6 Get KPI (Admin)", "GET", "/dashboard/kpi", null, true),
    createItem("6.7 Get Revenue Chart (Admin)", "GET", "/dashboard/revenue", null, true),
    createItem("6.8 Get Top Movies (Admin)", "GET", "/dashboard/top-movies", null, true),
    
    // Upload API
    createItem("6.9 Upload File", "POST", "/upload", null, true)
  ]
});

// 7. Reviews
collection.item.push({
  name: "7. Reviews",
  item: [
    createItem("7.1 Get Movie Reviews", "GET", "/reviews/movie/1", null, false),
    createItem("7.2 Create Review", "POST", "/reviews", JSON.stringify({ 
      customerId: 1,
      movieId: 1,
      bookingId: 1,
      rating: 5,
      comment: "Great movie!"
    }, null, 2), true)
  ]
});

// 8. Notifications
collection.item.push({
  name: "8. Notifications",
  item: [
    createItem("8.1 Get My Notifications", "GET", "/notifications", null, true),
    createItem("8.2 Mark as Read", "PUT", "/notifications/1/read", null, true),
    createItem("8.3 Mark All as Read", "PUT", "/notifications/read-all", null, true)
  ]
});

fs.writeFileSync('CineBook_Postman_Collection.json', JSON.stringify(collection, null, 2));
console.log('Postman Collection generated at CineBook_Postman_Collection.json');

// Generate Markdown Doc
let md = '# CineBook API Documentation\n\n';
md += '> Base URL: `http://localhost:8080/api`\n\n';

collection.item.forEach(folder => {
  md += '## ' + folder.name + '\n\n';
  folder.item.forEach(ep => {
    md += '### ' + ep.name + '\n';
    
    const url = ep.request.url.raw.replace('{{baseUrl}}', '');
    md += '**' + ep.request.method + '** `' + url + '`\n\n';
    
    if (ep.request.header && ep.request.header.some(h => h.key === 'Authorization')) {
      md += '- **Auth required**: Yes (Bearer Token)\n';
    } else {
      md += '- **Auth required**: No\n';
    }
    
    if (ep.request.url.query && ep.request.url.query.length > 0) {
      md += '- **Query Parameters**:\n';
      ep.request.url.query.forEach(q => {
        md += '  - `' + q.key + '`: ' + q.value + '\n';
      });
    }
    
    if (ep.request.body && ep.request.body.raw) {
      md += '- **Request Body** (application/json):\n';
      md += '```json\n' + ep.request.body.raw + '\n```\n';
    }
    md += '\n---\n\n';
  });
});

if (!fs.existsSync('docs')) {
  fs.mkdirSync('docs');
}
fs.writeFileSync('docs/API_Documentation.md', md);
console.log('API Documentation generated at docs/API_Documentation.md');
