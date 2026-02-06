import api from './api/axios';

/**
 * Service de gestion de l'authentification
 * Gère la connexion, déconnexion et récupération des informations utilisateur
 */

// Types
export interface LoginCredentials {
  numero?: string;  // Numéro de téléphone (actuel)
  email?: string;   // Email (à venir)
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    numero: string;
    nom: string;
    prenom: string;
    email?: string;
    roles: string[];
  };
}

export interface UserInfo {
  id: number;
  site_id: number;
  entrepot_id: number;
  groupe: number;
  nomUser: string;
  numero: string;
  email?: string;
  roles: string[];
  createdAt?: string;
}

export interface VerifyPhoneRequest {
  numero: string;
  otp: string;
}

export interface ResetPasswordRequest {
  numero: string;
}

export interface VerifyResetRequest {
  numero: string;
  otp: string;
  newPassword: string;
}

/**
 * Connexion avec numéro de téléphone ou email
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth', credentials);
  return response.data;
};

/**
 * Récupérer les informations de l'utilisateur connecté
 */
export const getConnectedUser = async (): Promise<UserInfo> => {
  const response = await api.get<UserInfo>('/user/connecter');
  return response.data;
};

/**
 * Vérifier le numéro de téléphone avec OTP
 */
export const verifyPhone = async (data: VerifyPhoneRequest): Promise<void> => {
  await api.post('/user/verify-phone', data);
};

/**
 * Demander la réinitialisation du mot de passe
 */
export const requestPasswordReset = async (data: ResetPasswordRequest): Promise<void> => {
  await api.post('/user/request-reset', data);
};

/**
 * Vérifier l'OTP de réinitialisation et définir nouveau mot de passe
 */
export const verifyPasswordReset = async (data: VerifyResetRequest): Promise<void> => {
  await api.post('/user/verify-reset', data);
};

/**
 * Déconnexion (côté client uniquement)
 */
export const logout = (): void => {
  localStorage.removeItem('toona_admin_token');
  localStorage.removeItem('toona_admin_user');
};

export default {
  login,
  getConnectedUser,
  verifyPhone,
  requestPasswordReset,
  verifyPasswordReset,
  logout,
};
