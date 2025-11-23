import { apiClient } from "./apiClient";

export const coursesApi = {
  getAll: () => apiClient.get("/courses"),
  getSingle: (id) => apiClient.get(`/courses/${id}`),
  create: (data, token) => apiClient.post("/courses", data, token),
  update: (id, data, token) => apiClient.put(`/courses/${id}`, data, token),
  delete: (id, token) => apiClient.del(`/courses/${id}`, token),
};

// Legacy exports for backward compatibility
export const getAllCourses = async () => {
  return coursesApi.getAll();
};

export const getCourseById = async (id) => {
  return coursesApi.getSingle(id);
};

export const createCourse = async (formData, token) => {
  return coursesApi.create(formData, token);
};

export const updateCourse = async (id, formData, token) => {
  return coursesApi.update(id, formData, token);
};

export const deleteCourse = async (id, token) => {
  return coursesApi.delete(id, token);
};
