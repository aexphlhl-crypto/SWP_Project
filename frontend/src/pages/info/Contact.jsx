import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="bg-primary/5 py-16 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-muted-foreground">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc mọi nơi.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Trụ sở chính</h3>
                    <p className="text-sm text-muted-foreground">123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Hotline CSKH</h3>
                    <p className="text-sm text-muted-foreground">1900 123 456 (8:00 - 22:00 hàng ngày)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email hỗ trợ</h3>
                    <p className="text-sm text-muted-foreground">support@cinebook.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Placeholder */}
            <div className="w-full h-[300px] bg-muted rounded-xl overflow-hidden border border-border flex items-center justify-center">
              <span className="text-muted-foreground">Bản đồ (Google Maps Integration)</span>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn</h2>
                <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" placeholder="Nguyễn Văn A" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="example@gmail.com" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Chủ đề</Label>
                    <Input id="topic" placeholder="Vấn đề cần hỗ trợ..." className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Nội dung tin nhắn</Label>
                    <Textarea id="message" rows={5} placeholder="Nhập nội dung chi tiết..." className="bg-background resize-none" />
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Send className="w-4 h-4" /> Gửi tin nhắn
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
