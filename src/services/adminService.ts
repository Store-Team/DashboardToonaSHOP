import api from './api/axios';

/**
 * Service de gestion des endpoints d'administration
 * Gère les groupes, paiements, statistiques et opérations administratives
 */

// Types
export interface AdminStats {
  totalGroups: number;
  activeGroups: number;
  totalRevenue: number;
  totalUsers: number;
  activeSubscriptions?: number;
  trialGroups?: number;
  trends?: {
    groups?: number;
    users?: number;
    subs?: number;
    trials?: number;
  };
}

export interface Group {
  id: number;
  nomEntreprise: string;
  email: string;
  contact: string;
  nrccm: string;
  user_count: number;
  point_of_sale_count: number;
  warehouse_count: number;
  isPaid: boolean;
  subscriptionEnd: string;
  subscriptionStatus?: string;
  planName?: string;
  totalRevenue?: number;
  createdAt?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit?: number;
  totalPages?: number;
  total_pages?: number;
}

export interface NewUser {
  id: number;
  numero: string;
  nom: string;
  prenom: string;
  roles: string[];
  created_at?: string;
  createdAt?: string;
  point_of_sale?: { id: number; name: string };
  entrepot?: { id: number; name: string };
}

export interface Payment {
  id: number;
  status: string;
  transactionId: string;
  reference: string;
  statusDescription?: string;
  amount: string;
  provider: string;
  plan: string;
  months: number;
  orderCurrency?: string;
  createdAt: string;
  group?: {
    id: number;
    nomEntreprise: string;
    email: string;
  };
}

export interface ExtendSubscriptionRequest {
  days: number;
}

export interface PaymentStats {
  filters?: Record<string, any>;
  totals: {
    total: number;
    total_amount: number;
    approved_count: number;
    failed_count: number;
    timeout_count: number;
  };
  by_status: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  by_provider: Array<{
    provider: string;
    count: number;
    amount: number;
  }>;
}

/**
 * Récupérer les statistiques globales
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<any>('/admin/stats');
  
  // Transformer snake_case du backend en camelCase
  const data = response.data;
  return {
    totalGroups: data.total_groups || data.totalGroups || 0,
    activeGroups: data.active_groups || data.activeGroups || 0,
    totalRevenue: data.total_revenue || data.totalRevenue || 0,
    totalUsers: data.total_users || data.totalUsers || 0,
    activeSubscriptions: data.active_subscriptions || data.activeSubscriptions || 0,
    trialGroups: data.trial_groups || data.trialGroups || 0,
    trends: data.trends || undefined
  };
};

/**
 * Récupérer les nouveaux groupes
 */
export const getNewGroups = async (limit: number = 5): Promise<Group[]> => {
  const response = await api.get<PaginatedResponse<Group>>('/admin/new-groups', {
    params: { limit }
  });
  return response.data.data;
};

/**
 * Récupérer les groupes dont l'abonnement expire bientôt
 */
export const getExpiringGroups = async (limit: number = 5): Promise<Group[]> => {
  const response = await api.get<PaginatedResponse<Group>>('/admin/groups/expiring-soon', {
    params: { limit }
  });
  return response.data.data;
};

/**
 * Lister tous les groupes avec pagination
 */
export const getAllGroups = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Group>> => {
  const response = await api.get<PaginatedResponse<Group>>('/admin/groups', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Rechercher des groupes
 */
export const searchGroups = async (query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Group>> => {
  const response = await api.get<PaginatedResponse<Group>>('/admin/groups/search', {
    params: { q: query, page, limit }
  });
  return response.data;
};

/**
 * Récupérer les détails d'un groupe
 * Utilise une stratégie de fallback :
 * 1. Essaie /admin/group/:id (singulier)
 * 2. Si échec, essaie /admin/groups/:id (pluriel)
 * 3. Si échec, récupère depuis la liste et filtre
 */
export const getGroupById = async (id: number): Promise<Group> => {
  // Stratégie 1 : Endpoint singulier
  try {
    const response = await api.get<Group>(`/admin/group/${id}`);
    console.log(`✅ [adminService] Group ${id} récupéré via /admin/group/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn(`⚠️ [adminService] /admin/group/${id} échoué (${error.response?.status}), tentative avec pluriel...`);
  }

  // Stratégie 2 : Endpoint pluriel
  try {
    const response = await api.get<Group>(`/admin/groups/${id}`);
    console.log(`✅ [adminService] Group ${id} récupéré via /admin/groups/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn(`⚠️ [adminService] /admin/groups/${id} échoué (${error.response?.status}), fallback sur liste...`);
  }

  // Stratégie 3 : Récupérer depuis la liste
  try {
    const response = await api.get<PaginatedResponse<Group>>('/admin/groups', {
      params: { page: 1, limit: 100 }
    });
    const group = response.data.data.find(g => g.id === id);
    if (group) {
      console.log(`✅ [adminService] Group ${id} trouvé dans la liste`);
      return group;
    }
    throw new Error(`Group ${id} non trouvé dans la liste`);
  } catch (error: any) {
    console.error(`❌ [adminService] Impossible de récupérer le groupe ${id}:`, error);
    throw new Error(`Groupe ${id} introuvable`);
  }
};

/**
 * Récupérer les nouveaux utilisateurs d'un groupe
 */
export const getGroupNewUsers = async (groupId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<NewUser>> => {
  const response = await api.get<PaginatedResponse<NewUser>>(`/admin/group/${groupId}/new-users`, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Activer un groupe
 */
export const activateGroup = async (groupId: number): Promise<void> => {
  await api.post(`/admin/group/${groupId}/active`);
};

/**
 * Désactiver un groupe
 */
export const disableGroup = async (groupId: number): Promise<void> => {
  await api.post(`/admin/group/${groupId}/disable`);
};

/**
 * Lister tous les paiements
 */
export const getAllPayments = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Payment>> => {
  const response = await api.get<PaginatedResponse<Payment>>('/admin/payments', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Récupérer les paiements d'un groupe spécifique
 */
export const getGroupPayments = async (groupId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Payment>> => {
  const response = await api.get<PaginatedResponse<Payment>>(`/admin/group/${groupId}/payments`, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Récupérer les statistiques de paiement MultiPay
 */
export const getPaymentStats = async (): Promise<PaymentStats> => {
  const response = await api.get<PaymentStats>('/multipay/subscription/stats');
  return response.data;
};

/**
 * Étendre l'abonnement d'un groupe
 */
export const extendSubscription = async (groupId: number, data: ExtendSubscriptionRequest): Promise<void> => {
  await api.post(`/admin/group/${groupId}/subscription/extend`, data);
};

export default {
  getAdminStats,
  getNewGroups,
  getExpiringGroups,
  getAllGroups,
  searchGroups,
  getGroupById,
  getGroupNewUsers,
  activateGroup,
  disableGroup,
  getAllPayments,
  getGroupPayments,
  getPaymentStats,
  extendSubscription,
};
