// src/api/axios.js
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Ajouter un timeout de 10 secondes
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("Requête envoyée:", config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("Erreur lors de la préparation de la requête:", error);
    return Promise.reject(error);
  },
);

// Intercepteur pour gérer les erreurs d'authentification et réseau
/*api.interceptors.response.use(
  response => {
    console.log('Réponse reçue:', response.status, response.config.url);
    return response;
  },
  error => {
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code de statut hors de la plage 2xx
      console.error('Erreur de réponse:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Erreur réseau - Aucune réponse reçue:', error.request);
      error.customMessage = "Impossible de communiquer avec le serveur. Vérifiez votre connexion internet et que le serveur backend est bien démarré.";
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);*/
api.interceptors.response.use(
  (response) => {
    console.log("Réponse reçue:", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("Erreur détaillée:", {
        status: error.response.status,
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.response.data,
        timestamp: new Date().toISOString(),
      });

      // Ne déconnecter que si c'est vraiment une erreur d'authentification
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
          console.warn(
            "⚠️ Détection token expiré ou invalide - Redirection vers login",
          );
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          window.location.href = "/login";
        } else {
          // Si c'est une autre erreur 401 (permissions, etc.), ne pas déconnecter
          console.warn("⚠️ Erreur 401 mais pas liée au token:", errorMessage);
        }
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("Erreur réseau - Aucune réponse reçue:", error.request);
      error.customMessage =
        "Impossible de communiquer avec le serveur. Vérifiez votre connexion internet et que le serveur backend est bien démarré.";
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error("Erreur de configuration de la requête:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
