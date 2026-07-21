import React from 'react';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CareersPage() {
  const jobs = [
    {
      title: 'Quản lý Rạp chiếu phim (Cinema Manager)',
      location: 'Hồ Chí Minh',
      type: 'Toàn thời gian',
      department: 'Vận hành'
    },
    {
      title: 'Nhân viên Bán vé & Bắp nước (Crew Member)',
      location: 'Hà Nội',
      type: 'Bán thời gian',
      department: 'Dịch vụ khách hàng'
    },
    {
      title: 'Chuyên viên Marketing & Truyền thông',
      location: 'Hồ Chí Minh',
      type: 'Toàn thời gian',
      department: 'Marketing'
    },
    {
      title: 'Kỹ thuật viên phòng chiếu (Projectionist)',
      location: 'Đà Nẵng',
      type: 'Toàn thời gian',
      department: 'Kỹ thuật'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 bg-background border-primary text-primary px-3 py-1">
            Gia nhập cùng chúng tôi
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Kiến tạo trải nghiệm điện ảnh
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Tại CineBook, chúng tôi luôn tìm kiếm những con người đam mê điện ảnh và khao khát mang đến dịch vụ hoàn hảo nhất cho khách hàng. Hãy bắt đầu hành trình sự nghiệp tuyệt vời của bạn tại đây!
          </p>
        </div>
      </div>

      {/* Culture Section */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8 mb-20 text-center">
          <div className="space-y-3 p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="text-xl font-bold">🎯</span>
            </div>
            <h3 className="text-lg font-bold">Môi trường năng động</h3>
            <p className="text-sm text-muted-foreground">Làm việc trong không gian mở, đầy sáng tạo và luôn rộn rã tiếng cười.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="text-xl font-bold">🚀</span>
            </div>
            <h3 className="text-lg font-bold">Cơ hội thăng tiến</h3>
            <p className="text-sm text-muted-foreground">Lộ trình phát triển rõ ràng với các khóa đào tạo kỹ năng thường xuyên.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="text-xl font-bold">🍿</span>
            </div>
            <h3 className="text-lg font-bold">Đãi ngộ hấp dẫn</h3>
            <p className="text-sm text-muted-foreground">Lương thưởng cạnh tranh và tất nhiên, vé xem phim miễn phí hàng tháng!</p>
          </div>
        </div>

        {/* Jobs List */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Vị trí đang mở</h2>
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <Card key={idx} className="bg-card hover:border-primary/50 transition-colors group">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                      <Badge className="bg-secondary text-foreground hover:bg-secondary">{job.department}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.type}</span>
                    </div>
                  </div>
                  <Button className="shrink-0 gap-2 w-full md:w-auto">
                    Ứng tuyển ngay <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
