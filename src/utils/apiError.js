export const getApiError = (err, fallback = 'Une erreur est survenue') =>
  err?.response?.data?.error || err?.response?.data?.message || fallback;
