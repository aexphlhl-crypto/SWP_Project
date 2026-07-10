import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import reviewApi from '@/api/reviewApi';
import { toast } from 'sonner';

export function ReviewModal({ isOpen, onClose, booking, onReviewSuccess }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExisting, setHasExisting] = useState(false);

  const extractBookingId = (id) => {
    if (typeof id === 'string' && id.startsWith('BK')) {
      return parseInt(id.replace('BK', ''), 10);
    }
    return id;
  };

  useEffect(() => {
    if (isOpen && booking) {
      const rawBookingId = extractBookingId(booking.id);
      // Check if user already reviewed this booking
      const fetchReview = async () => {
        setIsLoading(true);
        try {
          const res = await reviewApi.getReviewByBookingId(rawBookingId);
          if (res.success && res.data) {
            setRating(res.data.rating);
            setComment(res.data.comment);
            setHasExisting(true);
          }
        } catch (error) {
          // It's normal if it returns 404/NOT_FOUND meaning no review yet
          console.log("No existing review found.");
          setHasExisting(false);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReview();
    } else {
      setRating(0);
      setComment('');
      setHoverRating(0);
      setHasExisting(false);
    }
  }, [isOpen, booking]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao để đánh giá.");
      return;
    }

    setIsSubmitting(true);
    try {
      const rawBookingId = extractBookingId(booking.id);
      const res = await reviewApi.createReview({
        customerId: user?.id,
        movieId: booking?.showtime?.movieId || booking?.movie?.id || booking?.movieId || 1, // Fallback if missing
        bookingId: rawBookingId,
        rating,
        comment
      });

      if (res.success) {
        toast.success(hasExisting ? "Đánh giá của bạn đã được cập nhật." : "Đánh giá của bạn đã được ghi nhận.");
        onReviewSuccess?.(res.data);
        onClose();
      } else {
        throw new Error(res.error?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error(error.error?.message || error.message || "Không thể gửi đánh giá lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{hasExisting ? "Cập nhật Đánh giá" : "Đánh giá Phim"}</DialogTitle>
          <DialogDescription>
            Chia sẻ cảm nhận của bạn về bộ phim này.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-4">Đang tải...</div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium">Chất lượng phim (Sao)</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-8 cursor-pointer transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Bình luận của bạn</span>
              <Textarea
                placeholder="Phim rất hay, nội dung hấp dẫn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Đang xử lý..." : (hasExisting ? "Cập nhật đánh giá" : "Gửi đánh giá")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
