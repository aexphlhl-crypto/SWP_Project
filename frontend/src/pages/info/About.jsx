import React from 'react';
import { Clapperboard, Star, Users, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const stats = [
    { label: 'Rạp chiếu toàn quốc', value: '50+', icon: Clapperboard },
    { label: 'Thành viên', value: '2M+', icon: Users },
    { label: 'Phim mỗi năm', value: '300+', icon: Film },
    { label: 'Đánh giá 5 sao', value: '98%', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-b from-primary/10 to-background border-b border-border/50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Khơi Nguồn Đam Mê <span className="text-primary">Điện Ảnh</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            CineBook tự hào là nền tảng đặt vé xem phim hàng đầu, mang đến cho bạn những trải nghiệm điện ảnh tuyệt vời nhất với hệ thống rạp chiếu hiện đại và dịch vụ đẳng cấp.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Câu chuyện của chúng tôi</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Được thành lập từ năm 2026, CineBook bắt đầu với một ước mơ đơn giản: Làm cho việc thưởng thức điện ảnh trở nên dễ dàng và trọn vẹn hơn bao giờ hết. Chúng tôi tin rằng mỗi bộ phim là một hành trình cảm xúc, và hành trình đó nên bắt đầu từ khoảnh khắc bạn đặt vé.
              </p>
              <p>
                Trải qua quá trình phát triển không ngừng, CineBook đã trở thành cầu nối vững chắc giữa khán giả và các hệ thống rạp chiếu phim hàng đầu, mang đến công nghệ đặt chỗ thông minh, thanh toán tiện lợi và hệ sinh thái đánh giá phim chân thực.
              </p>
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-muted">
            <img 
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Cinema experience" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-card border-border border-0 shadow-lg bg-secondary/20 hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-black">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
