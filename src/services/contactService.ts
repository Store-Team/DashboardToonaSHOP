/**
 * Contact Service
 * Handles all interactions with the Website Contact Messages API.
 * Uses the isolated `contactAxios` instance — completely decoupled from
 * the main ToonaSHOP adminService.
 */

import contactApi from './api/contactAxios';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ContactType = 'sales' | 'support';

export interface Contact {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    type: ContactType;
    createdAt: string;
    emailSent: boolean;
    whatsappSent: boolean;
}

export interface ContactStats {
    total: number;
    byType: {
        sales: number;
        support: number;
    };
}

export interface CreateContactPayload {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    type: ContactType;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Retrieve the last 50 contact messages.
 * @param type  Optional filter: 'sales' | 'support'. Omit for all.
 */
export const getContacts = async (type?: ContactType): Promise<Contact[]> => {
    const params = type ? { type } : {};
    const response = await contactApi.get<Contact[]>('/contact', { params });
    return response.data;
};

/**
 * Retrieve a single contact message by ID.
 */
export const getContactById = async (id: number): Promise<Contact> => {
    const response = await contactApi.get<Contact>(`/contact/${id}`);
    return response.data;
};

/**
 * Retrieve aggregated statistics for contact messages.
 * Used for the unread badge counter in the notification system.
 */
export const getContactStats = async (): Promise<ContactStats> => {
    const response = await contactApi.get<ContactStats>('/contact/stats');
    return response.data;
};

/**
 * Submit a new contact form (mainly used for testing / admin-created messages).
 */
export const createContact = async (
    payload: CreateContactPayload
): Promise<Contact> => {
    const response = await contactApi.post<Contact>('/contact', payload);
    return response.data;
};

export default {
    getContacts,
    getContactById,
    getContactStats,
    createContact,
};
