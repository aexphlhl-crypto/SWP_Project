import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-secondary/30 py-16 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Chính sách bảo mật</h1>
          <p className="text-muted-foreground">Cập nhật lần cuối: 21/07/2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Mục đích thu thập dữ liệu</h2>
            <p className="text-muted-foreground leading-relaxed">
              CineBook thu thập thông tin cá nhân của bạn (bao gồm họ tên, số điện thoại, email) nhằm mục đích:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
              <li>Xác nhận thông tin đặt vé và thanh toán.</li>
              <li>Gửi mã vé điện tử QR Code để sử dụng tại rạp.</li>
              <li>Cung cấp hỗ trợ khách hàng và giải quyết khiếu nại.</li>
              <li>Thông báo về các chương trình khuyến mãi, phim mới (nếu bạn đồng ý).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Bảo vệ thông tin</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của người dùng bằng các biện pháp công nghệ mã hóa tiên tiến nhất (SSL/TLS). Dữ liệu thanh toán của bạn được xử lý hoàn toàn bởi các cổng thanh toán được chứng nhận (như VNPay) và chúng tôi không lưu trữ trực tiếp số thẻ tín dụng hay thông tin ngân hàng của bạn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Chia sẻ thông tin</h2>
            <p className="text-muted-foreground leading-relaxed">
              CineBook tuyệt đối không mua bán, trao đổi thông tin khách hàng cho bên thứ ba vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-2">
              <li>Cho hệ thống rạp chiếu phim đối tác để xác nhận vé.</li>
              <li>Khi có yêu cầu hợp pháp từ cơ quan điều tra có thẩm quyền.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Quyền của người dùng</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa bỏ tài khoản và thông tin cá nhân của mình trên hệ thống CineBook bất cứ lúc nào thông qua phần Cài đặt tài khoản.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
