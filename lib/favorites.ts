const STORAGE_KEY = 'vivi-favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const current = getFavorites();
  const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage no disponible (modo privado, etc.) — el corazón no persiste, no rompe la página.
  }
  return next.includes(id);
}
