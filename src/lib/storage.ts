import type { StateStorage } from 'zustand/middleware';

/**
 * Custom IndexedDB storage for Zustand to handle large datasets (like Base64 videos)
 * that exceed the ~5MB limit of localStorage.
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('showe-storage', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('keyval')) {
          db.createObjectStore('keyval');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('keyval', 'readonly');
        const store = transaction.objectStore('keyval');
        const getRequest = store.get(name);
        
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => resolve(null);
      };

      request.onerror = () => resolve(null);
    });
  },

  setItem: async (name: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('showe-storage', 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('keyval')) {
          db.createObjectStore('keyval');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('keyval', 'readwrite');
        const store = transaction.objectStore('keyval');
        
        try {
          store.put(value, name);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        } catch (e) {
          reject(e);
        }
      };

      request.onerror = () => reject(request.error);
    });
  },

  removeItem: async (name: string): Promise<void> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('showe-storage', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('keyval', 'readwrite');
        const store = transaction.objectStore('keyval');
        store.delete(name);
        transaction.oncomplete = () => resolve();
      };

      request.onerror = () => resolve();
    });
  },
};
