import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/utils/format"
import { Post } from "@/type/post"
import { ChevronRight } from "lucide-react"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  const imageUrl = post.imageList && post.imageList.length > 0 
    ? post.imageList[0] 
    : "/placeholder.svg?height=400&width=600"

  return (
    <Card className="overflow-hidden hover:cursor-pointer" onClick={() => router.push(`/tin-tuc/${post.id}`)}>
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={post.title}
          className="object-cover w-full h-full transition-transform"
        />
      </div>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription className="flex justify-between">
          <span>{formatDate(post.createdAt)}</span>
          <span className="text-sm text-muted-foreground">{post.authorName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">
          {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>
      </CardContent>
      {/* <CardFooter className="flex justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/tin-tuc/${post.id}`}>Đọc thêm <ChevronRight /></Link>
        </Button>
      </CardFooter> */}
    </Card>
  )
}
