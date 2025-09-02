import axios from "axios";

export const submitVoucher = async (type, data) => {
  return axios.post(`/api/voucher?type=${type}`, data);
};

const api = axios.create({
  baseURL: "/api",
});

export const fetchItems = async (params = {}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortField) queryParams.append("sortField", params.sortField);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `/forms/items?${queryString}` : "/forms/items";

  const response = await api.get(url);
  return response.data;
};

export const fetchItem = async (id) => {
  const response = await api.get(`/forms/items/${id}`);
  return response.data;
};

export const createItem = async (data) => {
  const response = await api.post("/forms/items", data);
  return response.data;
};

export const updateItem = async (id, data) => {
  const response = await api.put(`/forms/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id) => {
  await api.delete(`/forms/items/${id}`);
};

export const fetchSubtrates = async () => {
  const response = await api.get("/setup/subtrates");
  return response.data.data;
};

export const fetchCategories = async () => {
  const response = await api.get("/setup/item_categories");
  return response.data.data;
};
