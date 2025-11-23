const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const apiClient = {
  async get(url, token) {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },

  async post(url, body, token) {
    const isFormData = body instanceof FormData;
    
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: isFormData ? {
        ...(token && { Authorization: `Bearer ${token}` }),
      } : {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      const err = new Error(error.message || `HTTP error! status: ${res.status}`);
      err.response = { data: error };
      throw err;
    }
    return res.json();
  },

  async put(url, body, token) {
    const isFormData = body instanceof FormData;
    
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: isFormData ? {
        ...(token && { Authorization: `Bearer ${token}` }),
      } : {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      const err = new Error(error.message || `HTTP error! status: ${res.status}`);
      err.response = { data: error };
      throw err;
    }
    return res.json();
  },

  async del(url, token) {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
};