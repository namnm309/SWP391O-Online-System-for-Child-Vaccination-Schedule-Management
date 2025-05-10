import apiClient from "./api";


export const getNotifications = async () => {
  const response = await apiClient.get(`/notification/notifications`);
  return response.data;
};

export const readNotificationById = async (id: number) => {
  const response = await apiClient.put(`/notification/notifications/${id}/read`, id, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token"),
    },
  });
  return response.data;
};

export const readAllNotifications = async () => {
  const response = await apiClient.put(`/notification/notifications/read-all`, null, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token"),
    },
  });
  return response.data;
};