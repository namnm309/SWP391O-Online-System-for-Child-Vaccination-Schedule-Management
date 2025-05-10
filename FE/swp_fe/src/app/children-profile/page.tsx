"use client";
import { createChild, getMyInfo } from "@/api/usersApi";
import { ChildInfoCard } from "@/components/ChildInfoCard";
import { Child } from "@/type/user";
import { useCallback, useEffect, useState } from "react";

export default function ChildrenList() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newChild, setNewChild] = useState({
    name: "",
    bod: "",
    gender: "Nam",
    height: "",
    weight: "",
    relationshipType: "CHA_ME",
    avatar: null as File | null,
  });

  const fetchChildren = useCallback(async () => {
    try {
      const response = await getMyInfo();
      setChildren(response.children);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCreateChild = async () => {
    try {
      await createChild({
        fullname: newChild.name,
        bod: newChild.bod,
        gender: newChild.gender,
        height: parseInt(newChild.height),
        weight: parseInt(newChild.weight),
        relationshipType: newChild.relationshipType,
        avatar: newChild.avatar as File | null,
      });
      fetchChildren();
      setIsPopupOpen(false);
      setNewChild({
        name: "",
        bod: "",
        gender: "Nam",
        height: "",
        weight: "",
        relationshipType: "CHA_ME",
        avatar: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return (
    <>
      <div className="min-h-screen w-full mx-auto mt-4">
        <div className="container mx-auto px-4">
          <div className="container w-full flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Hồ sơ con cái</h1>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setIsPopupOpen(true)}
            >
              Thêm trẻ em
            </button>
          </div>
        </div>

        {children.length > 0 && (
          <div className="container w-full mx-auto grid gap-6 md:grid-cols-3">
            {children.map((child) => (
              <ChildInfoCard key={child.childId} child={child} />
            ))}
          </div>
        )}

        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl font-bold mb-4">Thêm trẻ em</h2>
              <input
                type="text"
                placeholder="Tên"
                value={newChild.name}
                onChange={(e) =>
                  setNewChild({ ...newChild, name: e.target.value })
                }
                className="border p-2 mb-4 w-full"
              />
              <input
                type="date"
                placeholder="Ngày sinh"
                value={newChild.bod}
                onChange={(e) =>
                  setNewChild({ ...newChild, bod: e.target.value })
                }
                className="border p-2 mb-4 w-full"
              />
              <select
                value={newChild.gender}
                onChange={(e) =>
                  setNewChild({ ...newChild, gender: e.target.value })
                }
                className="border p-2 mb-4 w-full"
              >
                <option value={"Nam"}>Nam</option>
                <option value={"Nữ"}>Nữ</option>
              </select>
              <input
                type="number"
                placeholder="Chiều cao (cm)"
                value={newChild.height}
                onChange={(e) =>
                  setNewChild({ ...newChild, height: e.target.value })
                }
                className="border p-2 mb-4 w-full"
              />
              <input
                type="number"
                placeholder="Cân nặng (kg)"
                value={newChild.weight}
                onChange={(e) =>
                  setNewChild({ ...newChild, weight: e.target.value })
                }
                className="border p-2 mb-4 w-full"
              />
              <select
                value={newChild.relationshipType}
                onChange={(e) =>
                  setNewChild({
                    ...newChild,
                    relationshipType: e.target.value,
                  })
                }
                className="border p-2 mb-4 w-full"
              >
                <option value="ANH_CHI">Anh/Chị</option>
                <option value="CHU_THIEM">Chú/Thím</option>
                <option value="CHA_ME">Cha/Mẹ</option>
                <option value="ONG_BA">Ông/Bà</option>
              </select>
              <input
                type="file"
                onChange={(e) =>
                  setNewChild({
                    ...newChild,
                    avatar: e.target.files ? e.target.files[0] : null,
                  })
                }
                className="border p-2 mb-4 w-full"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setIsPopupOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleCreateChild}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
