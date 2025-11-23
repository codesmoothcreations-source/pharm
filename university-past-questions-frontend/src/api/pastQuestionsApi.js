import { apiClient } from "./apiClient";

export const pastQuestionsApi = {
  getAll: () => apiClient.get("/past-questions"),
  getSingle: (id) => apiClient.get(`/past-questions/${id}`),
  create: (data, token) => apiClient.post("/past-questions", data, token),
  update: (id, data, token) => apiClient.put(`/past-questions/${id}`, data, token),
  delete: (id, token) => apiClient.del(`/past-questions/${id}`, token),
};

// Legacy exports for backward compatibility
export const getAllQuestions = async () => {
  return pastQuestionsApi.getAll();
};

export const getQuestionById = async (id) => {
  return pastQuestionsApi.getSingle(id);
};

export const uploadQuestion = async (formData, token) => {
  return pastQuestionsApi.create(formData, token);
};

export const updateQuestion = async (id, formData, token) => {
  // Check if data is FormData or regular object
  const isFormData = formData instanceof FormData;
  
  // If it's FormData, use the regular update endpoint with file
  if (isFormData) {
    return pastQuestionsApi.update(id, formData, token);
  }
  
  // For metadata-only updates, use the metadata endpoint
  return apiClient.put(`/past-questions/${id}/metadata`, formData, token);
};

export const deleteQuestion = async (id, token) => {
  return pastQuestionsApi.delete(id, token);
};