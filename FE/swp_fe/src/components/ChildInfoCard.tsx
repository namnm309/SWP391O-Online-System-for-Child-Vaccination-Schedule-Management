"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, EditIcon } from "lucide-react"
import { Child } from "@/type/user"
import { formatDate } from "@/utils/format"
import { upcomingVaccine } from "@/api/childrenApi"

interface ChildInfoCardProps {
  child: Child
}

export function ChildInfoCard({ child }: ChildInfoCardProps) {
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<any[] | null>([])

  const fetchUpcomingVaccinations = async () => {
    try {
      const response = await upcomingVaccine(child.childId)
      setUpcomingVaccinations(response.data)
    } catch (error) {
      console.error("Error fetching upcoming vaccinations:", error)
    }
  }

  useEffect(() => {
    fetchUpcomingVaccinations()
  }, [child.childId])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="relative flex items-center gap-4 mb-4">
            <Avatar className="relative !h-20 !w-20">
              <AvatarImage src={child.avatarUrl} alt={child.fullname} />
              <AvatarFallback>{child.fullname.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-2 left-[14px] bg-blue-600 text-white px-2 py-1 rounded-full">{`id: ${child.childId}`}</span>
            <div>
              <CardTitle>{child.fullname}</CardTitle>
              <CardDescription>
                {child.gender}, {formatDate(child.birthDate)}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/profile/children/${child.childId}/edit`}>
                <EditIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="upcoming">Lịch tiêm sắp tới</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Chiều cao</p>
                <p className="text-sm text-muted-foreground">{child.height} cm</p>
              </div>
              <div>
                <p className="text-sm font-medium">Cân nặng</p>
                <p className="text-sm text-muted-foreground">{child.weight} kg</p>
              </div>
              <div>
                <p className="text-sm font-medium">Quan hệ</p>
                <p className="text-sm text-muted-foreground">{child.relatives[0]?.relationshipType} kg</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            {upcomingVaccinations && upcomingVaccinations.length > 0 ? (
              <div className="space-y-3">
                {upcomingVaccinations.slice(0, 3).map((upcoming) => (
                    <div key={upcoming.id} className="rounded-md border p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{upcoming.vaccineName}</p>
                          <p className="text-xs text-muted-foreground">Liều {upcoming.doseNumber}</p>
                        </div>
                        <p className="text-xs">{formatDate(upcoming.date)}</p>
                      </div>
                      {upcoming.nextDoseDate && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Liều tiếp theo: {formatDate(upcoming.nextDoseDate)}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có lịch tiêm chủng</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/children-profile/${child.childId}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

