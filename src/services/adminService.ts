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

/**
 * Récupérer les statistiques globales
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
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
 */
export const getGroupById = async (id: number): Promise<Group> => {
  const response = await api.get<Group>(`/admin/group/${id}`);
  return response.data;
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
  extendSubscription,
};
