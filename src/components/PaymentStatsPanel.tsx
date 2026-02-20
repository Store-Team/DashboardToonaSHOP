import React from 'react';
import {
    Grid,
    Box,
    Card,
    CardContent,
    Typography,
    Skeleton,
    Divider,
    Chip
} from '@mui/material';
import {
    TrendingUp,
    AttachMoney,
    CheckCircle,
    Cancel,
    AccountBalanceWallet
} from '@mui/icons-material';
import StatCard from './StatCard';
import { PaymentStats } from '../services/adminService';

interface PaymentStatsPanelProps {
    paymentStats: PaymentStats | null;
    loading?: boolean;
    /** Titre de la section, affiché en haut du panel */
    title?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    approved: {
        label: 'Approuvés',
        color: '#2E7D32',
        bg: '#E8F5E9',
    },
    failed: {
        label: 'Échoués',
        color: '#C62828',
        bg: '#FFEBEE',
    },
    timeout: {
        label: 'Timeout',
        color: '#E65100',
        bg: '#FFF3E0',
    },
    pending: {
        label: 'En attente',
        color: '#1565C0',
        bg: '#E3F2FD',
    },
};

const getStatusConfig = (status: string) =>
    STATUS_CONFIG[status] ?? { label: status, color: '#616161', bg: '#F5F5F5' };

// ─── Squelette d'un seul StatCard ───────────────────────────────────────────
const StatSkeleton: React.FC = () => (
    <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
);

// ─── Composant principal ─────────────────────────────────────────────────────
const PaymentStatsPanel: React.FC<PaymentStatsPanelProps> = ({
    paymentStats,
    loading = false,
    title = 'Statistiques des Paiements',
}) => {
    return (
        <Box>
            {/* ── Titre de section ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                    mt: 1,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: '#fff',
                    }}
                >
                    <AccountBalanceWallet fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
            </Box>

            {/* ── 4 KPI Cards ── */}
            <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                    {loading ? (
                        <StatSkeleton />
                    ) : (
                        <StatCard
                            title="Total Paiements"
                            value={paymentStats?.totals?.total ?? 0}
                            trend={0}
                            icon={<TrendingUp />}
                            color="#6366F1"
                        />
                    )}
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    {loading ? (
                        <StatSkeleton />
                    ) : (
                        <StatCard
                            title="Montant Total"
                            value={`${(paymentStats?.totals?.total_amount ?? 0).toFixed(2)} USD`}
                            trend={0}
                            icon={<AttachMoney />}
                            color="#0EA5E9"
                        />
                    )}
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    {loading ? (
                        <StatSkeleton />
                    ) : (
                        <StatCard
                            title="Approuvés"
                            value={paymentStats?.totals?.approved_count ?? 0}
                            trend={0}
                            icon={<CheckCircle />}
                            color="#10B981"
                        />
                    )}
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    {loading ? (
                        <StatSkeleton />
                    ) : (
                        <StatCard
                            title="Échoués"
                            value={paymentStats?.totals?.failed_count ?? 0}
                            trend={0}
                            icon={<Cancel />}
                            color="#EF4444"
                        />
                    )}
                </Grid>
            </Grid>

            {/* ── Répartition ── */}
            {!loading && paymentStats && (
                <Card
                    sx={{
                        mt: 3,
                        borderRadius: 3,
                        boxShadow: '0 1px 8px 0 rgba(0,0,0,0.07)',
                        overflow: 'visible',
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                            Répartition des Paiements
                        </Typography>

                        <Grid container spacing={3}>
                            {/* ── Par Statut ── */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                    sx={{ fontWeight: 700, letterSpacing: 1.2 }}
                                >
                                    Par Statut
                                </Typography>
                                <Divider sx={{ mt: 0.5, mb: 1.5 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {paymentStats.by_status?.map((item) => {
                                        const cfg = getStatusConfig(item.status);
                                        const pct =
                                            paymentStats.totals.total > 0
                                                ? ((item.count / paymentStats.totals.total) * 100).toFixed(1)
                                                : '0';
                                        return (
                                            <Box key={item.status}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            label={cfg.label}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: cfg.bg,
                                                                color: cfg.color,
                                                                fontWeight: 700,
                                                                fontSize: 11,
                                                                height: 22,
                                                                borderRadius: 1,
                                                            }}
                                                        />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {item.count} transaction{item.count > 1 ? 's' : ''}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        ${item.amount.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                {/* Barre de progression */}
                                                <Box
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: 'grey.100',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            height: '100%',
                                                            width: `${pct}%`,
                                                            bgcolor: cfg.color,
                                                            borderRadius: 3,
                                                            transition: 'width 0.5s ease',
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {pct}% du total
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Grid>

                            {/* ── Par Provider ── */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                    sx={{ fontWeight: 700, letterSpacing: 1.2 }}
                                >
                                    Par Provider
                                </Typography>
                                <Divider sx={{ mt: 0.5, mb: 1.5 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {paymentStats.by_provider?.slice(0, 5).map((item) => {
                                        const pct =
                                            paymentStats.totals.total > 0
                                                ? ((item.count / paymentStats.totals.total) * 100).toFixed(1)
                                                : '0';
                                        return (
                                            <Box key={item.provider}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: 'primary.main',
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {item.provider}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ({item.count} tx)
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        ${item.amount.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                {/* Barre de progression */}
                                                <Box
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: 'grey.100',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            height: '100%',
                                                            width: `${pct}%`,
                                                            bgcolor: 'primary.main',
                                                            borderRadius: 3,
                                                            transition: 'width 0.5s ease',
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {pct}% du total
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Skeleton pour la partie répartition */}
            {loading && (
                <Skeleton
                    variant="rectangular"
                    height={220}
                    sx={{ mt: 3, borderRadius: 3 }}
                />
            )}
        </Box>
    );
};

export default PaymentStatsPanel;
