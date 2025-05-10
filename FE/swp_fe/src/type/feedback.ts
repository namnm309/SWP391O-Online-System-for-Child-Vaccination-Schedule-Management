import { User } from "@/type/user"

export interface Feedback {
  id: number
  username: string,
  fullname: string,
  rating: number
  comment: string
  staffReply: string
  replied: boolean
  createdAt: string
  updatedAt: string
}