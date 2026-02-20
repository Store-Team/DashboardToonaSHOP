/**
 * Contact Service
 * Handles all interactions with the Website Contact Messages API.
 * Uses the isolated `contactAxios` instance — completely decoupled from
 * the main ToonaSHOP adminService.
 *
 * ─── Real API Response shape ─────────────────────────────────────────────────
 * GET /api/contact  →  { success: true, count: 35, data: Contact[] }
 * POST /api/contact →  { success: true, data: Contact }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import contactApi from './api/contactAxios';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ContactType = 'sales' | 'support';

/** Fields common to both sales and support contacts */
export interface ContactBase {
    id: number;
    type: ContactType;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    email: string;
    phone: string | null;
    company: string | null;
    message: string;
    createdAt: string;
    emailSent: boolean;
    whatsappSent: boolean;
}

/** Extra fields present only on "support" contacts */
export interface SupportContact extends ContactBase {
    type: 'support';
    preferredEmail: string | null;
    toonashopAccountEmail: string | null;
    contactReason: string | null;
}

/** Extra fields present only on "sales" contacts */
export interface SalesContact extends ContactBase {
    type: 'sales';
    jobTitle: string | null;
    professionalEmail: string | null;
    country: string | null;
    ordersPerMonth: string | null;
    currentERP: string | null;
    hasExistingAccount: boolean | null;
}

export type Contact = SupportContact | SalesContact;

/** Computed stats — derived from the list response (no dedicated /stats endpoint) */
export interface ContactStats {
    total: number;
    byType: {
        sales: number;
        support: number;
    };
}

// ─── Internal API response wrappers ──────────────────────────────────────────

interface ContactListResponse {
    success: boolean;
    count: number;
    data: Contact[];
}

interface ContactSingleResponse {
    success: boolean;
    data: Contact;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Retrieve all contact messages.
 * @param type  Optional filter: 'sales' | 'support'. Omit for all.
 */
export const getContacts = async (type?: ContactType): Promise<Contact[]> => {
    const params = type ? { type } : {};
    const response = await contactApi.get<ContactListResponse>('/api/contact', { params });
    return response.data.data ?? [];
};

/**
 * Retrieve a single contact message by ID.
 */
export const getContactById = async (id: number): Promise<Contact> => {
    const response = await contactApi.get<ContactSingleResponse>(`/api/contact/${id}`);
    return response.data.data;
};

/**
 * Retrieve aggregated statistics for contact messages.
 * Computed client-side from the list endpoint since there is no /stats endpoint.
 */
export const getContactStats = async (): Promise<ContactStats> => {
    const contacts = await getContacts();
    const sales = contacts.filter((c) => c.type === 'sales').length;
    const support = contacts.filter((c) => c.type === 'support').length;
    return {
        total: contacts.length,
        byType: { sales, support },
    };
};

/**
 * Payload for creating a support contact message.
 */
export interface CreateSupportContactPayload {
    type: 'support';
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    preferredEmail?: string;
    toonashopAccountEmail?: string;
    contactReason?: string;
}

/**
 * Payload for creating a sales contact message.
 */
export interface CreateSalesContactPayload {
    type: 'sales';
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    jobTitle?: string;
    professionalEmail?: string;
    country?: string;
    ordersPerMonth?: string;
    currentERP?: string;
    hasExistingAccount?: boolean;
}

export type CreateContactPayload = CreateSupportContactPayload | CreateSalesContactPayload;

/**
 * Submit a new contact message (support or sales).
 */
export const createContact = async (
    payload: CreateContactPayload
): Promise<Contact> => {
    const response = await contactApi.post<ContactSingleResponse>('/api/contact', payload);
    return response.data.data;
};

export default {
    getContacts,
    getContactById,
    getContactStats,
    createContact,
};
