// services/api.js
import axios from "axios";

// Base API URL

// Create an axios instance
const api = axios.create({
  baseURL: "/api/manufacturing",
  headers: {
    "Content-Type": "application/json",
  },
});

// Generic API handler with error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await api({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);

    // Extract error message safely
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";

    throw new Error(message);
  }
};

// BOM API endpoints
export const bomAPI = {
  getAll: () => apiRequest("/bom"),

  getById: (id) => apiRequest(`/bom?id=${id}`),

  create: (bomData) =>
    apiRequest("/bom", {
      method: "POST",
      data: bomData,
    }),

  update: (id, bomData) =>
    apiRequest(`/bom?id=${id}`, {
      method: "PUT",
      data: bomData,
    }),

  delete: (id) =>
    apiRequest(`/bom?id=${id}`, {
      method: "DELETE",
    }),

  getByFinishedId: (finishedId) => apiRequest(`/bom/finished/${finishedId}`),
};

// Production Plans API endpoints
export const productionAPI = {
  getAll: () => apiRequest("/production"),

  getById: (id) => apiRequest(`/production?id=${id}`),

  create: (planData) =>
    apiRequest("/production", {
      method: "POST",
      data: planData,
    }),

  update: (id, planData) =>
    apiRequest(`/production?id=${id}`, {
      method: "PUT",
      data: planData,
    }),

  delete: (id) =>
    apiRequest(`/production?id=${id}`, {
      method: "DELETE",
    }),

  getByStatus: (status) => apiRequest(`/production/status/${status}`),
};

// Materials API endpoints
export const materialsAPI = {
  getAll: () => apiRequest("/materials"),

  create: (materialData) =>
    apiRequest("/materials", {
      method: "POST",
      data: materialData,
    }),

  update: (id, materialData) =>
    apiRequest(`/materials/${id}`, {
      method: "PUT",
      data: materialData,
    }),

  delete: (id) =>
    apiRequest(`/materials/${id}`, {
      method: "DELETE",
    }),
};
