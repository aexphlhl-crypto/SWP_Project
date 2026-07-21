import React from 'react';
import { MousePointerClick, CalendarDays, Armchair, CreditCard, TicketCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingGuidePage() {
  const steps = [
    {
      icon: MousePointerClick,
      title: '1. Chọn Phim',
      desc: 'Truy cập trang chủ hoặc mục "Phim Đang Chiếu", lướt qua danh sách và nhấp vào bộ phim bạn muốn xem để đọc thông tin chi tiết.'
    },
    {
      icon: CalendarDays,
      title: '2. Chọn Rạp & Suất Chiếu',
      desc: 'Bấm "Mua Vé", sau đó lựa chọn rạp chiếu gần bạn nhất cùng với ngày, giờ chiếu phù hợp với lịch trình của bạn.'
    },
    {
      icon: Armchair,
      title: '3. Chọn Ghế & Bắp Nước',
      desc: 'Trên màn hình sơ đồ phòng chiếu, chọn vị trí ghế yêu thích (Thường, VIP, Đôi). Có thể đặt thêm bắp nước để trải nghiệm xem phim hoàn hảo hơn.'
    },
    {
      icon: CreditCard,
      title: '4. Thanh Toán',
      desc: 'Kiểm tra lại thông tin đơn hàng và tiến hành thanh toán an toàn qua cổng VNPay hoặc ví điện tử.'
    },
    {
      icon: TicketCheck,
      title: '5. Nhận Vé',
      desc: 'Thanh toán thành công, mã vé QR sẽ hiển thị trên màn hình và gửi về mục "Vé của tôi". Đưa mã này tại rạp để quét vào cổng.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary/5 py-16 border-b border-border text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Hướng dẫn đặt vé</h1>
        <p className="text-muted-foreground">Mua vé trực tuyến dễ dàng chỉ với vài bước đơn giản.</p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="bg-card border-border border relative overflow-hidden group hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-stretch">
                    <div className="bg-secondary/30 sm:w-32 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-border">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center space-y-2">
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
