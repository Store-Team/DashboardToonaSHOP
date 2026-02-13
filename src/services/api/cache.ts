/**
 * Système de cache simple pour les requêtes API
 * Évite les appels répétés et améliore les performances
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes par défaut

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Vérifier si le cache est expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 [Cache] HIT pour ${key}`);
    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (ttl || this.defaultTTL)
    };

    this.cache.set(key, entry);
    console.log(`💾 [Cache] SET pour ${key} (expire dans ${(ttl || this.defaultTTL) / 1000}s)`);
  }

  /**
   * Invalide une clé spécifique
   */
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.log(`🗑️  [Cache] INVALIDATE ${key}`);
    }
  }

  /**
   * Invalide toutes les clés correspondant à un pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`🗑️  [Cache] INVALIDATE ${key}`);
    });

    if (keysToDelete.length > 0) {
      console.log(`🗑️  [Cache] ${keysToDelete.length} entrées invalidées pour pattern "${pattern}"`);
    }
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️  [Cache] CLEAR - ${size} entrées supprimées`);
  }

  /**
   * Obtient des statistiques sur le cache
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        expiresIn: entry.expiresAt - Date.now()
      }))
    };
  }
}

// Instance singleton
export const apiCache = new APICache();

/**
 * Wrapper pour une fonction async avec cache
 */
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Essayer de récupérer depuis le cache
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  // Sinon, exécuter la fonction et mettre en cache
  return fn().then(data => {
    apiCache.set(key, data, ttl);
    return data;
  });
}
