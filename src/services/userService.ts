import api from './api/axios';

/**
 * Service de gestion des utilisateurs
 * Gère la liste, création et modification des utilisateurs dans un groupe
 */

// Types
export interface User {
  id: number;
  numero: string;
  nom: string;
  prenom: string;
  email?: string;
  roles: string[];
  isActive: boolean;
  point_of_sale_id?: number;
  entrepot_id?: number;
  point_of_sale?: {
    id: number;
    name: string;
  };
  entrepot?: {
    id: number;
    name: string;
  };
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateUserRequest {
  numero: string;
  nom: string;
  prenom: string;
  email?: string;
  password: string;
  roles: string[];
  point_of_sale_id?: number;
  entrepot_id?: number;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  numero?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  roles?: string[];
  point_of_sale_id?: number;
  entrepot_id?: number;
  isActive?: boolean;
}

/**
 * Lister tous les utilisateurs du groupe connecté
 */
export const getUsers = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>('/user/list', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Créer un utilisateur dans le groupe connecté
 */
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await api.post<User>('/user/create-in-group', data);
  return response.data;
};

/**
 * Mettre à jour un utilisateur
 */
export const updateUser = async (userId: number, data: UpdateUserRequest): Promise<User> => {
  const response = await api.put<User>(`/user/update/${userId}`, data);
  return response.data;
};

export default {
  getUsers,
  createUser,
  updateUser,
};
