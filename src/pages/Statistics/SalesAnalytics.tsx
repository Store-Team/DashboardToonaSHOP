import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  avgOrderValue: number;
}

interface CategoryData {
  name: string;
  sales: number;
  percentage: number;
  growth: number;
}

interface Analytics {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  salesGrowth: number;
  ordersGrowth: number;
  salesByDay: SalesData[];
  salesByCategory: CategoryData[];
}

const SalesAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<string>('month');
  const { showSuccess, showError } = useSnackbar();

  const fetchAnalytics = async (period: string) => {
    setLoading(true);
    try {
      const response = await api.get<Analytics>('/admin/statistics/sales-analytics', {
        params: { period }
      });
      setAnalytics(response.data);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des analyses');
      // Mock data for development
      const mockAnalytics: Analytics = {
        totalSales: 285400000,
        totalOrders: 1243,
        avgOrderValue: 229607,
        salesGrowth: 18.5,
        ordersGrowth: 12.3,
        salesByDay: [
          { date: '2026-01-26', sales: 38500000, orders: 165, avgOrderValue: 233333 },
          { date: '2026-01-27', sales: 42300000, orders: 182, avgOrderValue: 232417 },
          { date: '2026-01-28', sales: 39800000, orders: 174, avgOrderValue: 228735 },
          { date: '2026-01-29', sales: 45200000, orders: 198, avgOrderValue: 228282 },
          { date: '2026-01-30', sales: 41600000, orders: 179, avgOrderValue: 232402 },
          { date: '2026-01-31', sales: 38900000, orders: 168, avgOrderValue: 231547 },
          { date: '2026-02-01', sales: 39100000, orders: 177, avgOrderValue: 220903 }
        ],
        salesByCategory: [
          { name: 'Informatique', sales: 125800000, percentage: 44.1, growth: 22.5 },
          { name: 'Accessoires', sales: 68500000, percentage: 24.0, growth: 15.3 },
          { name: 'Audio', sales: 42100000, percentage: 14.7, growth: 18.9 },
          { name: 'Bureautique', sales: 31200000, percentage: 10.9, growth: 12.1 },
          { name: 'Autres', sales: 17800000, percentage: 6.3, growth: 8.7 }
        ]
      };
      
      setAnalytics(mockAnalytics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(periodFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodFilter]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getTrendIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUpIcon sx={{ color: 'success.main' }} />
    ) : (
      <TrendingDownIcon sx={{ color: 'error.main' }} />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  const maxDailySales = Math.max(...analytics.salesByDay.map(d => d.sales));

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Analyses des Ventes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Statistiques détaillées et tendances des ventes
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={periodFilter}
            label="Période"
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <MenuItem value="week">7 derniers jours</MenuItem>
            <MenuItem value="month">30 derniers jours</MenuItem>
            <MenuItem value="quarter">Ce trimestre</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ventes Totales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(analytics.totalSales)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getTrendIcon(analytics.salesGrowth)}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: analytics.salesGrowth >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {analytics.salesGrowth >= 0 ? '+' : ''}{analytics.salesGrowth}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs période précédente
                    </Typography>
                  </Box>
                </Box>
                <AttachMoneyIcon sx={{ fontSize: 48, color: 'action.disabled', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nombre de Commandes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {analytics.totalOrders}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getTrendIcon(analytics.ordersGrowth)}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: analytics.ordersGrowth >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {analytics.ordersGrowth >= 0 ? '+' : ''}{analytics.ordersGrowth}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs période précédente
                    </Typography>
                  </Box>
                </Box>
                <ShoppingCartIcon sx={{ fontSize: 48, color: 'action.disabled', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Valeur Moyenne Commande
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(analytics.avgOrderValue)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Panier moyen par transaction
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 48, color: 'action.disabled', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Evolution Chart */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ShowChartIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Évolution des Ventes
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {analytics.salesByDay.map((day, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(day.date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {day.orders} commandes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(day.sales / maxDailySales) * 100}
                        sx={{ 
                          flex: 1, 
                          height: 12, 
                          borderRadius: 6,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            bgcolor: index === analytics.salesByDay.length - 1 ? '#5B8DEE' : '#7C9DD9'
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 120, textAlign: 'right' }}>
                        {formatCurrency(day.sales)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Category */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ReceiptIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ventes par Catégorie
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {analytics.salesByCategory.map((category, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600,
                            color: category.growth >= 15 ? 'success.main' : 'primary.main'
                          }}
                        >
                          +{category.growth}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={category.percentage}
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: index === 0 ? '#5B8DEE' : index === 1 ? '#7C9DD9' : '#9CB4E8'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {category.percentage}% du total
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {formatCurrency(category.sales)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Summary */}
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2, border: '1px solid', borderColor: 'grey.300' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Catégorie Leader
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {analytics.salesByCategory[0].name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics.salesByCategory[0].percentage}% des ventes totales
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesAnalytics;
