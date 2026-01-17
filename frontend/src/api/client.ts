import axios, { AxiosError, AxiosInstance } from "axios";

/**
 * Laravel Sanctum SPA client.
 *
 * Backend expectations:
 * - APP_URL (default): http://localhost:8000
 * - Sanctum CSRF cookie: GET /sanctum/csrf-cookie
 * - Login: POST /login
 * - Logout: POST /logout
 * - Current user: GET /api/me (auth:sanctum)
 */

export const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:8000";

export const http: AxiosInstance = axios.create({
  baseURL: APP_URL,
  timeout: 15000,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    // For API calls, a 401 should just be handled by the app.
    // We avoid hard redirects here; the AuthContext will handle state.
    return Promise.reject(err);
  }
);

export async function ensureCsrfCookie(): Promise<void> {
  // Sanctum sets XSRF-TOKEN cookie here.
  await http.get("/sanctum/csrf-cookie");
}
