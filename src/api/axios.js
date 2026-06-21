// src/api/axios.js
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  // Envoie automatiquement les cookies (dont le cookie httpOnly "jwt") avec chaque requête
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests = [];

const flushPending = (error) => {
  pendingRequests.forEach((cb) => cb(error));
  pendingRequests = [];
};

// Intercepteur pour gérer les erreurs d'authentification et réseau
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      if (error.response.status === 401) {
        const isAuthEndpoint = originalRequest.url.includes("/auth/");

        // Sur les endpoints /auth/ (login, register…), on laisse le composant gérer l'erreur
        if (isAuthEndpoint) {
          return Promise.reject(error);
        }

        // Éviter les boucles infinies sur la requête de refresh elle-même
        if (originalRequest._retry) {
          localStorage.removeItem("userInfo");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Mettre la requête en attente pendant que le refresh est en cours
          return new Promise((_, reject) => {
            pendingRequests.push((err) => reject(err));
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Tenter de rafraîchir le token via le cookie httpOnly
          await api.post("/auth/refresh", {});
          isRefreshing = false;
          flushPending(null);
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          flushPending(refreshError);
          localStorage.removeItem("userInfo");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue (problème réseau)
      error.customMessage =
        "Impossible de communiquer avec le serveur. Vérifiez votre connexion internet et que le serveur backend est bien démarré.";
    }

    return Promise.reject(error);
  },
);

export default api;
