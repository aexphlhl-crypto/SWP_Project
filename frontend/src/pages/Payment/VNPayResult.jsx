"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Ticket, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import bookingApi from '@/api/bookingApi';

const VNPay_ERROR_CODES = {
  '01': 'Giao dịch chưa hoàn tất',
  '02': 'Giao dịch bị lỗi',
  '04': 'Giao dịch đảo (đã hoàn tiền)',
  '05': 'VNPAY đang xử lý',
  '06': 'VNPAY gửi yêu cầu hoàn tiền',
  '07': 'Giao dịch bị nghi ngờ gian lận',
  '09': 'Giao dịch bị từ chối (thẻ/tài khoản không đăng ký dịch vụ)',
  '10': 'Khách hàng xác thực thông tin thẻ/tài khoản quá 3 lần',
  '11': 'Đã hết hạn chờ thanh toán',
  '12': 'Thẻ/Tài khoản bị khóa',
  '13': 'Sai mật khẩu OTP',
  '24': 'Khách hàng hủy giao dịch',
  '51': 'Tài khoản không đủ số dư',
  '65': 'Vượt quá hạn mức giao dịch trong ngày',
  '75': 'Ngân hàng thanh toán đang bảo trì',
  '79': 'Nhập sai mật khẩu thanh toán quá số lần',
  '99': 'Lỗi không xác định',
  'INVALID_SIGNATURE': 'Chữ ký giao dịch không hợp lệ',
  'SERVER_ERROR': 'Lỗi máy chủ xử lý giao dịch',
};

export default function VNPayResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status'); // 'success' | 'failed' | 'error'
  const bookingId = searchParams.get('bookingId');
  const txnRef = searchParams.get('txnRef');
  const code = searchParams.get('code');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId && status === 'success') {
      bookingApi.getBookingById(bookingId)
        .then(res => {
          if (res.success) setBooking(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [bookingId, status]);

  const errorMessage = code ? (VNPay_ERROR_CODES[code] || `Lỗi: ${code}`) : 'Giao dịch không thành công';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang xác nhận giao dịch...</p>
      </div>
    );
  }

  // ---- SUCCESS ----
  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card className="bg-card border-border overflow-hidden">
          {/* Green top bar */}
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardContent className="pt-8 pb-8 space-y-6 text-center">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-green-500">Thanh toán thành công!</h1>
              <p className="text-muted-foreground text-sm">
                Đơn đặt vé của bạn đã được xác nhận
              </p>
            </div>

            {/* Booking Info */}
            {booking && (
              <>
                <Separator />
                <div className="text-left space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đặt vé</span>
                    <span className="font-mono font-bold text-primary">#{bookingId}</span>
                  </div>
                  {txnRef && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã GD VNPay</span>
                      <span className="font-mono text-xs text-muted-foreground">{txnRef}</span>
                    </div>
                  )}
                  {booking.movie && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phim</span>
                      <span className="font-medium text-right max-w-[60%]">{booking.movie}</span>
                    </div>
                  )}
                  {booking.totalAfterTax && (
                    <div className="flex justify-between font-bold text-base">
                      <span>Số tiền</span>
                      <span className="text-primary">{booking.totalAfterTax.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {!booking && bookingId && (
              <>
                <Separator />
                <div className="text-sm">
                  <p className="text-muted-foreground">Mã đặt vé</p>
                  <p className="font-mono font-bold text-primary text-lg">#{bookingId}</p>
                </div>
                <Separator />
              </>
            )}

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs text-muted-foreground">
              📧 Vé điện tử sẽ được gửi đến email của bạn trong vài phút
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full gap-2" asChild>
                <Link to="/my-tickets">
                  <Ticket className="w-4 h-4" />
                  Xem vé của tôi
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Về trang chủ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- FAILED / ERROR ----
  const isCancelled = code === '24';
  const Icon = isCancelled ? AlertCircle : XCircle;
  const iconColor = isCancelled ? 'text-amber-500' : 'text-red-500';
  const barColor = isCancelled ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-600';
  const bgColor = isCancelled ? 'bg-amber-500/15' : 'bg-red-500/15';
  const title = isCancelled ? 'Giao dịch bị hủy' : 'Thanh toán thất bại';
  const titleColor = isCancelled ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Card className="bg-card border-border overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${barColor}`} />
        <CardContent className="pt-8 pb-8 space-y-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full ${bgColor} flex items-center justify-center`}>
              <Icon className={`w-12 h-12 ${iconColor}`} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className={`text-2xl font-bold ${titleColor}`}>{title}</h1>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>
          </div>

          {bookingId && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Mã đặt vé <span className="font-mono font-bold text-foreground">#{bookingId}</span> đã bị hủy.</p>
                <p className="mt-1">Ghế sẽ được giải phóng tự động.</p>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Button
              className="w-full gap-2"
              onClick={() => navigate(-2)}
            >
              <RotateCcw className="w-4 h-4" />
              Thử lại thanh toán
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">Về trang chủ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
