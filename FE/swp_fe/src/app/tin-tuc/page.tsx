"use client"
import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getPosts } from "@/api/postApi"
import { Post } from "@/type/post"
import { formatDate } from "@/utils/format"


export default function PostsPage() {

  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  
  const fetchPosts = useCallback(async () => {
    try {
      const response = await getPosts();
      setPosts(response);
    } catch (error) {
      console.error(error);
    }
  }, []);
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
      <main className="flex-1 mx-auto">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tin Tức Y Tế & Tiêm Chủng</h1>
              <p className="container text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Cập nhật thông tin mới nhất về vắc-xin, dịch bệnh và các khuyến cáo y tế từ các chuyên gia hàng đầu.
              </p>
            </div>
          </div>
        </section>

        {/* Featured News */}
        <section className="w-full py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Tin Tức Nổi Bật</h2>
            <div className="grid gap-6 lg:grid-cols-4">
              {posts.map((post) => (
                <Card key={post.id} className="flex flex-col overflow-hidden hover:cursor-pointer" onClick={() => router.push(`/tin-tuc/${post.id}`)}>
                  <div className="aspect-video w-full overflow-hidden">
                    <Image
                      src={post.imageList[0] || "/placeholder.svg"}
                      alt={post.title}
                      width={600}
                      height={340}
                      className="object-cover w-full h-full transition-transform"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CardDescription>{formatDate(post.createdAt)}</CardDescription>
                    </div>
                    {/* <Button
                      variant="ghost"
                      asChild
                      className="p-0 h-auto font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      <Link href={`/tin-tuc/${post.id}`}>Đọc tiếp</Link>
                    </Button> */}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>)
}

