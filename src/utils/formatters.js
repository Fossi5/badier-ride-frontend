// src/utils/formatters.js

/**
 * Formatte une date en format français ou personnalisé
 * @param {string|Date} date - La date à formater
 * @param {string} format - Format souhaité (court, long, complet ou personnalisé)
 * @returns {string} La date formatée
 */
export const formatDate = (date, format = 'court') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    
    const options = {
      'court': { day: '2-digit', month: '2-digit', year: 'numeric' },
      'long': { day: '2-digit', month: 'long', year: 'numeric' },
      'complet': { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
      'heure': { hour: '2-digit', minute: '2-digit' },
      'datetime': { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    const selectedFormat = options[format] || options.court;
    
    return dateObj.toLocaleDateString('fr-FR', selectedFormat);
  };
  
  /**
   * Formatte une heure au format HH:MM
   * @param {string|Date} time - L'heure à formater
   * @returns {string} L'heure formatée
   */
  export const formatTime = (time) => {
    if (!time) return '';
    
    const timeObj = typeof time === 'string' ? new Date(time) : time;
    
    if (isNaN(timeObj.getTime())) {
      return 'Heure invalide';
    }
    
    return timeObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };
  
  /**
   * Formatte un nombre en devise
   * @param {number} amount - Le montant à formater
   * @param {string} currency - Le code de la devise (EUR, USD, etc.)
   * @returns {string} Le montant formaté
   */
  export const formatCurrency = (amount, currency = 'EUR') => {
    if (amount === null || amount === undefined) return '';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  /**
   * Formatte un nombre avec séparateur de milliers
   * @param {number} number - Le nombre à formater
   * @param {number} decimals - Nombre de décimales à afficher
   * @returns {string} Le nombre formaté
   */
  export const formatNumber = (number, decimals = 2) => {
    if (number === null || number === undefined) return '';
    
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  };
  
  /**
   * Formatte une distance en km ou m
   * @param {number} distance - La distance en mètres
   * @returns {string} La distance formatée
   */
  export const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return '';
    
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(2)} km`;
    }
  };
  
  /**
   * Formatte une durée en heures et minutes
   * @param {number} duration - La durée en secondes
   * @returns {string} La durée formatée
   */
  export const formatDuration = (duration) => {
    if (duration === null || duration === undefined) return '';
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    } else {
      return `${hours} h ${minutes > 0 ? minutes + ' min' : ''}`;
    }
  };
  
  /**
   * Formatte une adresse complète
   * @param {object} address - L'objet adresse
   * @returns {string} L'adresse formatée
   */
  export const formatAddress = (address) => {
    if (!address) return '';
    
    const { street, city, postalCode, country } = address;
    const components = [];
    
    if (street) components.push(street);
    if (postalCode && city) components.push(`${postalCode} ${city}`);
    else if (city) components.push(city);
    if (country) components.push(country);
    
    return components.join(', ');
  };
  
  /**
   * Formatte un nom d'utilisateur en initiales
   * @param {string} name - Le nom complet
   * @returns {string} Les initiales
   */
  export const formatInitials = (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };
  
  /**
   * Tronque un texte à une certaine longueur
   * @param {string} text - Le texte à tronquer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} Le texte tronqué
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return `${text.substring(0, maxLength)}...`;
  };
  
  /**
   * Formatte les statuts en textes lisibles
   * @param {string} status - Le statut à formatter
   * @returns {string} Le statut formatté
   */
  export const formatStatus = (status) => {
    if (!status) return '';
    
    const statusMap = {
      // Statuts de livraison
      'PENDING': 'En attente',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'FAILED': 'Échec',
      
      // Statuts de route
      'PLANNED': 'Planifiée',
      'CANCELLED': 'Annulée',
      
      // Statuts d'alerte
      'NEW': 'Nouvelle',
      'RESOLVED': 'Résolue',
      'CLOSED': 'Fermée',
      
      // Statuts par défaut
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'DELETED': 'Supprimé'
    };
    
    return statusMap[status] || status;
  };
  
  /**
   * Obtient la couleur associée à un statut
   * @param {string} status - Le statut
   * @returns {string} Code couleur
   */
  export const getStatusColor = (status) => {
    if (!status) return 'default';
    
    const statusColorMap = {
      // Statuts de livraison
      'PENDING': 'default',
      'IN_PROGRESS': 'warning',
      'COMPLETED': 'success',
      'FAILED': 'error',
      
      // Statuts de route
      'PLANNED': 'info',
      'CANCELLED': 'error',
      
      // Statuts d'alerte
      'NEW': 'warning',
      'RESOLVED': 'success',
      'CLOSED': 'default',
      
      // Statuts par défaut
      'ACTIVE': 'success',
      'INACTIVE': 'default',
      'DELETED': 'error'
    };
    
    return statusColorMap[status] || 'default';
  };
  
  /**
   * Formatte un numéro de téléphone au format français
   * @param {string} phone - Le numéro de téléphone
   * @returns {string} Le numéro formaté
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Supprime tous les caractères non numériques
    const digits = phone.replace(/\D/g, '');
    
    // Si le numéro commence par 0 et contient 10 chiffres (format français)
    if (digits.length === 10 && digits.startsWith('0')) {
      return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    // Sinon, on retourne le numéro tel quel par groupes de 2
    return digits.replace(/(\d{2})/g, '$1 ').trim();
  };