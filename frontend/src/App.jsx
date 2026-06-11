import React from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/contexts/auth-context'
import { DataProvider } from '@/contexts/data-context'

// Main Layout Pages
import Home from './pages/Home.jsx'
import NewsPage from './pages/news/index.jsx'
import NewsDetail from './pages/news/NewsDetail.jsx'
import MoviesPage from './pages/Movies/index.jsx'
import MovieDetailPage from './pages/Movies/MovieDetails.jsx'
import NowShowingPage from './pages/Movies/NowShowing.jsx'
import ComingSoonPage from './pages/Movies/ComingSoon.jsx'
import BookingFlow from './pages/Booking/BookingFlow.jsx'
import BookingSuccess from './pages/Booking/Success.jsx'
import PaymentPage from './pages/Payment/index.jsx'
import VNPayResultPage from './pages/Payment/VNPayResult.jsx'
import MyTicketsPage from './pages/MyTickets/index.jsx'
import ProfilePage from './pages/Profile/index.jsx'

import CinemasPage from './pages/cinemas/index.jsx'
import PromotionsPage from './pages/promotions/index.jsx'
import ResalePage from './pages/resale/index.jsx'
import ResaleDetail from './pages/resale/ResaleDetail.jsx'
import MyResalePage from './pages/my-resale/index.jsx'
import CreateResalePage from './pages/my-resale/CreateResale.jsx'
import LoginPage from './pages/login/index.jsx'
import RegisterPage from './pages/register/index.jsx'
import ForgotPasswordPage from './pages/forgot-password/index.jsx'

// Admin Pages
import AdminDashboard from './pages/Admin/index.jsx'
import AdminNews from './pages/Admin/news/index.jsx'
import AdminAnalytics from './pages/Admin/analytics/index.jsx'
import AdminBookings from './pages/Admin/bookings/index.jsx'
import AdminCinemas from './pages/Admin/cinemas/index.jsx'
import AdminConcessions from './pages/Admin/concessions/index.jsx'
import AdminCustomers from './pages/Admin/customers/index.jsx'
import AdminManagers from './pages/Admin/managers/index.jsx'
import AdminMovies from './pages/Admin/movies/index.jsx'
import AdminGenres from './pages/Admin/genres/index.jsx'
import AdminPromotions from './pages/Admin/promotions/index.jsx'
import AdminResale from './pages/Admin/resale/index.jsx'
import AdminResaleReport from './pages/Admin/resale/report/index.jsx'
import AdminRooms from './pages/Admin/rooms/index.jsx'
import AdminSeats from './pages/Admin/seats/index.jsx'
import AdminSettings from './pages/Admin/settings/index.jsx'
import AdminShowtimes from './pages/Admin/showtimes/index.jsx'
import AdminReviews from './pages/Admin/reviews/index.jsx'

import { MainLayout } from '@/components/layout'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'

const MainLayoutWrapper = () => {
  const location = useLocation();
  const noHeaderFooterPaths = ['/login', '/register', '/forgot-password'];
  const hide = noHeaderFooterPaths.includes(location.pathname);
  return (
    <MainLayout showHeader={!hide} showFooter={!hide}>
      <Outlet />
    </MainLayout>
  );
};
const AdminLayoutWrapper = () => (
  <ProtectedRoute allowedRoles={['admin', 'manager']}>
    <AdminLayout><Outlet /></AdminLayout>
  </ProtectedRoute>
)

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <DataProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
          <Route element={<MainLayoutWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/now-showing" element={<NowShowingPage />} />
            <Route path="/movies/coming-soon" element={<ComingSoonPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/booking/success" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><BookingSuccess /></ProtectedRoute>} />
            <Route path="/booking" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><BookingFlow /></ProtectedRoute>} />
            <Route path="/booking/:movieId" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><BookingFlow /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><PaymentPage /></ProtectedRoute>} />
            <Route path="/payment/result" element={<VNPayResultPage />} />
            <Route path="/my-tickets" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><MyTicketsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/resale" element={<ResalePage />} />
            <Route path="/resale/:id" element={<ResaleDetail />} />
            <Route path="/my-resale" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><MyResalePage /></ProtectedRoute>} />
            <Route path="/my-resale/create" element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager']}><CreateResalePage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          
          <Route path="/admin" element={<AdminLayoutWrapper />}>
            <Route index element={<AdminDashboard />} />
            <Route path="news" element={<ProtectedRoute allowedRoles={['admin']}><AdminNews /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="cinemas" element={<AdminCinemas />} />
            <Route path="concessions" element={<AdminConcessions />} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><AdminCustomers /></ProtectedRoute>} />
            <Route path="managers" element={<ProtectedRoute allowedRoles={['admin']}><AdminManagers /></ProtectedRoute>} />
            <Route path="genres" element={<AdminGenres />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="resale" element={<ProtectedRoute allowedRoles={['admin']}><AdminResale /></ProtectedRoute>} />
            <Route path="resale/report" element={<ProtectedRoute allowedRoles={['admin']}><AdminResaleReport /></ProtectedRoute>} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="seats" element={<AdminSeats />} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
            <Route path="showtimes" element={<AdminShowtimes />} />
            <Route path="reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>} />
          </Route>
        </Routes>
        </BrowserRouter>
      </AuthProvider>
      </DataProvider>
    </GoogleOAuthProvider>
  )
}
