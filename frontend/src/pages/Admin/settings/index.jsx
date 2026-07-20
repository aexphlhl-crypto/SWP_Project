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
import { toast } from 'sonner';
import configApi from '@/api/configApi';
export default function AdminSettingsPage() {

  const [emailNotif, setEmailNotif] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [cinemaName, setCinemaName] = useState('CineBook');
  const [hotline, setHotline] = useState('1900 2099');
  const [address, setAddress] = useState('72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh');
  const [description, setDescription] = useState('CineBook — Hệ thống rạp chiếu phim hàng đầu Việt Nam với trải nghiệm xem phim đẳng cấp.');
  const [currency, setCurrency] = useState('VND');
  const [language, setLanguage] = useState('vi');

  const [vatPercent, setVatPercent] = useState(8);
  const [weekendSurcharge, setWeekendSurcharge] = useState(20);
  const [eveningSurcharge, setEveningSurcharge] = useState(10);
  const [eveningSurchargeTime, setEveningSurchargeTime] = useState('17:00');
  const [eveningSurchargeEndTime, setEveningSurchargeEndTime] = useState('23:59');
  
  const [basePrice, setBasePrice] = useState(75000);
  const [seatVipMultiplier, setSeatVipMultiplier] = useState(1.5);
  const [seatCoupleMultiplier, setSeatCoupleMultiplier] = useState(2.0);
  const [holdTime, setHoldTime] = useState(10);
  const [maxSeats, setMaxSeats] = useState(8);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configApi.getAllConfigs().then(res => {
      if (res.success) {
          res.data.forEach(config => {
            if (config.configKey === 'vat_rate') setVatPercent(Number(config.configValue) * 100);
            if (config.configKey === 'weekend_surcharge_percent') setWeekendSurcharge(Number(config.configValue));
            if (config.configKey === 'evening_surcharge_percent') setEveningSurcharge(Number(config.configValue));
            if (config.configKey === 'evening_surcharge_time') setEveningSurchargeTime(config.configValue);
            if (config.configKey === 'evening_surcharge_end_time') setEveningSurchargeEndTime(config.configValue);
            if (config.configKey === 'base_price') setBasePrice(Number(config.configValue));
            if (config.configKey === 'seat_vip_multiplier') setSeatVipMultiplier(Number(config.configValue));
            if (config.configKey === 'seat_couple_multiplier') setSeatCoupleMultiplier(Number(config.configValue));
            if (config.configKey === 'seat_hold_minutes') setHoldTime(Number(config.configValue));
            if (config.configKey === 'max_seats_per_booking') setMaxSeats(Number(config.configValue));
            if (config.configKey === 'cinema_name') setCinemaName(config.configValue);
            if (config.configKey === 'hotline') setHotline(config.configValue);
            if (config.configKey === 'address') setAddress(config.configValue);
            if (config.configKey === 'description') setDescription(config.configValue);
            if (config.configKey === 'currency') setCurrency(config.configValue);
            if (config.configKey === 'language') setLanguage(config.configValue);
            if (config.configKey === 'email_notif') setEmailNotif(config.configValue === 'true');
            if (config.configKey === 'maintenance_mode') setMaintenanceMode(config.configValue === 'true');
          });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
        await Promise.all([
          configApi.updateConfig('vat_rate', String(vatPercent / 100)),
          configApi.updateConfig('weekend_surcharge_percent', String(weekendSurcharge)),
          configApi.updateConfig('evening_surcharge_percent', String(eveningSurcharge)),
          configApi.updateConfig('evening_surcharge_time', eveningSurchargeTime),
          configApi.updateConfig('evening_surcharge_end_time', eveningSurchargeEndTime),
          configApi.updateConfig('base_price', String(basePrice)),
          configApi.updateConfig('seat_vip_multiplier', String(seatVipMultiplier)),
          configApi.updateConfig('seat_couple_multiplier', String(seatCoupleMultiplier)),
          configApi.updateConfig('seat_hold_minutes', String(holdTime)),
          configApi.updateConfig('max_seats_per_booking', String(maxSeats)),
          configApi.updateConfig('cinema_name', cinemaName),
          configApi.updateConfig('hotline', hotline),
          configApi.updateConfig('address', address),
          configApi.updateConfig('description', description),
          configApi.updateConfig('currency', currency),
          configApi.updateConfig('language', language),
          configApi.updateConfig('email_notif', String(emailNotif)),
          configApi.updateConfig('maintenance_mode', String(maintenanceMode))
        ]);
      toast.success('Đã lưu thay đổi cài đặt.');
    } catch (err) {
      toast.error(err.error?.message || err.message || 'Không thể lưu cài đặt');
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
                <Input id="cinema-name" value={cinemaName} onChange={e => setCinemaName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotline">Số điện thoại hotline</Label>
                <Input id="hotline" value={hotline} onChange={e => setHotline(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ trụ sở chính</Label>
              <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                <Select value={currency} onValueChange={setCurrency}>
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
                <Select value={language} onValueChange={setLanguage}>
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
                <Label htmlFor="evening-surcharge-end-time">Giờ kết thúc phụ thu tối</Label>
                <Input id="evening-surcharge-end-time" type="time" value={eveningSurchargeEndTime} onChange={e => setEveningSurchargeEndTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evening-surcharge">Phụ thu buổi tối (%)</Label>
                <Input id="evening-surcharge" type="number" value={eveningSurcharge} onChange={e => setEveningSurcharge(e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Áp dụng từ {eveningSurchargeTime} đến {eveningSurchargeEndTime}</p>
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
