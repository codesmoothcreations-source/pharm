import { apiClient } from "./apiClient";

export const causesApi = {
  getAll: () => apiClient.get("/causes"),
  getCategories: () => apiClient.get("/causes/categories"),
  getByCategory: (category) => apiClient.get(`/causes/category/${category}`),
  getSingle: (id) => apiClient.get(`/causes/${id}`),
  create: (data, token) => apiClient.post("/causes", data, token),
  update: (id, data, token) => apiClient.put(`/causes/${id}`, data, token),
  delete: (id, token) => apiClient.del(`/causes/${id}`, token),
};

// Legacy exports for backward compatibility
export const getAllCauses = async () => {
  return causesApi.getAll();
};

export const getCauseCategories = async () => {
  return causesApi.getCategories();
};

export const getCausesByCategory = async (category) => {
  return causesApi.getByCategory(category);
};

export const getCauseById = async (id) => {
  return causesApi.getSingle(id);
};

export const createCause = async (formData, token) => {
  return causesApi.create(formData, token);
};

export const updateCause = async (id, formData, token) => {
  return causesApi.update(id, formData, token);
};

export const deleteCause = async (id, token) => {
  return causesApi.delete(id, token);
};