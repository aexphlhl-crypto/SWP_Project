import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQPage() {
  const faqs = [
    {
      q: 'Làm thế nào để tôi có thể đặt vé trực tuyến?',
      a: 'Bạn chỉ cần tạo tài khoản hoặc đăng nhập, chọn bộ phim yêu thích, rạp chiếu, suất chiếu và chỗ ngồi. Sau đó tiến hành thanh toán là hoàn tất.'
    },
    {
      q: 'Tôi có thể hủy hoặc đổi vé sau khi đã thanh toán không?',
      a: 'Theo quy định hiện hành, CineBook không hỗ trợ hoàn hủy vé đã thanh toán thành công trừ trường hợp rạp chiếu gặp sự cố kỹ thuật. Tuy nhiên, bạn có thể sử dụng tính năng "Đăng bán lại" để nhượng lại vé cho người khác trên chợ vé của chúng tôi.'
    },
    {
      q: 'Tính năng Đăng bán lại vé hoạt động như thế nào?',
      a: 'Nếu bạn không thể xem phim, bạn có thể chọn vé đó trong mục "Vé của tôi" và nhấn "Đăng bán lại". Hệ thống chỉ cho phép bán lại các vé còn cách giờ chiếu ít nhất 2 tiếng.'
    },
    {
      q: 'Tôi có cần in vé ra giấy khi đến rạp không?',
      a: 'Không cần. Bạn chỉ cần mở ứng dụng/website CineBook, vào mục "Vé của tôi", mở mã QR của vé và đưa cho nhân viên tại quầy soát vé để quét.'
    },
    {
      q: 'Làm sao để tôi áp dụng mã khuyến mãi?',
      a: 'Ở bước Thanh toán, bạn sẽ thấy ô "Mã khuyến mãi". Nhập mã vào và nhấn "Áp dụng", tổng tiền sẽ được tự động giảm trừ nếu mã hợp lệ.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary/5 py-16 border-b border-border text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Câu hỏi thường gặp (FAQ)</h1>
          <p className="text-muted-foreground">Giải đáp những thắc mắc phổ biến nhất của người dùng khi sử dụng dịch vụ CineBook.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="bg-card border border-border rounded-lg px-4 shadow-sm">
              <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
