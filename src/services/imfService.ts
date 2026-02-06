import api from './api/axios';

/**
 * Service de gestion des IMF (Institutions de Microfinance)
 * Gère l'approbation, la liste et les analytics des IMF
 */

// Types
export interface ImfGroup {
  id: number;
  nomEntreprise: string;
  contact: string;
  email: string;
  address?: string;
  planName: string;
  type?: string;
  status?: string;
  createdAt?: string;
  approvedAt?: string;
  activeClients?: number;
  inactiveClients?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ImfAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageTransaction: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface GroupInfo {
  id: number;
  nomEntreprise: string;
  contact: string;
  email: string;
  address: string;
  type: string;
  status: string;
  isApproved: boolean;
}

/**
 * Récupérer la liste des IMF en attente d'approbation
 */
export const getPendingImfGroups = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<ImfGroup>> => {
  const response = await api.get<PaginatedResponse<ImfGroup>>('/imf/admin/groups/pending', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Récupérer la liste des IMF approuvés
 */
export const getApprovedImfGroups = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<ImfGroup>> => {
  const response = await api.get<PaginatedResponse<ImfGroup>>('/imf/admin/groups/approved', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Approuver un groupe IMF
 */
export const approveImfGroup = async (groupId: number): Promise<void> => {
  await api.patch(`/imf/admin/group/${groupId}/approve`);
};

/**
 * Récupérer les analytics d'un IMF
 */
export const getImfAnalytics = async (groupId: number): Promise<ImfAnalytics> => {
  const response = await api.get<ImfAnalytics>(`/imf/analytics/${groupId}`);
  return response.data;
};

/**
 * Rechercher un groupe par ID pour validation
 */
export const getGroupInfoById = async (groupId: number): Promise<GroupInfo> => {
  const response = await api.get<GroupInfo>(`/admin/groups/${groupId}`);
  return response.data;
};

export default {
  getPendingImfGroups,
  getApprovedImfGroups,
  approveImfGroup,
  getImfAnalytics,
  getGroupInfoById,
};
