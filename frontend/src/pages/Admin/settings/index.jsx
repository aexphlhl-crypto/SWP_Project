"use client";

import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Bell, Shield, Palette, Globe, Save, Percent } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import configApi from '@/api/configApi';
export default function AdminSettingsPage() {
  const { toast } = useToast();

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [vatPercent, setVatPercent] = useState(8);
  const [weekendSurcharge, setWeekendSurcharge] = useState(20);
  const [eveningSurcharge, setEveningSurcharge] = useState(10);
  const [eveningSurchargeTime, setEveningSurchargeTime] = useState('17:00');
  
  const [basePrice, setBasePrice] = useState(75000);
  const [seatVipMultiplier, setSeatVipMultiplier] = useState(1.5);
  const [seatCoupleMultiplier, setSeatCoupleMultiplier] = useState(2.0);
  const [room3DMultiplier, setRoom3DMultiplier] = useState(1.2);
  const [roomIMAXMultiplier, setRoomIMAXMultiplier] = useState(1.5);
  const [holdTime, setHoldTime] = useState(10);
  const [maxSeats, setMaxSeats] = useState(8);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configApi.getAllConfigs().then(res => {
      if (res.success) {
          res.data.forEach(config => {
            if (config.configKey === 'vatPercent') setVatPercent(Number(config.configValue));
            if (config.configKey === 'weekendSurcharge') setWeekendSurcharge(Number(config.configValue));
            if (config.configKey === 'eveningSurcharge') setEveningSurcharge(Number(config.configValue));
            if (config.configKey === 'eveningSurchargeTime') setEveningSurchargeTime(config.configValue);
            if (config.configKey === 'base_price') setBasePrice(Number(config.configValue));
            if (config.configKey === 'seat_vip_multiplier') setSeatVipMultiplier(Number(config.configValue));
            if (config.configKey === 'seat_couple_multiplier') setSeatCoupleMultiplier(Number(config.configValue));
            if (config.configKey === 'room_3d_multiplier') setRoom3DMultiplier(Number(config.configValue));
            if (config.configKey === 'room_imax_multiplier') setRoomIMAXMultiplier(Number(config.configValue));
            if (config.configKey === 'holdTime') setHoldTime(Number(config.configValue));
            if (config.configKey === 'maxSeats') setMaxSeats(Number(config.configValue));
          });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
        await Promise.all([
          configApi.updateConfig('vatPercent', String(vatPercent)),
          configApi.updateConfig('weekendSurcharge', String(weekendSurcharge)),
          configApi.updateConfig('eveningSurcharge', String(eveningSurcharge)),
          configApi.updateConfig('eveningSurchargeTime', eveningSurchargeTime),
          configApi.updateConfig('base_price', String(basePrice)),
          configApi.updateConfig('seat_vip_multiplier', String(seatVipMultiplier)),
          configApi.updateConfig('seat_couple_multiplier', String(seatCoupleMultiplier)),
          configApi.updateConfig('room_3d_multiplier', String(room3DMultiplier)),
          configApi.updateConfig('room_imax_multiplier', String(roomIMAXMultiplier)),
          configApi.updateConfig('holdTime', String(holdTime)),
          configApi.updateConfig('maxSeats', String(maxSeats))
        ]);
      toast({
        title: 'Thành công',
        description: 'Đã lưu thay đổi cài đặt.',
      });
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể lưu cài đặt', variant: 'destructive' });
    }
  };
  return (
    <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground mt-1">Quản lý cấu hình và tùy chọn của ứng dụng</p>
        </div>

        {/* General */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle>Thông tin chung</CardTitle>
            </div>
            <CardDescription>Thông tin cơ bản của hệ thống rạp chiếu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cinema-name">Tên hệ thống rạp</Label>
                <Input id="cinema-name" defaultValue="CineBook" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotline">Số điện thoại hotline</Label>
                <Input id="hotline" defaultValue="1900 2099" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ trụ sở chính</Label>
              <Input id="address" defaultValue="72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" rows={3} defaultValue="CineBook — Hệ thống rạp chiếu phim hàng đầu Việt Nam với trải nghiệm xem phim đẳng cấp." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                <Select defaultValue="VND">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND — Việt Nam Đồng</SelectItem>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ mặc định</Label>
                <Select defaultValue="vi">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <CardTitle>Cài đặt vé</CardTitle>
            </div>
            <CardDescription>Cấu hình giá vé và chính sách đặt chỗ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="base-price">Giá cơ bản (₫)</Label>
                <Input id="base-price" type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} />
              </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Hệ số Ghế VIP (So với vé thường)</Label>
                      <Input type="number" step="0.1" value={seatVipMultiplier} onChange={e => setSeatVipMultiplier(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hệ số Ghế Đôi (So với vé thường)</Label>
                      <Input type="number" step="0.1" value={seatCoupleMultiplier} onChange={e => setSeatCoupleMultiplier(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hệ số Phòng 3D (So với vé thường)</Label>
                      <Input type="number" step="0.1" value={room3DMultiplier} onChange={e => setRoom3DMultiplier(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hệ số Phòng IMAX (So với vé thường)</Label>
                      <Input type="number" step="0.1" value={roomIMAXMultiplier} onChange={e => setRoomIMAXMultiplier(e.target.value)} />
                    </div>
                  </div>
            </div>
            <Separator className="bg-border" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hold-time">Thời gian giữ ghế (phút)</Label>
                <Input id="hold-time" type="number" value={holdTime} onChange={e => setHoldTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-seats">Số ghế tối đa mỗi đơn</Label>
                <Input id="max-seats" type="number" value={maxSeats} onChange={e => setMaxSeats(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Tax settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              <CardTitle>Cấu hình Giá & Thuế</CardTitle>
            </div>
            <CardDescription>Cấu hình % VAT và phụ thu vé theo thời gian</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="vat-percent">Thuế VAT (%)</Label>
                <Input id="vat-percent" type="number" value={vatPercent} onChange={e => setVatPercent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekend-surcharge">Phụ thu cuối tuần (%)</Label>
                <Input id="weekend-surcharge" type="number" value={weekendSurcharge} onChange={e => setWeekendSurcharge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evening-surcharge-time">Giờ bắt đầu phụ thu tối</Label>
                <Input id="evening-surcharge-time" type="time" value={eveningSurchargeTime} onChange={e => setEveningSurchargeTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evening-surcharge">Phụ thu buổi tối (%)</Label>
                <Input id="evening-surcharge" type="number" value={eveningSurcharge} onChange={e => setEveningSurcharge(e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Áp dụng từ {eveningSurchargeTime} trở đi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Thông báo</CardTitle>
            </div>
            <CardDescription>Kênh thông báo tới khách hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[{
            label: 'Thông báo qua Email',
            description: 'Gửi email xác nhận đặt vé và nhắc lịch chiếu',
            value: emailNotif,
            onChange: setEmailNotif
          }].map(item => <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch checked={item.value} onCheckedChange={item.onChange} />
              </div>)}
          </CardContent>
        </Card>


        {/* Security */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Bảo mật & Bảo trì</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Chế độ bảo trì</p>
                <p className="text-xs text-muted-foreground">
                  Tạm dừng hệ thống — khách hàng sẽ thấy trang thông báo bảo trì
                </p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} className="data-[state=checked]:bg-destructive" />
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button className="gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>
    );
}
