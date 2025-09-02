// components/Manufacturing/api/manufacturing.js
import axios from 'axios';

export const bomAPI = {
  getAll: () => axios.get('/api/manufacturing/bom'),
  create: (data) => axios.post('/api/manufacturing/bom', data),
  update: (id, data) => axios.put(`/api/manufacturing/bom/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/bom/${id}`),
};

export const productionAPI = {
  getAll: () => axios.get('/api/manufacturing/production'),
  create: (data) => axios.post('/api/manufacturing/production', data),
  update: (id, data) => axios.put(`/api/manufacturing/production/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/production/${id}`),
};

export const recipeAPI = {
  getAll: () => axios.get('/api/manufacturing/recipe'),
  create: (data) => axios.post('/api/manufacturing/recipe', data),
  update: (id, data) => axios.put(`/api/manufacturing/recipe/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/recipe/${id}`),
};

export const machineInstructionAPI = {
  getAll: () => axios.get('/api/manufacturing/machine-instruction'),
  create: (data) => axios.post('/api/manufacturing/machine-instruction', data),
  update: (id, data) => axios.put(`/api/manufacturing/machine-instruction/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/machine-instruction/${id}`),
};