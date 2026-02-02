
import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Skeleton, 
  Card, 
  CardContent, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  PersonAdd,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Stats {
  totalGroups: number;
  totalUsers: number;
  activeSubscriptions: number;
  trialGroups: number;
  trends: {
    groups: number;
    users: number;
    subs: number;
    trials: number;
  };
}

interface NewGroup {
  id: number;
  nomEntreprise: string;
  email: string;
  createdAt: string;
  user_count: number;
}

interface ExpiringGroup {
  id: number;
  nomEntreprise: string;
  email: string;
  subscriptionEnd: string;
  days_remaining: number;
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [newGroups, setNewGroups] = useState<NewGroup[]>([]);
  const [expiringGroups, setExpiringGroups] = useState<ExpiringGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNewGroups, setLoadingNewGroups] = useState(true);
  const [loadingExpiring, setLoadingExpiring] = useState(true);
  const navigate = useNavigate();
  const { showError } = useSnackbar();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        // Mock data for demonstration if API fails
        setStats({
          totalGroups: 124,
          totalUsers: 8420,
          activeSubscriptions: 98,
          trialGroups: 12,
          trends: { groups: 12, users: 5.4, subs: 8.2, trials: -2 }
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchNewGroups = async () => {
      try {
        const response = await api.get('/admin/new-groups', { params: { page: 1, limit: 5 } });
        setNewGroups(response.data.data);
      } catch (err) {
        // Mock data
        setNewGroups([
          { id: 1, nomEntreprise: 'TechStart Sarl', email: 'contact@techstart.com', createdAt: '2026-01-28 10:30:00', user_count: 3 },
          { id: 2, nomEntreprise: 'AgriPro Group', email: 'info@agripro.cm', createdAt: '2026-01-29 14:15:00', user_count: 5 },
          { id: 3, nomEntreprise: 'Digital Wave', email: 'hello@digitalwave.net', createdAt: '2026-01-31 09:00:00', user_count: 2 }
        ]);
      } finally {
        setLoadingNewGroups(false);
      }
    };

    const fetchExpiringGroups = async () => {
      try {
        const response = await api.get('/admin/groups/expiring-soon', { params: { page: 1, limit: 5 } });
        setExpiringGroups(response.data.data);
      } catch (err) {
        // Mock data
        setExpiringGroups([
          { id: 4, nomEntreprise: 'Commerce Plus', email: 'contact@commerceplus.cm', subscriptionEnd: '2026-02-08 23:59:59', days_remaining: 6 },
          { id: 5, nomEntreprise: 'Logistics Pro', email: 'info@logipro.com', subscriptionEnd: '2026-02-05 23:59:59', days_remaining: 3 }
        ]);
      } finally {
        setLoadingExpiring(false);
      }
    };

    fetchStats();
    fetchNewGroups();
    fetchExpiringGroups();
  }, [showError]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Bienvenue dans l'aldministration ToonaShop
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
              trend={stats?.trends.groups || 0} 
              icon={<Business />} 
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rectangular" height={160} /> : (
            <StatCard 
              title="Global Users" 
              value={stats?.totalUsers || 0} 
              trend={stats?.trends.users || 0} 
              icon={<People />} 
              color="#F4B23C"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rectangular" height={160} /> : (
            <StatCard 
              title="Active Subscriptions" 
              value={stats?.activeSubscriptions || 0} 
              trend={stats?.trends.subs || 0} 
              icon={<Subscriptions />} 
              color="#4FA3D1"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rectangular" height={160} /> : (
            <StatCard 
              title="Trial Periods" 
              value={stats?.trialGroups || 0} 
              trend={stats?.trends.trials || 0} 
              icon={<History />} 
              color="#673ab7"
            />
          )}
        </Grid>

        {/* Banner Section Inspired by Google Partner Dashboard */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'white', position: 'relative', overflow: 'visible', mt: 4 }}>
            <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#202124' }}>
                  Présentation du <span style={{ color: '#0A73B8' }}>réseau de partenaires</span> ToonaShop
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 4 }}>
                  Découvrez de nouveaux outils puissants et une interface simplifiée conçus pour accélérer votre croissance avec ToonaERP.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" size="large">Explorer les ressources</Button>
                  <Button variant="outlined" size="large">FAQ Administrateur</Button>
                </Box>
              </Box>
              <Box 
                component="img" 
                src="https://picsum.photos/400/300?business=1" 
                sx={{ 
                  width: 350, 
                  height: 'auto', 
                  borderRadius: '100px 10px 100px 10px',
                  display: { xs: 'none', md: 'block' }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>

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
                              {group.nomEntreprise}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {group.email}
                              </Typography>
                              <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                <Chip 
                                  label={`${group.user_count} utilisateurs`} 
                                  size="small" 
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(group.createdAt)}
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
                              {group.nomEntreprise}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {group.email}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                <Chip 
                                  label={`${group.days_remaining} jour${group.days_remaining > 1 ? 's' : ''} restant${group.days_remaining > 1 ? 's' : ''}`}
                                  size="small" 
                                  color="warning"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Expire le {new Date(group.subscriptionEnd).toLocaleDateString('fr-FR')}
                                </Typography>
                              </Box>
                            </Box>
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
