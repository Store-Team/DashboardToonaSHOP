
import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Skeleton, Card, CardContent, Button } from '@mui/material';
import { Business, People, Subscriptions, History } from '@mui/icons-material';
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

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
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

    fetchStats();
  }, [showError]);

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
          <Button variant="contained" color="primary">Nouvelle Campagne</Button>
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
      </Grid>
    </Box>
  );
};

export default DashboardHome;
