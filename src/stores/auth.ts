import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/services/api";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN"; //| 'CASHIER'
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  const isAuthenticated = computed(() => !!token.value);

  //todo this in the future nalang
  //const isAdmin = computed(() => user.value?.role === 'ADMIN')

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem("token", response.token);
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: "ADMIN",
  ) => {
    try {
      const response = await authApi.register(email, password, fullName, role);
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem("token", response.token);
      return { success: true };
    } catch (error: any) {
      console.error("Register error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  };

  const initializeAuth = async () => {
    if (token.value) {
      try {
        const response = await authApi.getProfile();
        user.value = response;
        console.log("Auth initialized for user:", response);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        logout();
      }
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    //isAdmin,
    login,
    register,
    logout,
    initializeAuth,
  };
});

