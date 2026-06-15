import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import authApi from '@/api/authApi'

const AuthContext = createContext(undefined)

// Removed mock users

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setAuthState({
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error("Failed to parse stored user", error);
        logout();
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Map role to match frontend mock users if needed, or use directly
        // The backend returns SystemAdmin, ScheduleManager, etc.
        // Frontend ProtectedRoute expects 'admin', 'manager', 'user'
        let uiRole = 'user';
        if (userData.role === 'SystemAdmin') uiRole = 'admin';
        else if (userData.role === 'ScheduleManager') uiRole = 'manager';

        // Map fullName to name for frontend components
        const finalUser = { ...userData, id: userData.userId, role: uiRole, name: userData.fullName || "User" };
        localStorage.setItem('user', JSON.stringify(finalUser));
        
        setAuthState({ user: finalUser, isAuthenticated: true, isLoading: false })
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        throw new Error(response.error?.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw new Error(error.error?.message || error.message || "Đăng nhập thất bại");
    }
  }, [])

  const register = useCallback(async (name, email, phone, password) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    try {
      const response = await authApi.register({ email, password, fullName: name, phone });
      if (response.success) {
         setAuthState(prev => ({ ...prev, isLoading: false }))
      } else {
         throw new Error(response.error?.message || "Đăng ký thất bại");
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw new Error(error.error?.message || error.message || "Đăng ký thất bại");
    }
  }, [])

  const verifyOtp = useCallback(async (email, otp) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    try {
      const response = await authApi.verifyOtp({ email, otp });
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        let uiRole = 'user';
        if (userData.role === 'SystemAdmin') uiRole = 'admin';
        else if (userData.role === 'ScheduleManager') uiRole = 'manager';

        // Map fullName to name for frontend components
        const finalUser = { ...userData, id: userData.userId, role: uiRole, name: userData.fullName || "User" };
        localStorage.setItem('user', JSON.stringify(finalUser));
        
        setAuthState({ user: finalUser, isAuthenticated: true, isLoading: false })
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        throw new Error(response.error?.message || "Xác minh thất bại");
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw new Error(error.error?.message || error.message || "Xác minh thất bại");
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const loginWithGoogle = useCallback(async (credential) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    try {
      const response = await authApi.googleLogin({ idToken: credential });
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        let uiRole = 'user';
        if (userData.role === 'SystemAdmin') uiRole = 'admin';
        else if (userData.role === 'ScheduleManager') uiRole = 'manager';

        // Map fullName to name for frontend components
        const finalUser = { ...userData, id: userData.userId, role: uiRole, name: userData.fullName || "User" };
        localStorage.setItem('user', JSON.stringify(finalUser));
        
        setAuthState({ user: finalUser, isAuthenticated: true, isLoading: false })
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        throw new Error(response.error?.message || "Đăng nhập Google thất bại");
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      console.error("Google Login Error:", error);
      throw new Error(error.error?.message || error.message || "Đăng nhập Google thất bại");
    }
  }, [])

  const setUser = useCallback((user) => {
    setAuthState(prev => ({ ...prev, user }));
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, verifyOtp, logout, loginWithGoogle, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
