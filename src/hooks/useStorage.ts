import { useEffect, useState } from 'react';
import { storageService } from '../services/StorageService';

export function useStorage() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    storageService.init().then(() => {
      setIsInitialized(true);
    });
  }, []);

  return { isInitialized };
}
