import { Children } from "@/lib/children"; 
import Link from "next/link";

export function ChildProfileCard({
  childId,
  fullname,
  birthDate,
  avatarUrl,
}: Children) {
  return (
    <Link
      href={`/children-profile/${childId}`}
      className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400" />

      <div className="p-6 flex gap-6">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center border-2 border-purple-100">
              {/* <User className="w-12 h-12 text-purple-400" /> */}
              <img
                alt={avatarUrl}
                src={avatarUrl}
                className="!aspect-square !w-24 !h-24 rounded-xl bg-gray-200 object-cover group-hover:opacity-75 sm:aspect-auto "
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-xs text-white shadow-sm">
              ID:{childId}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm text-gray-500">Họ và tên trẻ:</label>
            <div className="font-semibold text-lg bg-clip-text">
              {fullname || "---"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <label className="text-sm">Ngày sinh:</label>&nbsp;
              {birthDate
                ? new Date(birthDate).toLocaleDateString("vi-VN")
                : "---"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
