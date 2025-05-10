
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon } from "lucide-react"
import type { Feedback } from "@/type/feedback"
import { formatDate } from "@/utils/format"

interface FeedbackCardProps {
  feedback: Feedback
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="font-semibold">{feedback.fullname}</div>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${i < feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
        <CardDescription>{formatDate(feedback.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{feedback.comment}</p>
        {feedback.replied && feedback.staffReply && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Nhân viên</Badge>
              <span className="text-sm font-medium">Phản hồi</span>
            </div>
            <p className="text-sm">{feedback.staffReply}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

