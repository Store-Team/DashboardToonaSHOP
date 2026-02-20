import axios, { AxiosError } from 'axios';

/**
 * Isolated Axios instance for the Contact/Messages API.
 * This is a completely separate backend from the main ToonaSHOP API.
 *
 * ─── CORS strategy ──────────────────────────────────────────────────────────
 * The API at https://website-api.toonashop.com already sets
 *   Access-Control-Allow-Origin  for localhost:3000
 * so we can call it directly from the browser without any proxy.
 *
 * The Vite proxy was causing HTTP 500 errors due to a protocol mismatch
 * (HTTP/1.1 keep-alive from Vite ↔ HTTP/2 CDN on Hostinger).
 * ────────────────────────────────────────────────────────────────────────────
 */

const CONTACT_API_BASE =
    import.meta.env.VITE_CONTACT_API_URL || 'https://website-api.toonashop.com';

const contactApi = axios.create({
    baseURL: CONTACT_API_BASE,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 15000,
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
