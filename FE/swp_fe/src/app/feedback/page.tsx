"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, Search } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/components/ui/input";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getfeedback } from "@/api/feedback";
import { Feedback } from "@/type/feedback";

export default function ReviewListPage() {
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [filterRating] = useState("all");
  const [filterStatus] = useState("all");
  const [sortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const fetchProducts = useCallback(async () => {
    try {
      const response = await getfeedback();
      setReviews(response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => {
      // Filter by rating
      if (
        filterRating !== "all" &&
        review.rating !== Number.parseInt(filterRating)
      ) {
        return false;
      }
      // Filter by reply status
      if (filterStatus === "replied" && !review.replied) {
        return false;
      }
      if (filterStatus === "not_replied" && review.replied) {
        return false;
      }
      // Filter by search term
      if (
        searchTerm &&
        !review.comment.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !review. fullname.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Danh sách đánh giá</h1>
        <p className="text-muted-foreground">
          Quản lý và phản hồi đánh giá của khách hàng
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Tìm kiếm đánh giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* <Avatar>
                    <AvatarImage
                      src={
                        review.user.avatarUrl ||
                        `/placeholder.svg?height=40&width=40`
                      }
                      alt={review.user.fullname}
                    />
                    <AvatarFallback>
                      {review.user.fullname.charAt(0)}
                    </AvatarFallback>
                  </Avatar> */}
                  <div>
                    <h3 className="font-medium">{review.fullname}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(
                          new Date(review.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-gray-700">{review.comment}</p>
              </div>

              {review.staffReply && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">AD</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      Phản hồi từ Nhân viên
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {review.staffReply}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-500">
              Không tìm thấy đánh giá nào phù hợp với bộ lọc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
