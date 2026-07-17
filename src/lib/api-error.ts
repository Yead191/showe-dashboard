import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

type ApiErrorBody = {
  message?: string;
  error?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function messageFromData(data: unknown): string | undefined {
  if (typeof data === 'string' && data.trim()) return data;
  if (!isRecord(data)) return undefined;

  const body = data as ApiErrorBody;
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (typeof body.error === 'string' && body.error.trim()) return body.error;
  return undefined;
}

/** Normalize RTK Query / unknown errors into a user-facing message. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!error) return fallback;

  if (typeof error === 'string' && error.trim()) return error;

  if (isRecord(error)) {
    if ('status' in error) {
      const fetchError = error as FetchBaseQueryError;
      const fromData = messageFromData(fetchError.data);
      if (fromData) return fromData;

      if (fetchError.status === 'FETCH_ERROR') {
        return 'Network error. Check your connection and try again.';
      }
      if (fetchError.status === 'TIMEOUT_ERROR') {
        return 'Request timed out. Please try again.';
      }
      if (fetchError.status === 'PARSING_ERROR') {
        return 'Received an unexpected response from the server.';
      }
    }

    if ('message' in error) {
      const serialized = error as SerializedError;
      if (typeof serialized.message === 'string' && serialized.message.trim()) {
        return serialized.message;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
