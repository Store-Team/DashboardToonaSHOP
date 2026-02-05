import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as CartIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface SalesStats {
  totalSales: number;
  totalInvoices: number;
  averageTicket: number;
  salesGrowth: number;
  invoicesPaid: number;
  invoicesPending: number;
  topGroups: Array<{
    groupName: string;
    totalSales: number;
    invoiceCount: number;
    growth: number;
  }>;
  salesByMonth: Array<{
    month: string;
    amount: number;
    invoices: number;
  }>;
}

const SalesOverview: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    const fetchSalesStats = async () => {
      setLoading(true);
      try {
        const response = await api.get<SalesStats>('/admin/sales/overview', {
          params: { period }
        });
        setStats(response.data);
      } catch (err: any) {
        showError(err?.response?.data?.error || 'Erreur lors du chargement des statistiques');
        // Mock data for development
        setStats({
          totalSales: 45800000,
          totalInvoices: 342,
          averageTicket: 133918,
          salesGrowth: 12.5,
          invoicesPaid: 298,
          invoicesPending: 44,
          topGroups: [
            { groupName: 'Tech Solutions Sarl', totalSales: 12500000, invoiceCount: 87, growth: 15.3 },
            { groupName: 'Commerce Plus', totalSales: 8900000, invoiceCount: 65, growth: -3.2 },
            { groupName: 'AgriPro Group', totalSales: 7200000, invoiceCount: 54, growth: 22.1 },
            { groupName: 'Digital Wave', totalSales: 6100000, invoiceCount: 48, growth: 8.7 },
            { groupName: 'Logistics Pro', totalSales: 4800000, invoiceCount: 38, growth: 5.4 }
          ],
          salesByMonth: [
            { month: 'Sep', amount: 3200000, invoices: 28 },
            { month: 'Oct', amount: 3800000, invoices: 32 },
            { month: 'Nov', amount: 4100000, invoices: 35 },
            { month: 'Déc', amount: 5200000, invoices: 42 },
            { month: 'Jan', amount: 4900000, invoices: 38 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  const handleExport = () => {
    showSuccess('Export des ventes lancé');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Aperçu des Ventes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Statistiques et performances commerciales
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={period}
              label="Période"
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <MenuItem value="week">Cette semaine</MenuItem>
              <MenuItem value="month">Ce mois</MenuItem>
              <MenuItem value="quarter">Ce trimestre</MenuItem>
              <MenuItem value="year">Cette année</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
            Exporter
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {stats.salesGrowth >= 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  )}
                  <Typography variant="body2" sx={{ color: stats.salesGrowth >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                    {Math.abs(stats.salesGrowth)}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formatCurrency(stats.totalSales)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventes Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <ReceiptIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.totalInvoices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Factures Émises
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                  <CartIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formatCurrency(stats.averageTicket)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Panier Moyen
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                  <CalendarIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {((stats.invoicesPaid / stats.totalInvoices) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taux de Paiement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Groups */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Top 5 des Entreprises
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Entreprise</TableCell>
                      <TableCell align="right">Ventes</TableCell>
                      <TableCell align="center">Factures</TableCell>
                      <TableCell align="right">Évolution</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topGroups.map((group, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.light', color: 'primary.main' }}>
                              {index + 1}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {group.groupName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(group.totalSales)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={group.invoiceCount} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {group.growth >= 0 ? (
                              <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18 }} />
                            ) : (
                              <TrendingDownIcon sx={{ color: 'error.main', fontSize: 18 }} />
                            )}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: group.growth >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 600 
                              }}
                            >
                              {Math.abs(group.growth)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Month */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Évolution Mensuelle
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.salesByMonth.map((month, index) => {
                  const maxAmount = Math.max(...stats.salesByMonth.map(m => m.amount));
                  const percentage = (month.amount / maxAmount) * 100;
                  
                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {month.month}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(month.amount)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            bgcolor: 'success.main'
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {month.invoices} factures
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesOverview;
