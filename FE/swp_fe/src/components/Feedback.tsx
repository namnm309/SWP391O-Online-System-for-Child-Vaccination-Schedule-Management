import { getfeedback } from "@/api/feedback";
import { getMyInfo } from "@/api/usersApi";
import { FeedbackCard } from "@/components/FeedbackCard"
import { useStorage } from "@/hooks/useLocalStorage";
import { UserLogin } from "@/lib/users";
import type { Feedback } from "@/type/feedback"
import { useCallback, useEffect, useState } from "react";
import { FeedbackForm } from "./FeedbackForm";

export function Feedback() {
  const [token, setToken, loadToken] = useStorage<string | null>("token", null);
  const [user, setUser] = useState<UserLogin | null>(null);
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  const fetchFeedbacks = useCallback(async () => {
    try {
      const response = await getfeedback();
      setFeedbacks(response);
    } catch (error) {
      console.error(error);
    }
  }, []);
  
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
      if (token) {
        getMyInfo().then((res) => {
          setUser(res.result);
        });
      }
    }, [token]);

  return (
    <section className="w-full py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Phản hồi từ bệnh nhân</h2>

        {token && (
          <div className="mb-10">
            <FeedbackForm />
          </div>
        )}

        <div className="grid gap-6 grid-cols-3">
          {feedbacks.slice(0,4).map((item) => (
            <FeedbackCard key={item.id} feedback={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

