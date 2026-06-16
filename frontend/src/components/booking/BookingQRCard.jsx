import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * BookingQRCard - Hiển thị QR Code động cho từng vé (ghế hoặc F&B).
 * @param {Array} tickets - Mảng TicketDto từ API: [{ ticketCode, qrCodeValue, seatLabel, seatType }]
 * @param {number} size - Kích thước QR (mặc định 180)
 */
export function BookingQRCard({ tickets = [], size = 180 }) {
  const [idx, setIdx] = useState(0);

  if (!tickets.length) return null;

  const current = tickets[idx];
  const isFnb = current.seatType === 'FNB';

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* QR thật được tạo từ qrCodeValue của backend (VD: "BK001-A1") */}
      <div className="p-4 bg-white rounded-xl shadow-sm border">
        <QRCodeSVG
          value={current.qrCodeValue || current.ticketCode || 'CINEBOOK'}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>

      {/* Mã vé dạng monospace */}
      <p className="font-mono text-sm font-bold tracking-wider text-center">
        {current.ticketCode}
      </p>

      {/* Badge loại vé */}
      <Badge
        variant={isFnb ? 'secondary' : 'outline'}
        className="text-xs px-3 py-1"
      >
        {isFnb ? '🍿 Đồ ăn & Thức uống' : `💺 Ghế ${current.seatLabel}`}
      </Badge>

      {/* Điều hướng giữa nhiều vé */}
      {tickets.length > 1 && (
        <div className="flex items-center gap-4 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIdx(p => Math.max(0, p - 1))}
            disabled={idx === 0}
          >
            ‹
          </Button>
          <span className="text-xs text-muted-foreground font-medium">
            Vé {idx + 1} / {tickets.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIdx(p => Math.min(tickets.length - 1, p + 1))}
            disabled={idx === tickets.length - 1}
          >
            ›
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {isFnb
          ? 'Xuất trình mã QR này tại quầy bắp nước'
          : 'Xuất trình mã QR tại cổng soát vé để vào rạp'}
      </p>
    </div>
  );
}
