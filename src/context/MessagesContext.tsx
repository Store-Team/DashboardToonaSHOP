import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import { getContactStats } from '../services/contactService';
import { useAuth } from './AuthContext';

// ─── localStorage key for seen message tracking ──────────────────────────────
const SEEN_KEY = 'toona_seen_messages_count';

// ─── Polling interval (ms) ───────────────────────────────────────────────────
const POLL_INTERVAL_MS = 60_000; // 60 seconds

// ─── Context Shape ────────────────────────────────────────────────────────────
interface MessagesContextType {
    /** Number of messages the admin hasn't "seen" yet */
    unreadCount: number;
    /** Total messages on the server (latest fetched) */
    totalCount: number;
    /** Manually trigger a stats refresh */
    refreshUnread: () => void;
    /**
     * Mark all current messages as "seen".
     * Persists the current total in localStorage so badge resets to 0.
     */
    markAllSeen: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
    undefined
);

// ─── Helper: read / write last-seen count from localStorage ─────────────────
const getSeenCount = (): number => {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? parseInt(raw, 10) : 0;
};

const setSeenCount = (count: number): void => {
    localStorage.setItem(SEEN_KEY, String(count));
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated } = useAuth();
    const [totalCount, setTotalCount] = useState<number>(0);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Core fetch function
    const fetchStats = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const stats = await getContactStats();
            const total = stats.total ?? 0;
            const seen = getSeenCount();
            const newUnread = Math.max(0, total - seen);

            setTotalCount(total);
            setUnreadCount(newUnread);

            if (import.meta.env.DEV) {
                console.log(
                    `[MessagesContext] total=${total}, seen=${seen}, unread=${newUnread}`
                );
            }
        } catch {
            // Silent failure — contact API being down should not break the dashboard
        }
    }, [isAuthenticated]);

    // Initial fetch + polling
    useEffect(() => {
        if (!isAuthenticated) return;

        fetchStats();

        intervalRef.current = setInterval(fetchStats, POLL_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAuthenticated, fetchStats]);

    const refreshUnread = useCallback(() => {
        fetchStats();
    }, [fetchStats]);

    const markAllSeen = useCallback(() => {
        setSeenCount(totalCount);
        setUnreadCount(0);
    }, [totalCount]);

    return (
        <MessagesContext.Provider
            value={{ unreadCount, totalCount, refreshUnread, markAllSeen }}
        >
            {children}
        </MessagesContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useMessages = (): MessagesContextType => {
    const ctx = useContext(MessagesContext);
    if (!ctx) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return ctx;
};
