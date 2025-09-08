// components/Manufacturing/api.js
import axios from 'axios';

export const bomAPI = {
  getAll: (params) => axios.get('/api/manufacturing/bom', { params }),
  create: (data) => axios.post('/api/manufacturing/bom', data),
  update: (id, data) => axios.put(`/api/manufacturing/bom/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/bom/${id}`),
};

export const productionAPI = {
  getAll: (params) => axios.get('/api/manufacturing/production', { params }),
  create: (data) => axios.post('/api/manufacturing/production', data),
  update: (id, data) => axios.put(`/api/manufacturing/production/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/production/${id}`),
};

export const recipeAPI = {
  getAll: (params) => axios.get('/api/manufacturing/recipe', { params }),
  create: (data) => axios.post('/api/manufacturing/recipe', data),
  update: (id, data) => axios.put(`/api/manufacturing/recipe/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/recipe/${id}`),
};

export const machineInstructionAPI = {
  getAll: (params) => axios.get('/api/manufacturing/machine-instruction', { params }),
  create: (data) => axios.post('/api/manufacturing/machine-instruction', data),
  update: (id, data) => axios.put(`/api/manufacturing/machine-instruction/${id}`, data),
  delete: (id) => axios.delete(`/api/manufacturing/machine-instruction/${id}`),
};