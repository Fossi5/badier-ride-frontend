/**
 * Extrait le message d'erreur lisible depuis une réponse axios.
 *
 * Priorités :
 *  1. error.response.data.errors  → tableau [{field, message}] retourné par @Valid
 *  2. error.response.data.error   → message unique (InvalidOperationException, etc.)
 *  3. error.response.data.message → variante spring boot
 *  4. error.customMessage         → message réseau défini par l'intercepteur axios
 *  5. fallback                    → message générique fourni par l'appelant
 */
export const getApiError = (err, fallback = 'Une erreur est survenue') => {
  const data = err?.response?.data;

  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map(e => e.message).join(' • ');
  }

  return data?.error || data?.message || err?.customMessage || fallback;
};
