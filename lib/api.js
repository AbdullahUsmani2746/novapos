import axios from 'axios';

export const submitVoucher = async (type, data) => {
  return axios.post(`/api/voucher?type=${type}`, data); 
};

const api = axios.create({
  baseURL: '/api',
});

export const fetchItems = async () => {
  const response = await api.get('/forms/items');
  return response.data;
};

export const fetchItem = async (id) => {
  const response = await api.get(`/forms/items/${id}`);
  return response.data;
};

export const createItem = async (data) => {
  const response = await api.post('/forms/items', data);
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
  const response = await api.get('/setup/subtrates');
  return response.data.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/setup/item_categories');
  return response.data.data;
};

