"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Facebook, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button"; 
import { Post } from "@/lib/post";
import { useParams } from "next/navigation";
import { getPostById } from "@/api/postApi";
import { useCallback, useEffect, useState } from "react";
import Posts from "@/components/post";

export default function PostId() {
  const [product, setProduct] = useState<Post[]>();
  const { id } = useParams<{ id: string }>();
  const fetchProduct = useCallback(async () => {
    try {
      const response = await getPostById(id);

      setProduct(response);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return (
    <div className="container min-h-screen mx-auto px-4 py-10 sm:px-6 lg:max-w-7xl lg:px-8">
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/tin-tuc" className="hover:text-blue-600">
            Tin tức hoạt động
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-gray-400">{product && product[0]?.title}</span>
        </nav>

        {/* Article */}
        <article className="rounded-lg border bg-white p-6">
          <h1 className="mb-6 text-2xl font-bold text-blue-800 md:text-3xl">
            {product && product[0]?.title}
          </h1>

          {/* Author Info */}
          <div className="mb-6 flex items-center gap-4">
            <Image
              src="https://avatars.githubusercontent.com/u/124599?v=4"
              alt="Author"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{product && product[0]?.authorName}</p>
              <p className="text-sm text-gray-500">
                {product && product[0]?.createdAt}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2"></div>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            <p className="mb-4 text-gray-600 italic">
              {product && product[0]?.content}
            </p>

            <p className="mb-4 text-gray-600 italic">
              {product && product[0]?.content}
            </p>

            <div className="my-6">
              {product &&
                product[0]?.imageList.map((image, index) => (
                  <div key={index} className="mb-4">
                    <Image
                      src={
                        (product && product[0]?.imageList[0]) ||
                        "/placeholder.svg"
                      }
                      alt="Cụ bà tham gia buổi tư vấn"
                      width={800}
                      height={450}
                      className="rounded-lg"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Social Share */}
        </article>

        <Posts posts={[]} />
      </main>
    </div>
  );
}
