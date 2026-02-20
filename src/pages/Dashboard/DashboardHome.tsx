
import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Skeleton,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Business,
  People,
  Subscriptions,
  History,
  TrendingUp,
  Warning,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import PaymentStatsPanel from '../../components/PaymentStatsPanel';
import * as adminService from '../../services/adminService';
import { useSnackbar } from '../../context/SnackbarContext';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  totalGroups: number;
  totalUsers: number;
  activeSubscriptions?: number;
  activeGroups?: number;
  totalRevenue?: number;
  trialGroups?: number;
  trends?: {
    groups?: number;
    users?: number;
    subs?: number;
    trials?: number;
  };
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [paymentStats, setPaymentStats] = useState<adminService.PaymentStats | null>(null);
  const [newGroups, setNewGroups] = useState<adminService.Group[]>([]);
  const [expiringGroups, setExpiringGroups] = useState<adminService.Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPaymentStats, setLoadingPaymentStats] = useState(true);
  const [loadingNewGroups, setLoadingNewGroups] = useState(true);
  const [loadingExpiring, setLoadingExpiring] = useState(true);
  const navigate = useNavigate();
  const { showError } = useSnackbar();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Ne charger les données que si l'utilisateur est authentifié
    if (!isAuthenticated) {
      setLoading(false);
      setLoadingPaymentStats(false);
      setLoadingNewGroups(false);
      setLoadingExpiring(false);
      return;
    }

    let isMounted = true;

    const fetchStats = async () => {
      try {
        const response = await adminService.getAdminStats();
        console.log('Stats API Response:', response);
        if (isMounted) {
          setStats(response);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err);
        if (isMounted) {
          showError('Impossible de charger les statistiques');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchNewGroups = async () => {
      try {
        const response = await adminService.getNewGroups(5);
        console.log('New Groups API Response:', response);
        if (isMounted) {
          setNewGroups(response || []);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des nouveaux groupes:', err);
        if (isMounted) {
          showError('Impossible de charger les nouveaux groupes');
          setNewGroups([]);
        }
      } finally {
        if (isMounted) {
          setLoadingNewGroups(false);
        }
      }
    };

    const fetchExpiringGroups = async () => {
      try {
        const response = await adminService.getExpiringGroups(5);
        if (isMounted) {
          setExpiringGroups(response || []);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des groupes expirants:', err);
        if (isMounted) {
          showError('Impossible de charger les groupes expirants');
          setExpiringGroups([]);
        }
      } finally {
        if (isMounted) {
          setLoadingExpiring(false);
        }
      }
    };

    const fetchPaymentStats = async () => {
      try {
        const response = await adminService.getPaymentStats();
        console.log('Payment Stats API Response:', response);
        if (isMounted) {
          setPaymentStats(response);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des stats de paiement:', err);
        if (isMounted) {
          // Ne pas afficher d'erreur car ce n'est pas critique
          setPaymentStats(null);
        }
      } finally {
        if (isMounted) {
          setLoadingPaymentStats(false);
        }
      }
    };

    fetchStats();
    fetchNewGroups();
    fetchExpiringGroups();
    fetchPaymentStats();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, showError]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Bienvenue dans l'administration ToonaSHOP
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos entreprises, utilisateurs et abonnements depuis un seul endroit.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary">Consulter le guide</Button>
          <Button variant="contained" color="primary">Nouveau groupe</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rectangular" height={160} /> : (
            <StatCard
              title="Total Companies"
              value={stats?.totalGroups || 0}
              trend={stats?.trends?.groups || 0}
              icon={<Business />}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rectangular" height={160} /> : (
            <StatCard
              title="Global Users"
              value={stats?.totalUsers || 0}
              trend={stats?.trends?.users || 0}
              icon={<People />}
              color="#F4B23C"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rectangular" height={160} /> : (
            <StatCard
              title="Active Subscriptions"
              value={stats?.activeSubscriptions || stats?.activeGroups || 0}
              trend={stats?.trends?.subs || 0}
              icon={<Subscriptions />}
              color="#4FA3D1"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rectangular" height={160} /> : (
            <StatCard
              title="Trial Groups"
              value={stats?.trialGroups || 0}
              trend={stats?.trends?.trials || 0}
              icon={<History />}
              color="#E86868"
            />
          )}
        </Grid>
      </Grid>

      {/* Payment Stats Panel centralisé */}
      <Box sx={{ mt: 3 }}>
        <PaymentStatsPanel
          paymentStats={paymentStats}
          loading={loadingPaymentStats}
          title="Statistiques des Paiements"
        />
      </Box>

      {/* Sections supplémentaires */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Nouveaux groupes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Nouveaux groupes
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/groups')}
                >
                  Voir tout
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loadingNewGroups ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton height={60} />
                  <Skeleton height={60} />
                  <Skeleton height={60} />
                </Box>
              ) : newGroups.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  Aucun nouveau groupe récemment
                </Typography>
              ) : (
                <List>
                  {newGroups.map((group, index) => (
                    <React.Fragment key={group.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                            <Business />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {group.nomEntreprise || 'Sans nom'}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="caption" color="text.secondary" display="block">
                                {group.email || 'Pas d\'email'}
                              </Typography>
                              <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                <Chip
                                  label={`${group.user_count || 0} utilisateurs`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {group.createdAt && formatDate(group.createdAt)}
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < newGroups.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Abonnements expirant bientôt */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Abonnements expirant
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/payments')}
                >
                  Voir tout
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loadingExpiring ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton height={60} />
                  <Skeleton height={60} />
                  <Skeleton height={60} />
                </Box>
              ) : expiringGroups.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  Aucun abonnement n'expire prochainement
                </Typography>
              ) : (
                <List>
                  {expiringGroups.map((group, index) => (
                    <React.Fragment key={group.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                            <Subscriptions />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {group.nomEntreprise || 'Sans nom'}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="caption" color="text.secondary" display="block">
                                {group.email || 'Pas d\'email'}
                              </Typography>
                              <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                <Chip
                                  label={`${Math.ceil((new Date(group.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours restants`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                                <Typography component="span" variant="caption" color="text.secondary">
                                  Expire le {new Date(group.subscriptionEnd).toLocaleDateString('fr-FR')}
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < expiringGroups.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
