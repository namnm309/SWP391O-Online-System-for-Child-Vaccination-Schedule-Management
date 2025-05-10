"use client";
import { getMyChildHistoryId, getMyChildrenId } from "@/api/childrenApi";
import { VaccinationCard } from "@/components/vaccination-card";
import { Children, HistoryChildren, UpcomingChildren } from "@/lib/children";
import { User, Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Dữ liệu mẫu cho các mũi tiêm

export default function ChildVaccinationDetails() {
  const [children, setChildren] = useState<Children | null>(null);
  const [upcomingChildren, setUpcomingChildren] =
    useState<UpcomingChildren | null>(null);
  const [childrenHistory, setChildrenHistory] =
    useState<HistoryChildren | null>(null);
  const { id } = useParams<{ id: string }>();
  const childId = Number.parseInt(id);

  const fetchChildrenId = useCallback(async () => {
    try {
      const response = await getMyChildrenId(childId);
      setChildren(response.result);
    } catch (error) {
      console.error(error);
    }
  }, [childId]);

  const fetchhildrenHistory = useCallback(async () => {
    try {
      const ChildrenHistory = await getMyChildHistoryId(childId);
      setChildrenHistory(ChildrenHistory.result || null);
    } catch (error) {
      console.error(error);
    }
  }, [childId]);

  const fetchhildrenUpcoming = useCallback(async () => {
    try {
      const ChildrenHistory = await getMyChildHistoryId(childId);
      setUpcomingChildren(ChildrenHistory.result || null);
    } catch (error) {
      console.error(error);
    }
  }, [childId]);

  useEffect(() => {
    fetchChildrenId();
    fetchhildrenHistory();
    fetchhildrenUpcoming();
  }, [fetchChildrenId, fetchhildrenHistory, fetchhildrenUpcoming]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-5xl font-bold">
                {children?.fullname?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {children?.fullname}
                </h1>
                <p className="text-gray-600 mb-4">Mã số: {children?.childId}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={20} />
                    <span>Ngày sinh: {children?.birthDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={20} />
                    <span>Giới tính: {children?.gender}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={20} />
                    <span>
                      Phụ huynh: {children?.relatives[0]?.fullname}(
                      {children?.relatives[0]?.relationshipType})
                    </span>
                  </div>
                  {/* <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={20} />
                    <span>Điện thoại: {children?.parentPhone}</span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mũi tiêm tiếp theo
        </h2>

        <div className="space-y-4">
          {upcomingChildren != null &&
            Array.isArray(upcomingChildren) &&
            upcomingChildren.map((vaccination) => (
              <VaccinationCard key={vaccination.id*3} {...vaccination} />
            ))}
        </div>

        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Lịch sử tiêm chủng
        </h2>

        <div className="space-y-4">
          {childrenHistory != null &&
            Array.isArray(childrenHistory) &&
            childrenHistory.map((vaccination) => (
              <VaccinationCard key={vaccination.id*123} {...vaccination} />
            ))}
        </div>
      </div>
    </div>
  );
}
