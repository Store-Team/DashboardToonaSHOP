import api from './axios';

/**
 * Utilitaire pour valider et tester les endpoints backend
 * Permet de détecter rapidement les endpoints qui fonctionnent ou non
 */

export interface EndpointStatus {
  endpoint: string;
  method: string;
  category: string;
  status: 'success' | 'error' | 'warning';
  statusCode?: number;
  message?: string;
  responseTime?: number;
}

/**
 * Liste des endpoints à valider
 */
const ENDPOINTS_TO_VALIDATE = [
  { method: 'GET', path: '/admin/stats', name: 'Statistiques globales', category: 'Admin' },
  { method: 'GET', path: '/admin/new-groups', name: 'Nouveaux groupes', category: 'Admin' },
  { method: 'GET', path: '/admin/groups/expiring-soon', name: 'Groupes expirants', category: 'Admin' },
  { method: 'GET', path: '/admin/groups', name: 'Liste des groupes', category: 'Admin' },
  { method: 'GET', path: '/admin/group/1', name: 'Détails groupe (singulier)', category: 'Admin' },
  { method: 'GET', path: '/admin/groups/1', name: 'Détails groupe (pluriel)', category: 'Admin' },
  { method: 'GET', path: '/admin/group/1/new-users', name: 'Nouveaux utilisateurs', category: 'Admin' },
  { method: 'GET', path: '/admin/group/1/payments', name: 'Paiements groupe', category: 'Admin' },
  { method: 'POST', path: '/admin/group/1/active', name: 'Activer groupe', category: 'Admin' },
  { method: 'POST', path: '/admin/group/1/disable', name: 'Désactiver groupe', category: 'Admin' },
  { method: 'GET', path: '/admin/imf/stats', name: 'Stats IMF', category: 'IMF' },
  { method: 'GET', path: '/admin/imf/pending-groups', name: 'Groupes en attente', category: 'IMF' },
  { method: 'GET', path: '/admin/imf/approved-groups', name: 'Groupes approuvés', category: 'IMF' },
  { method: 'GET', path: '/admin/stats/top-clients', name: 'Top clients', category: 'Stats' },
  { method: 'GET', path: '/admin/stats/top-products', name: 'Top produits', category: 'Stats' },
];

/**
 * Valide un endpoint spécifique
 */
export const validateEndpoint = async (
  method: string,
  path: string,
  category: string
): Promise<EndpointStatus> => {
  const startTime = performance.now();
  
  try {
    let response;
    if (method === 'GET') {
      response = await api.get(path);
    } else if (method === 'POST') {
      // Pour les POST, on ne fait pas de vraie requête pour ne pas modifier les données
      return {
        endpoint: path,
        method,
        category,
        status: 'warning',
        message: 'POST non testé automatiquement (évite les modifications)'
      };
    } else {
      throw new Error(`Méthode ${method} non supportée`);
    }
    
    const endTime = performance.now();
    
    return {
      endpoint: path,
      method,
      category,
      status: 'success',
      statusCode: response.status,
      message: 'OK',
      responseTime: Math.round(endTime - startTime)
    };
  } catch (error: any) {
    const endTime = performance.now();
    
    return {
      endpoint: path,
      method,
      category,
      status: 'error',
      statusCode: error.response?.status,
      message: error.response?.data?.error || error.message,
      responseTime: Math.round(endTime - startTime)
    };
  }
};

/**
 * Valide tous les endpoints du système
 */
export const validateAllEndpoints = async (
  onProgress?: (current: number, total: number) => void
): Promise<EndpointStatus[]> => {
  console.log('🔍 Validation des endpoints backend...');
  
  const results: EndpointStatus[] = [];
  const total = ENDPOINTS_TO_VALIDATE.length;
  
  for (let i = 0; i < ENDPOINTS_TO_VALIDATE.length; i++) {
    const endpoint = ENDPOINTS_TO_VALIDATE[i];
    console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
    const result = await validateEndpoint(endpoint.method, endpoint.path, endpoint.category);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, total);
    }
    
    // Petit délai pour ne pas surcharger le serveur
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
};

/**
 * Affiche un rapport de validation dans la console
 */
export const printValidationReport = (results: EndpointStatus[]) => {
  console.log('\n📊 RAPPORT DE VALIDATION DES ENDPOINTS\n');
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');
  const warnings = results.filter(r => r.status === 'warning');
  
  console.log(`✅ Succès: ${successful.length}`);
  console.log(`❌ Échecs: ${failed.length}`);
  console.log(`⚠️  Avertissements: ${warnings.length}`);
  console.log('\n--- DÉTAILS ---\n');
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
    console.log(`${icon} ${result.method} ${result.endpoint}`);
    if (result.statusCode) {
      console.log(`   Status: ${result.statusCode} | Temps: ${result.responseTime}ms`);
    }
    if (result.message) {
      console.log(`   Message: ${result.message}`);
    }
  });
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    warnings: warnings.length,
    results
  };
};
