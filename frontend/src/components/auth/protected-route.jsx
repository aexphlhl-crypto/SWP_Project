import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated || !user) {
    // Chuyển hướng về login và lưu lại trang đang muốn vào
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập nhưng không có quyền
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu là admin/manager đang vào trang không có quyền, cho về dashboard admin
    if (user.role === 'admin' || user.role === 'manager') {
       return <Navigate to="/admin" replace />;
    }
    // Nếu là user đang vào trang admin, cho về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
}
