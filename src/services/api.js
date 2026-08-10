import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "vara_token",
      );

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error?.response?.status ===
      401
    ) {
      localStorage.removeItem(
        "vara_token",
      );

      localStorage.removeItem(
        "vara_usuario",
      );

      /*
       * Opcionalmente podríamos redirigir
       * al login acá.
       *
       * Por ahora solo limpiamos sesión.
       */
    }

    return Promise.reject(error);
  },
);

export default api;