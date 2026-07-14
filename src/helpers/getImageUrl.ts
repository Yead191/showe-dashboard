export function getImageUrl(path?: string | null): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}/files${normalizedPath}`;
}

/** @deprecated Use getImageUrl instead */
export const imageUrl = getImageUrl;
