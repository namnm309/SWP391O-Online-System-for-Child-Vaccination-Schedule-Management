"use client";
import { 
  Calendar,  
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { getNotifications } from "@/api/notifications";
import { Notification } from "@/lib/notification";
// Sample notification data

export default function NotificationsPage() {
  const [notifications, setnotifications] = useState<Notification[]>([]);

  const fetchnotifications = useCallback(async () => {
    try {
      const response = await getNotifications();
      setnotifications(response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchnotifications();
  }, [fetchnotifications]);
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:max-w-7xl lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">
            Xem tất cả thông báo và cập nhật mới nhất
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications
            .filter((n) => !n.readStatus)
            .map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationCard({ notification }:{notification: Notification}) {
 

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        !notification.readStatus ? "border-l-4 border-l-blue-500" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="font-semibold">{notification.message}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(notification.createdAt).toLocaleString()}
              </span> 
            </div>
          </div>
        </div>
      
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-gray-600">{notification.message}</p>
      </CardContent>
      {/* <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="link" className="h-8 px-0 text-blue-600">
          Xem chi tiết
        </Button>
        {!notification.readStatus && (
          <Button variant="outline" size="sm" className="h-8">
            Đánh dấu đã đọc
          </Button>
        )}
      </CardFooter> */}
    </Card>
  );
}
