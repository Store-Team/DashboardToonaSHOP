import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface TopClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  orderCount: number;
  avgOrderValue: number;
  lastPurchase: string;
  loyaltyScore: number;
  category: 'vip' | 'gold' | 'silver' | 'regular';
}

interface ClientStats {
  totalRevenue: number;
  totalOrders: number;
  avgClientValue: number;
  vipCount: number;
}

interface PaginatedResponse {
  data: TopClient[];
  stats: ClientStats;
}

const TopClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<TopClient[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<string>('month');
  const { showSuccess, showError } = useSnackbar();

  const fetchTopClients = async (period: string) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/admin/statistics/top-clients', {
        params: { period }
      });
      setClients(response.data.data);
      setStats(response.data.stats);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des statistiques');
      // Mock data for development
      const mockClients: TopClient[] = [
        { id: 1, name: 'Tech Solutions Sarl', email: 'contact@techsolutions.cm', phone: '+237 6 77 88 99 00', totalPurchases: 45800000, orderCount: 156, avgOrderValue: 293589, lastPurchase: '2026-02-01', loyaltyScore: 98, category: 'vip' },
        { id: 2, name: 'Commerce Plus', email: 'info@commerceplus.cm', phone: '+237 6 99 11 22 33', totalPurchases: 38500000, orderCount: 142, avgOrderValue: 271126, lastPurchase: '2026-01-31', loyaltyScore: 95, category: 'vip' },
        { id: 3, name: 'Digital Wave Sarl', email: 'hello@digitalwave.net', phone: '+237 6 55 44 33 22', totalPurchases: 32100000, orderCount: 128, avgOrderValue: 250781, lastPurchase: '2026-01-30', loyaltyScore: 92, category: 'vip' },
        { id: 4, name: 'AgriPro Group', email: 'contact@agripro.cm', phone: '+237 6 88 77 66 55', totalPurchases: 28900000, orderCount: 118, avgOrderValue: 244915, lastPurchase: '2026-01-29', loyaltyScore: 89, category: 'gold' },
        { id: 5, name: 'Logistics Pro', email: 'info@logipro.com', phone: '+237 6 22 33 44 55', totalPurchases: 24700000, orderCount: 105, avgOrderValue: 235238, lastPurchase: '2026-01-28', loyaltyScore: 86, category: 'gold' },
        { id: 6, name: 'Construction Plus', email: 'contact@constplus.cm', phone: '+237 6 11 22 33 44', totalPurchases: 21500000, orderCount: 96, avgOrderValue: 223958, lastPurchase: '2026-01-27', loyaltyScore: 83, category: 'gold' },
        { id: 7, name: 'Import Export Co', email: 'info@importexport.cm', phone: '+237 6 99 88 77 66', totalPurchases: 18300000, orderCount: 87, avgOrderValue: 210344, lastPurchase: '2026-01-26', loyaltyScore: 80, category: 'silver' },
        { id: 8, name: 'Retail Express', email: 'contact@retailexpress.cm', phone: '+237 6 44 55 66 77', totalPurchases: 15800000, orderCount: 78, avgOrderValue: 202564, lastPurchase: '2026-01-25', loyaltyScore: 76, category: 'silver' },
        { id: 9, name: 'Fashion House', email: 'hello@fashionhouse.cm', phone: '+237 6 33 44 55 66', totalPurchases: 13200000, orderCount: 69, avgOrderValue: 191304, lastPurchase: '2026-01-24', loyaltyScore: 72, category: 'silver' },
        { id: 10, name: 'Food & Beverages Ltd', email: 'contact@foodbev.cm', phone: '+237 6 77 66 55 44', totalPurchases: 11500000, orderCount: 64, avgOrderValue: 179687, lastPurchase: '2026-01-23', loyaltyScore: 68, category: 'regular' }
      ];
      
      setClients(mockClients);
      setStats({
        totalRevenue: mockClients.reduce((sum, c) => sum + c.totalPurchases, 0),
        totalOrders: mockClients.reduce((sum, c) => sum + c.orderCount, 0),
        avgClientValue: mockClients.reduce((sum, c) => sum + c.totalPurchases, 0) / mockClients.length,
        vipCount: mockClients.filter(c => c.category === 'vip').length
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopClients(periodFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodFilter]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryChip = (category: string) => {
    switch (category) {
      case 'vip':
        return <Chip label="VIP" size="small" sx={{ bgcolor: '#5B8DEE', color: '#fff', fontWeight: 700 }} icon={<StarIcon />} />;
      case 'gold':
        return <Chip label="Gold" size="small" sx={{ bgcolor: '#7C9DD9', color: '#fff', fontWeight: 600 }} />;
      case 'silver':
        return <Chip label="Silver" size="small" sx={{ bgcolor: '#9CB4E8', color: '#000', fontWeight: 600 }} />;
      default:
        return <Chip label="Regular" size="small" variant="outlined" />;
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 32 }} />;
    if (index === 1) return <EmojiEventsIcon sx={{ color: '#C0C0C0', fontSize: 28 }} />;
    if (index === 2) return <EmojiEventsIcon sx={{ color: '#CD7F32', fontSize: 24 }} />;
    return <Typography sx={{ fontWeight: 700, fontSize: 20, color: 'text.secondary' }}>#{index + 1}</Typography>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const maxPurchases = clients.length > 0 ? Math.max(...clients.map(c => c.totalPurchases)) : 0;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Top Clients
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Classement des meilleurs clients par chiffre d'affaires
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={periodFilter}
            label="Période"
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <MenuItem value="week">Cette semaine</MenuItem>
            <MenuItem value="month">Ce mois</MenuItem>
            <MenuItem value="quarter">Ce trimestre</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: 'action.disabled', opacity: 0.3 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Revenus Totaux</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShoppingCartIcon sx={{ fontSize: 40, color: 'action.disabled', opacity: 0.3 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">Commandes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'action.disabled', opacity: 0.3 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.avgClientValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Valeur Moy. Client</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'action.disabled', opacity: 0.3 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.vipCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Clients VIP</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : clients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucune donnée disponible</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={80} align="center">Rang</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="center">Commandes</TableCell>
                <TableCell align="right">Total Achats</TableCell>
                <TableCell align="right">Valeur Moy.</TableCell>
                <TableCell>Dernier Achat</TableCell>
                <TableCell align="center">Fidélité</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client, index) => (
                <TableRow key={client.id} hover>
                  <TableCell align="center">
                    {getRankBadge(index)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: index < 3 ? '#5B8DEE' : 'grey.400' }}>
                        {getInitials(client.name)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {client.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {client.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.phone}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {client.orderCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(client.totalPurchases)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(client.avgOrderValue)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(client.lastPurchase)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={client.loyaltyScore} 
                        size={50}
                        thickness={5}
                        sx={{
                          color: client.loyaltyScore >= 90 ? '#5B8DEE' : client.loyaltyScore >= 75 ? '#7C9DD9' : '#9CB4E8'
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {client.loyaltyScore}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getCategoryChip(client.category)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(client.totalPurchases / maxPurchases) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: index < 3 ? '#5B8DEE' : '#7C9DD9'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {((client.totalPurchases / maxPurchases) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default TopClients;
