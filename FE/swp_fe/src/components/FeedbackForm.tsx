"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { UserLogin } from "@/lib/users";


export function FeedbackForm() {
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Vui lòng chọn đánh giá",
        description: "Hãy chọn số sao đánh giá trước khi gửi phản hồi",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Vui lòng nhập nội dung phản hồi",
        description: "Hãy chia sẻ trải nghiệm của bạn với chúng tôi",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      toast({
        title: "Gửi phản hồi thành công",
        description: "Cảm ơn bạn đã chia sẻ ý kiến với chúng tôi!",
      })
      setComment("")
      setRating(0)
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chia sẻ trải nghiệm của bạn</CardTitle>
        <CardDescription>Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium">Đánh giá của bạn</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-6 w-6 cursor-pointer ${
                    star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating} sao` : "Chưa đánh giá"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Nội dung phản hồi
            </label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ tiêm chủng của chúng tôi..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

