import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-secondary/30 py-16 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Điều khoản sử dụng</h1>
          <p className="text-muted-foreground">Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Chấp thuận điều khoản</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bằng việc truy cập và sử dụng website/ứng dụng CineBook, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại trang này. Nếu không đồng ý với bất kỳ phần nào, vui lòng ngưng sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Quy định đặt vé</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Mỗi giao dịch đặt tối đa 8 vé để chống hành vi đầu cơ.</li>
              <li>Vé đã mua (thanh toán thành công) sẽ KHÔNG được hoàn tiền hay đổi trả trừ trường hợp bất khả kháng từ phía rạp chiếu.</li>
              <li>Người dùng phải xuất trình mã QR hợp lệ để nhận vé. CineBook không chịu trách nhiệm nếu mã QR bị lộ do lỗi của người dùng dẫn đến mất vé.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Chợ bán lại (Resale)</h2>
            <p className="text-muted-foreground leading-relaxed">
              CineBook cung cấp tính năng "Đăng bán lại" cho phép người dùng tự thỏa thuận chuyển nhượng vé. Tuy nhiên:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
              <li>Chúng tôi chỉ cung cấp không gian đăng tin, KHÔNG thu phí giao dịch và KHÔNG can thiệp vào quá trình thanh toán giữa hai bên mua bán.</li>
              <li>CineBook không chịu trách nhiệm pháp lý về các rủi ro gian lận khi mua bán vé chợ đen. Khuyến cáo luôn kiểm tra kỹ người bán.</li>
              <li>Vé chỉ được phép đăng bán lại trước giờ chiếu tối thiểu 2 tiếng.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Bản quyền nội dung</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tất cả hình ảnh, logo, tên phim, và thông tin được đăng tải trên CineBook đều thuộc bản quyền của nhà sản xuất, nhà phát hành hoặc CineBook. Mọi hành vi sao chép trái phép vì mục đích thương mại đều bị nghiêm cấm.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
