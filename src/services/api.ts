import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const BASE_URL = "https://upmeworks-exam-backend-production.up.railway.app";
const api = axios.create({
  baseURL: BASE_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
    console.log(
      "API request with token:",
      config.method?.toUpperCase(),
      config.url,
    );
  } else {
    console.warn(
      "API request without token:",
      config.method?.toUpperCase(),
      config.url,
    );
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log("API response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "API error:",
      error.response?.status,
      error.response?.data,
      error.config?.url,
    );
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((res) => res.data),

  register: (email: string, password: string, fullName: string, role: string) =>
    api
      .post("/auth/register", { email, password, fullName, role })
      .then((res) => res.data),

  getProfile: () => api.get("/auth/profile").then((res) => res.data),
};

export const productsApi = {
  getAll: () => api.get("/products").then((res) => res.data),

  create: (product: any) =>
    api.post("/products", product).then((res) => res.data),

  update: (id: string, product: any) =>
    api.put(`/products/${id}`, product).then((res) => res.data),

  delete: (id: string) => api.delete(`/products/${id}`).then((res) => res.data),
};

export const salesApi = {
  getAll: () => api.get("/sales").then((res) => res.data),

  create: (sale: any) => api.post("/sales", sale).then((res) => res.data),

  getById: (id: string) => api.get(`/sales/${id}`).then((res) => res.data),
};

export const reportsApi = {
  getDailyReport: (date: string) =>
    api.get(`/reports/daily?date=${date}`).then((res) => res.data),

  getMonthlyReport: (year: number, month: number) =>
    api
      .get(`/reports/monthly?year=${year}&month=${month}`)
      .then((res) => res.data),

  getProductReport: () => api.get("/reports/products").then((res) => res.data),

  getDashboardStats: () =>
    api.get("/reports/dashboard").then((res) => res.data),
};

export default api;

