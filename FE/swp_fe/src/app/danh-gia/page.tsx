"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { postfeedback } from "@/api/feedback";

export default function ServiceReviewPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate API call
      const postData = postfeedback({ rating, comment });
      postData.then((res) => {
      });

      setIsSubmitted(true);

      // Reset form after successful submission
      setRating(0);
      setComment("");
    } catch (err) {
      setError("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating: number) => {
    setHoveredRating(hoveredRating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleNewReview = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Cảm ơn bạn đã đánh giá!</CardTitle>
            <CardDescription>
              Phản hồi của bạn rất quan trọng để chúng tôi cải thiện dịch vụ.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4 flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {comment && (
              <div className="rounded-lg bg-gray-50 p-4 text-left">
                <p className="text-gray-600">{comment}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Về trang chủ
            </Button>
            <Button onClick={handleNewReview}>Đánh giá mới</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex   items-center justify-center  p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Đánh giá dịch vụ
            </CardTitle>
            <CardDescription className="text-center">
              Hãy chia sẻ trải nghiệm của bạn về dịch vụ của chúng tôi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Bạn đánh giá dịch vụ của chúng tôi như thế nào?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div
                className="flex justify-center space-x-2"
                onMouseLeave={handleRatingLeave}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-10 w-10 cursor-pointer transition-all ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => handleRatingHover(star)}
                  />
                ))}
              </div>
              <div className="mt-1 text-center text-sm">
                {rating > 0 && (
                  <span className="font-medium text-blue-600">
                    {rating === 1 && "Rất không hài lòng"}
                    {rating === 2 && "Không hài lòng"}
                    {rating === 3 && "Bình thường"}
                    {rating === 4 && "Hài lòng"}
                    {rating === 5 && "Rất hài lòng"}
                  </span>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="block text-sm font-medium">
                Nhận xét của bạn
              </label>
              <Textarea
                id="comment"
                placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi đánh giá
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
