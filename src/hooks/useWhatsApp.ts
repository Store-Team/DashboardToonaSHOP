/**
 * useWhatsApp — Hook for WhatsApp message forwarding
 *
 * Opens WhatsApp Web / app with a pre-filled message.
 * Numbers are configured via environment variables:
 *   VITE_WA_SALES   — Sales team WhatsApp
 *   VITE_WA_SUPPORT — Support team WhatsApp
 */

import { useCallback } from 'react';
import { ContactType } from '../services/contactService';

const WA_NUMBERS: Record<ContactType, string> = {
    sales: import.meta.env.VITE_WA_SALES || '+243000000000',
    support: import.meta.env.VITE_WA_SUPPORT || '+243000000000',
};

interface ForwardToWhatsAppOptions {
    type: ContactType;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    createdAt: string;
}

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const useWhatsApp = () => {
    const forwardMessage = useCallback((opts: ForwardToWhatsAppOptions) => {
        const number = WA_NUMBERS[opts.type].replace(/[^+\d]/g, '');

        const text = [
            `📩 *Nouveau message ${opts.type === 'sales' ? 'Commercial' : 'Support'}*`,
            ``,
            `👤 *Nom :* ${opts.fullName}`,
            `🏢 *Entreprise :* ${opts.company}`,
            `📧 *Email :* ${opts.email}`,
            `📞 *Téléphone :* ${opts.phone}`,
            `📅 *Date :* ${formatDate(opts.createdAt)}`,
            ``,
            `💬 *Message :*`,
            opts.message,
        ].join('\n');

        const encoded = encodeURIComponent(text);
        const url = `https://wa.me/${number}?text=${encoded}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    return { forwardMessage, waNumbers: WA_NUMBERS };
};
