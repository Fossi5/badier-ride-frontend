// src/utils/validators.js

/**
 * Validateur d'email
 * @param {string} email - Email à valider
 * @returns {boolean} Indique si l'email est valide
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    
    // Regex pour vérifier un email valide
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validateur de numéro de téléphone français
   * @param {string} phone - Numéro à valider
   * @returns {boolean} Indique si le numéro est valide
   */
  export const isValidPhone = (phone) => {
    if (!phone) return false;
    
    // Supprime tous les caractères non numériques
    const digits = phone.replace(/\D/g, '');
    
    // Vérifie si le numéro commence par 0 et contient 10 chiffres (format français)
    return digits.length === 10 && digits.startsWith('0');
  };
  
  /**
   * Validateur de code postal français
   * @param {string} postalCode - Code postal à valider
   * @returns {boolean} Indique si le code postal est valide
   */
  export const isValidPostalCode = (postalCode) => {
    if (!postalCode) return false;
    
    // Regex pour un code postal français (5 chiffres)
    const postalCodeRegex = /^[0-9]{5}$/;
    return postalCodeRegex.test(postalCode);
  };
  
  /**
   * Validateur d'URL
   * @param {string} url - URL à valider
   * @returns {boolean} Indique si l'URL est valide
   */
  export const isValidUrl = (url) => {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Validateur de coordonnées GPS (latitude)
   * @param {number} latitude - Latitude à valider
   * @returns {boolean} Indique si la latitude est valide
   */
  export const isValidLatitude = (latitude) => {
    if (latitude === null || latitude === undefined) return false;
    
    const lat = parseFloat(latitude);
    return !isNaN(lat) && lat >= -90 && lat <= 90;
  };
  
  /**
   * Validateur de coordonnées GPS (longitude)
   * @param {number} longitude - Longitude à valider
   * @returns {boolean} Indique si la longitude est valide
   */
  export const isValidLongitude = (longitude) => {
    if (longitude === null || longitude === undefined) return false;
    
    const lng = parseFloat(longitude);
    return !isNaN(lng) && lng >= -180 && lng <= 180;
  };
  
  /**
   * Validateur de champ obligatoire
   * @param {any} value - Valeur à vérifier
   * @returns {boolean} Indique si la valeur est présente
   */
  export const isRequired = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  };
  
  /**
   * Validateur de longueur minimale
   * @param {string} value - Valeur à vérifier
   * @param {number} minLength - Longueur minimale requise
   * @returns {boolean} Indique si la valeur respecte la longueur minimale
   */
  export const minLength = (value, minLength) => {
    if (!value) return false;
    return value.length >= minLength;
  };
  
  /**
   * Validateur de longueur maximale
   * @param {string} value - Valeur à vérifier
   * @param {number} maxLength - Longueur maximale autorisée
   * @returns {boolean} Indique si la valeur respecte la longueur maximale
   */
  export const maxLength = (value, maxLength) => {
    if (!value) return true; // Si vide, pas de violation de longueur max
    return value.length <= maxLength;
  };
  
  /**
   * Validateur de force de mot de passe
   * @param {string} password - Mot de passe à valider
   * @returns {object} Résultat de validation avec niveau de force
   */
  export const validatePassword = (password) => {
    if (!password) {
      return {
        isValid: false,
        strength: 0,
        message: 'Mot de passe obligatoire'
      };
    }
    
    let strength = 0;
    const messages = [];
    
    // Vérifier la longueur
    if (password.length < 8) {
      messages.push('Au moins 8 caractères');
    } else {
      strength += 1;
    }
    
    // Vérifier les lettres minuscules
    if (!/[a-z]/.test(password)) {
      messages.push('Au moins une lettre minuscule');
    } else {
      strength += 1;
    }
    
    // Vérifier les lettres majuscules
    if (!/[A-Z]/.test(password)) {
      messages.push('Au moins une lettre majuscule');
    } else {
      strength += 1;
    }
    
    // Vérifier les chiffres
    if (!/[0-9]/.test(password)) {
      messages.push('Au moins un chiffre');
    } else {
      strength += 1;
    }
    
    // Vérifier les caractères spéciaux
    if (!/[^A-Za-z0-9]/.test(password)) {
      messages.push('Au moins un caractère spécial');
    } else {
      strength += 1;
    }
    
    // Déterminer si le mot de passe est valide (score minimum 3)
    const isValid = strength >= 3;
    
    return {
      isValid,
      strength,
      messages,
      message: messages.join(', ')
    };
  };
  
  /**
   * Valide un objet adresse
   * @param {object} address - Adresse à valider
   * @returns {object} Erreurs de validation
   */
  export const validateAddress = (address) => {
    const errors = {};
    
    if (!address) {
      return { _error: 'Adresse manquante' };
    }
    
    if (!isRequired(address.street)) {
      errors.street = 'La rue est obligatoire';
    }
    
    if (!isRequired(address.city)) {
      errors.city = 'La ville est obligatoire';
    }
    
    if (!isRequired(address.postalCode)) {
      errors.postalCode = 'Le code postal est obligatoire';
    } else if (!isValidPostalCode(address.postalCode)) {
      errors.postalCode = 'Format de code postal invalide';
    }
    
    if (address.latitude !== undefined && !isValidLatitude(address.latitude)) {
      errors.latitude = 'Latitude invalide';
    }
    
    if (address.longitude !== undefined && !isValidLongitude(address.longitude)) {
      errors.longitude = 'Longitude invalide';
    }
    
    return errors;
  };
  
  /**
   * Valide un objet point de livraison
   * @param {object} deliveryPoint - Point de livraison à valider
   * @returns {object} Erreurs de validation
   */
  export const validateDeliveryPoint = (deliveryPoint) => {
    const errors = {};
    
    if (!deliveryPoint) {
      return { _error: 'Données manquantes' };
    }
    
    if (!isRequired(deliveryPoint.addressId) && !deliveryPoint.address) {
      errors.addressId = 'L\'adresse est obligatoire';
    }
    
    if (!isRequired(deliveryPoint.clientName)) {
      errors.clientName = 'Le nom du client est obligatoire';
    }
    
    if (deliveryPoint.clientPhoneNumber && !isValidPhone(deliveryPoint.clientPhoneNumber)) {
      errors.clientPhoneNumber = 'Format de téléphone invalide';
    }
    
    if (deliveryPoint.clientEmail && !isValidEmail(deliveryPoint.clientEmail)) {
      errors.clientEmail = 'Format d\'email invalide';
    }
    
    return errors;
  };