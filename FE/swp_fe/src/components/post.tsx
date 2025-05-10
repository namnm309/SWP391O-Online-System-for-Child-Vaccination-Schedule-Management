"use client";
import Link from "next/link";
import { PostCard } from "./PostCard";
import { Post } from "@/type/post";
import { Button } from "./ui/button";
import { ChevronRightIcon } from "lucide-react";

interface PostCarouselProps {
  posts: Post[]
}

export default function Posts({ posts }: PostCarouselProps) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Bài viết mới nhất</h2>
            <Button variant="ghost" className="gap-1" asChild>
              <Link href="/tin-tuc">
                Xem thêm <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
