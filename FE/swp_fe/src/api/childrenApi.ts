import apiClient from "./api";
import { Children } from "@/lib/children";

export const getMyChildren = async () => {
  const response = await apiClient.get(`/user/my-children`);
  return response.data;
};
export const getMyChildrenId = async (id: number) => {
  const response = await apiClient.get(`/user/child/${id}`);
  return response.data;
};
export const getMyChildHistoryId = async (id: number) => {
  const response = await apiClient.get(`user/history`, {
    params: {
      childId: id,
    },
  });
  return response.data;
};
export const getMyChildrenUpcomingId = async (id: number) => {
  const response = await apiClient.get(`user/upcoming/${id}`);
  return response.data;
};
export const postMyChildren = async (data: Children) => {
  const response = await apiClient.post(`/user/child/create`, data);
  return response.data;
};

export const putMyChildren = async (id: number, data: Children) => {
  const response = await apiClient.put(`/user/children/${id}/update`, data);
  return response.data;
};

export const upcomingVaccine = async (id: number) => {
  const response = await apiClient.get(`/user/upcoming/${id}`, );
  return response.data;
};