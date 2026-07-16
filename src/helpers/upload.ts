const API_PREFIX = '/api/v1';

function getApiBaseUrl(): string {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  return `${baseUrl}${API_PREFIX}`;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers['authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return headers;
}

/**
 * Uploads an image file to the `/programmes/upload-images` API.
 * Returns the relative path to the uploaded image.
 */
export async function uploadImage(file: File): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${baseUrl}/programmes/upload-images`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.message || 'Image upload failed');
}

/**
 * Uploads a video/audio file in sequential chunks to the `/upload/chunk` API.
 * Slices the file into chunks and sends them one-by-one.
 * Returns the relative path to the completed file.
 */
export async function uploadVideoChunks(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const chunkSize = 2 * 1024 * 1024; // 2MB chunk size
  const totalChunks = Math.ceil(file.size / chunkSize);
  // Ensure a unique filename using timestamp to avoid naming collisions
  const originalname = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunkBlob = file.slice(start, end);

    const formData = new FormData();
    // Send under both 'file' and 'chunk' keys to match multer expectations
    // formData.append('file', chunkBlob, originalname);
    formData.append('chunk', chunkBlob, originalname);

    formData.append('originalname', originalname);
    formData.append('chunkIndex', String(chunkIndex));
    formData.append('totalChunks', String(totalChunks));

    const response = await fetch(`${baseUrl}/upload/chunk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed at chunk ${chunkIndex + 1} of ${totalChunks}`);
    }

    if (onProgress) {
      const progressPercent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      onProgress(progressPercent);
    }

    // On final chunk, return the relative path (e.g. "/video/name.mp4")
    if (chunkIndex + 1 === totalChunks) {
      const result = await response.json();
      if (typeof result === 'string') {
        return result;
      }
      if (result && typeof result === 'object' && result.data) {
        return result.data;
      }
      return `/video/${originalname}`;
    }
  }

  throw new Error('Chunked upload did not return a valid file path');
}
