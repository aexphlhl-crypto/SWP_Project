"use client";

import { useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Ticket, Heart, Camera, Save, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate, Navigate } from 'react-router-dom';

import authApi from '@/api/authApi';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser, isAuthenticated } = useAuth();
  const router = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || ''
  });
  if (!isAuthenticated || !user) {
    return <Navigate to='/login' replace />;
  }
  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await authApi.updateProfile(formData);
      if (res.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        // Update local context user with new name if needed
        setUser({ ...user, name: res.data.fullName, phone: res.data.phone, dateOfBirth: res.data.dateOfBirth, address: res.data.address });
      } else {
        toast.error(res.error?.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Lỗi hệ thống khi cập nhật.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tài khoản của tôi</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        {/* Avatar + quick stats */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                </div>
                <div className="flex gap-8 mt-4 justify-center sm:justify-start text-center">
                  {[{
                  label: 'Vé đã đặt',
                  value: '0'
                }].map(s => <div key={s.label}>
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        {user?.role === 'user' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: Ticket,
                label: 'Vé của tôi',
                href: '/my-tickets'
              },
              {
                icon: RefreshCw,
                label: 'Vé bán lại',
                href: '/my-resale'
              }
            ].map(item => {
          const Icon = item.icon;
          return <Link key={item.href} to={item.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>;
            })}
          </div>
        )}

        {/* Edit profile */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Thông tin cá nhân</CardTitle>
            </div>
            <CardDescription>Cập nhật thông tin hồ sơ của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled className="opacity-60" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0901234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ (Giao hàng / Vị trí)</Label>
              <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Nhập địa chỉ của bạn để ưu tiên rạp gần nhất" />
            </div>
            <Button onClick={handleSave} className="gap-2" disabled={loading}>
              <Save className="w-4 h-4" />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="bg-card border-border" id="security">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Đổi mật khẩu</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cur-pw">Mật khẩu hiện tại</Label>
              <Input id="cur-pw" type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-pw">Mật khẩu mới</Label>
                <Input id="new-pw" type="password" placeholder="Tối thiểu 6 ký tự" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Xác nhận mật khẩu</Label>
                <Input id="confirm-pw" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Separator className="bg-border" />
            <Button variant="outline" className="gap-2">
              <Lock className="w-4 h-4" />
              Cập nhật mật khẩu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
}
