const DEFAULT_API = "https://api.ritikyadav.us";

export const apiUrl = (
  typeof window !== "undefined" && window.__API_URL__
) || import.meta.env.VITE_API_URL || DEFAULT_API;
