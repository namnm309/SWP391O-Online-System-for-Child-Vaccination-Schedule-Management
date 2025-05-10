import apiClient from "./api";

export interface Order {
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  paymentType: string;
  childId: number;
}

export const getUrlPayment = async (url: string, data: Order) => {
  const response = await apiClient.post(
    `/order/create-by-product?${url}`,
    data
  );
  const urlpayment = await apiClient.post(
    `/payment/multiple/create-payment?productIds=${response?.data?.result?.id}`,
    data
  );

  return urlpayment.data;
};
export const getOrders = async () => {
  const response = await apiClient.get(`/order/user-orders`);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await apiClient.get(`/order/order/${id}`);
  return response.data;
};
export const postReaction = async (
  id: string,
  data: {
    symptoms: string;
  }
) => {
  const response = await apiClient.post(`/reaction/add/${id}`, data);
  return response.data;
};

export const updateVaccineStatus = async (id: string, status: string) => {
  const token = localStorage.getItem("token");
  const response = await apiClient.put(`/order/${id}/status`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      orderDetailId: id,
      status: status,
    },
  });
  return response.data;
};