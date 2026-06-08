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

// Intercepteur pour gérer les erreurs d'authentification et réseau
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "";

        // Vérifier si c'est un problème de token (token expiré ou invalide)
        if (
          errorMessage.toLowerCase().includes("token") ||
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("unauthorized") ||
          error.config.url.includes("/auth/")
        ) {
          // Session expirée : nettoyage des métadonnées et redirection vers login
          localStorage.removeItem("userInfo");
          window.location.href = "/login";
        }
        // Sinon, erreur 401 liée aux permissions : on laisse le composant gérer l'erreur
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
