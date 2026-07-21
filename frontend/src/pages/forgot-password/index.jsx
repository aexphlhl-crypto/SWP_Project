'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import authApi from '@/api/authApi';
export default function ForgotPasswordPage() {
  const router = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSendOtp = async e => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Email không hợp lệ.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword({ email });
      if (response.success) {
        setStep('otp');
      } else {
        setError(response.error?.message || 'Có lỗi xảy ra khi gửi mã OTP.');
      }
    } catch (err) {
      setError(err.error?.message || err.message || 'Có lỗi xảy ra khi gửi mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Mã OTP phải có đúng 6 chữ số.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.verifyForgotPasswordOtp({ email, otpCode: otp });
      if (response.success && response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setStep('reset');
      } else {
        setError(response.error?.message || 'Xác minh OTP thất bại.');
      }
    } catch (err) {
      setError(err.error?.message || err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async e => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.resetPassword({ email, token: resetToken, newPassword: password });
      if (response.success) {
        setStep('success');
      } else {
        setError(response.error?.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err) {
      setError(err.error?.message || err.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 text-center">
            <Link to="/" className="flex flex-col items-center gap-2 transition-transform hover:scale-105">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary">
                <Film className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">
                Cine<span className="text-primary">Book</span>
              </h1>
            </Link>
          </div>

          {/* Step 1: Request OTP */}
          {step === 'email' && <Card className="bg-card border-border">
              <CardHeader>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 w-fit" onClick={() => router('/login')}>
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <CardTitle>Quên mật khẩu</CardTitle>
                <CardDescription>
                  Nhập địa chỉ email đã đăng ký tài khoản của bạn để nhận mã khôi phục.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }} autoComplete="email" />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang gửi mã...
                      </> : 'Gửi mã xác nhận'}
                  </Button>
                </form>
              </CardContent>
            </Card>}

          {/* Step 2: Verify OTP */}
          {step === 'otp' && <Card className="bg-card border-border">
              <CardHeader>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 w-fit" onClick={() => setStep('email')}>
                  <ArrowLeft className="w-4 h-4" /> Đổi email
                </button>
                <CardTitle>Xác minh Email</CardTitle>
                <CardDescription>
                  Mã xác minh đã được gửi tới <span className="text-foreground font-medium">{email}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Mã OTP</Label>
                    <Input id="otp" placeholder="Nhập 6 chữ số" value={otp} onChange={e => {
                  setOtp(e.target.value);
                  setError('');
                }} maxLength={6} className="text-center text-xl tracking-widest font-mono" />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xác minh...
                      </> : 'Xác minh'}
                  </Button>
                </form>
              </CardContent>
            </Card>}

          {/* Step 3: Reset Password */}
          {step === 'reset' && <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Đặt lại mật khẩu
                </CardTitle>
                <CardDescription>
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Tối thiểu 6 ký tự" value={password} onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }} className="pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Xác nhận mật khẩu mới</Label>
                    <Input id="confirm" type="password" placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={e => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }} />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </> : 'Cập nhật mật khẩu'}
                  </Button>
                </form>
              </CardContent>
            </Card>}

          {/* Step 4: Success */}
          {step === 'success' && <Card className="bg-card border-border">
              <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold">Thành công!</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Mật khẩu của bạn đã được cập nhật thành công.
                  </p>
                </div>
                <Button className="w-full mt-2" onClick={() => router('/login')}>
                  Quay lại đăng nhập
                </Button>
              </CardContent>
            </Card>}

          {/* Bottom links */}
          {step !== 'success' && <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>}
        </div>
      </div>
    );
}
