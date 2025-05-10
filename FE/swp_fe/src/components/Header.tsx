"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { UserLogin } from "@/lib/users";
import Image from "next/image";
import { getMyInfo } from "@/api/usersApi";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { getNotifications, readAllNotifications, readNotificationById } from "@/api/notifications";
import { Badge } from "./ui/badge";
import { useStorage } from "@/hooks/useLocalStorage";

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Thông tin cơ sở", href: "/thong-tin-co-so" },
  { name: "Cẩm nang tiêm chủng", href: "/cam-nang-tiem-chung" },
  { name: "Bảng giá", href: "/bang-gia" },
  { name: "Đặt mua vắc xin", href: "/vaccines" },
  { name: "Tin tức", href: "/tin-tuc" },
];

export default function Header() {
  const [user, setUser] = useState<UserLogin | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [token, setToken, loadToken] = useStorage<string | null>("token", null);

  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const loadAndSetToken = async () => {
      await loadToken();
    };
    
    loadAndSetToken();
  }, [pathname]);

  useEffect(() => {
    if (token) {
      getMyInfo()
        .then((res) => {
          if (res) {
            setUser(res);
          }
        })
    }
  }, [token]);


  // Fetch notifications once user is loaded
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await getNotifications();
      // Assuming your API returns an array of notifications
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id: number) => {
    try {
      await readNotificationById(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await readAllNotifications();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readStatus: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read", error);
    }
  };

  // Compute the unread count
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <div className="bg-white relative z-auto">
      <header className="relative bg-white">
        <nav aria-label="Top" className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto py-2 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                width={100}
                height={100}
                alt="Vaxchild logo with text"
                src="/img/logo-text.webp"
                className="h-20 w-auto"
              />
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[#53d7f7] font-bold">
                  Hotline: 028 7102 6595
                </div>
                <div className="text-xs text-gray-600">
                  Mở cửa 7h30 - 17h00 / T2 - CN xuyên trưa*
                </div>
              </div>
            </div>
          </div>

          <div className="container border-b border-gray-200 mx-auto">
            <div className="flex h-16 items-center">
                <div className="flex h-full space-x-8 pl-5">
                  {navigation.map((page) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className="flex items-center text-sm font-bold text-gray-700 hover:text-gray-800 hover:underline hover:cursor-pointer"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>

              {user != null ? (
                <div className="ml-auto flex items-center gap-4">
                  {/* User Avatar with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/images/placeholder-user.webp" alt="User" />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-sm">
                          <span className="font-medium">{user?.fullname}</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Menu</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem
                        onClick={() => {
                          router.push("/thong-bao");
                        }}
                      >
                        Thông báo
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/children-profile");
                        }}
                      >
                        Hồ sơ trẻ em
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/feedback");
                        }}
                      >
                        Đánh giá của tôi
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/reaction-after-injection");
                        }}
                      >
                        Phản ứng sau tiêm
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/my-order");
                        }}
                      >
                        Lịch tiêm chủng
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/vaccination-schedule");
                        }}
                      >
                        Lịch sử tiêm chủng
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setToken(null);
                          router.push("/login");
                        }}
                      >
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5 text-black" />
                        {unreadCount > 0 && (
                          <Badge
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white"
                            variant="destructive"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0" align="end">
                      <div className="flex items-center justify-between border-b p-3">
                        <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-blue-600"
                            onClick={() => markAllAsRead()}
                          >
                            Mark all as read
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <DropdownMenuItem
                              key={notification.id}
                              className={`flex cursor-pointer flex-col p-3 hover:bg-gray-50 ${
                                !notification.readStatus ? "bg-blue-50" : ""
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex gap-1">
                                {!notification.readStatus && (
                                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                )}
                                <p className="text-sm text-gray-600">{notification.message}</p>
                              </div>
                              <span className="ml-6 w-full text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            {loadingNotifications ? "Loading..." : "No notifications"}
                          </div>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-sm text-blue-600"
                          onClick={() => router.push("/thong-bao")}
                        >
                          View all notifications
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )  : (
                <div className="ml-auto flex items-center">
                  <div className="flex flex-1 items-center justify-end space-x-6">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      Đăng nhập
                    </Link>
                    <span aria-hidden="true" className="h-6 w-px bg-gray-200" />
                    <Link
                      href="/create-account"
                      className="text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      Tạo tài khoản
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
