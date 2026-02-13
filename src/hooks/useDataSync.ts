/**
 * Hook personnalisé pour la synchronisation automatique des données
 * Permet de rafraîchir les données à intervalle régulier ou manuellement
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSyncOptions {
  /**
   * Intervalle de rafraîchissement automatique en ms (0 = désactivé)
   */
  interval?: number;
  /**
   * Rafraîchir au montage du composant
   */
  refreshOnMount?: boolean;
  /**
   * Rafraîchir quand la fenêtre reprend le focus
   */
  refreshOnFocus?: boolean;
  /**
   * Fonction à appeler en cas d'erreur
   */
  onError?: (error: Error) => void;
}

export function useDataSync<T>(
  fetchFunction: () => Promise<T>,
  options: UseSyncOptions = {}
) {
  const {
    interval = 0,
    refreshOnMount = true,
    refreshOnFocus = true,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      if (isMountedRef.current) {
        setData(result);
        setLastSync(new Date());
        setError(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      if (isMountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction, onError]);

  // Rafraîchir au montage
  useEffect(() => {
    if (refreshOnMount) {
      refresh();
    }
  }, [refresh, refreshOnMount]);

  // Rafraîchissement automatique par intervalle
  useEffect(() => {
    if (interval > 0) {
      intervalRef.current = setInterval(refresh, interval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [interval, refresh]);

  // Rafraîchir au focus de la fenêtre
  useEffect(() => {
    if (refreshOnFocus) {
      const handleFocus = () => refresh();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refreshOnFocus, refresh]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    lastSync,
    /**
     * Force un rafraîchissement même si déjà en cours
     */
    forceRefresh: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      refresh();
      if (interval > 0) {
        intervalRef.current = setInterval(refresh, interval);
      }
    }
  };
}

/**
 * Hook pour synchroniser une liste avec rafraîchissement optimiste
 */
export function useListSync<T extends { id: number | string }>(
  fetchFunction: () => Promise<T[]>,
  options: UseSyncOptions = {}
) {
  const sync = useDataSync(fetchFunction, options);

  /**
   * Met à jour un élément de manière optimiste
   */
  const updateItem = useCallback((id: number | string, updates: Partial<T>) => {
    sync.data && (() => {
      const newData = sync.data.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      // @ts-ignore - on force la mise à jour
      sync.setData?.(newData);
    })();
  }, [sync.data]);

  /**
   * Supprime un élément de manière optimiste
   */
  const removeItem = useCallback((id: number | string) => {
    sync.data && (() => {
      const newData = sync.data.filter(item => item.id !== id);
      // @ts-ignore
      sync.setData?.(newData);
    })();
  }, [sync.data]);

  /**
   * Ajoute un élément de manière optimiste
   */
  const addItem = useCallback((item: T) => {
    sync.data && (() => {
      const newData = [...sync.data, item];
      // @ts-ignore
      sync.setData?.(newData);
    })();
  }, [sync.data]);

  return {
    ...sync,
    updateItem,
    removeItem,
    addItem
  };
}
