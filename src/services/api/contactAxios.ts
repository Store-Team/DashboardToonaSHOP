import axios, { AxiosError } from 'axios';

/**
 * Isolated Axios instance for the Contact/Messages API.
 * This is a completely separate backend from the main ToonaSHOP API.
 *
 * Rules:
 *  - No auth token injection (public-facing API, no admin session)
 *  - No 401/403 auto-redirect (would conflict with admin auth flow)
 *  - Independent error handling
 */

const CONTACT_API_URL =
    import.meta.env.VITE_CONTACT_API_URL || 'https://website-api.toonashop.com';

const contactApi = axios.create({
    baseURL: CONTACT_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor — log only in dev, no token injection
contactApi.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(
                `[ContactAPI] ${config.method?.toUpperCase()} ${config.url}`
            );
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — local error handling only, no global redirect
contactApi.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (import.meta.env.DEV) {
            if (error.response) {
                console.error(
                    `[ContactAPI] Error ${error.response.status} — ${error.config?.url}`
                );
            } else {
                console.error(`[ContactAPI] Network error — ${error.message}`);
            }
        }
        return Promise.reject(error);
    }
);

export default contactApi;
