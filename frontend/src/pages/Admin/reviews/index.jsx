import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, EyeOff, Search, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import reviewApi from '@/api/reviewApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await reviewApi.getAllReviewsAdmin({ page, size: 20 });
      if (res.success && res.data) {
        setReviews(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đánh giá',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleToggleStatus = async (review) => {
    const newStatus = review.status === 'Active' ? 'Deleted' : 'Active';
    try {
      const res = await reviewApi.updateReviewStatus(review.id, newStatus);
      if (res.success) {
        toast({
          title: 'Thành công',
          description: `Đã ${newStatus === 'Deleted' ? 'ẩn' : 'hiện'} bình luận này.`,
        });
        // Update local state
        setReviews(reviews.map(r => r.id === review.id ? { ...r, status: newStatus } : r));
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.comment?.toLowerCase().includes(search.toLowerCase()) || 
    r.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Đánh giá</h2>
        <p className="text-muted-foreground">
          Xem và kiểm duyệt các đánh giá phim từ người dùng.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-lg">Danh sách Đánh giá</CardTitle>
            <CardDescription>Hiển thị tất cả đánh giá trên hệ thống</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nội dung..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Chất lượng</TableHead>
                <TableHead className="max-w-md">Bình luận</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy đánh giá nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.customerName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        {review.rating} <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate" title={review.comment}>
                        {review.comment || <span className="text-muted-foreground italic">Không có bình luận</span>}
                      </p>
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.status === 'Active' ? 'success' : 'secondary'}>
                        {review.status === 'Active' ? 'Hiển thị' : 'Đã ẩn'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={review.status === 'Active' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleToggleStatus(review)}
                      >
                        {review.status === 'Active' ? (
                          <><EyeOff className="w-4 h-4 mr-2" /> Ẩn</>
                        ) : (
                          <><Eye className="w-4 h-4 mr-2" /> Hiển thị</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
