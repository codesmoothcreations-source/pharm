import { apiClient } from "./apiClient";

export const authApi = {
  login: (email, password) => apiClient.post("/auth/login", { email, password }),
  register: (data) => apiClient.post("/auth/register", data),
  getProfile: (token) => apiClient.get("/auth/me", token),
};

// Legacy exports for backward compatibility
export const loginUser = async (email, password) => {
  return authApi.login(email, password);
};

export const registerUser = async (data) => {
  return authApi.register(data);
};

export const getProfile = async (token) => {
  return authApi.getProfile(token);
};