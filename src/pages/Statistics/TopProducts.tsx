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
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface TopProduct {
  id: number;
  productName: string;
  productCode: string;
  category: string;
  unitsSold: number;
  revenue: number;
  avgPrice: number;
  stockLevel: number;
  growthRate: number;
}

interface ProductStats {
  totalRevenue: number;
  totalUnitsSold: number;
  avgOrderValue: number;
  topCategory: string;
}

interface PaginatedResponse {
  data: TopProduct[];
  stats: ProductStats;
}

const TopProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<string>('month');
  const { showSuccess, showError } = useSnackbar();

  const fetchTopProducts = async (period: string) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/admin/statistics/top-products', {
        params: { period }
      });
      setProducts(response.data.data);
      setStats(response.data.stats);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des statistiques');
      // Mock data for development
      const mockProducts: TopProduct[] = [
        { id: 1, productName: 'Ordinateur Portable HP ProBook', productCode: 'PRD-001', category: 'Informatique', unitsSold: 145, revenue: 61625000, avgPrice: 425000, stockLevel: 32, growthRate: 23.5 },
        { id: 2, productName: 'Écran LED 24" Samsung', productCode: 'PRD-003', category: 'Informatique', unitsSold: 128, revenue: 23680000, avgPrice: 185000, stockLevel: 18, growthRate: 18.2 },
        { id: 3, productName: 'Clavier Sans Fil Logitech', productCode: 'PRD-002', category: 'Accessoires', unitsSold: 320, revenue: 4800000, avgPrice: 15000, stockLevel: 85, growthRate: 15.8 },
        { id: 4, productName: 'Souris Optique', productCode: 'PRD-004', category: 'Accessoires', unitsSold: 285, revenue: 2422500, avgPrice: 8500, stockLevel: 120, growthRate: 12.4 },
        { id: 5, productName: 'Webcam HD Logitech', productCode: 'PRD-006', category: 'Informatique', unitsSold: 96, revenue: 4320000, avgPrice: 45000, stockLevel: 42, growthRate: 28.6 },
        { id: 6, productName: 'Casque Audio Bluetooth', productCode: 'PRD-007', category: 'Audio', unitsSold: 182, revenue: 5824000, avgPrice: 32000, stockLevel: 68, growthRate: 19.3 },
        { id: 7, productName: 'Câble HDMI 2m', productCode: 'PRD-005', category: 'Accessoires', unitsSold: 412, revenue: 2266000, avgPrice: 5500, stockLevel: 156, growthRate: 8.7 },
        { id: 8, productName: 'Imprimante Laser HP', productCode: 'PRD-008', category: 'Bureautique', unitsSold: 58, revenue: 16530000, avgPrice: 285000, stockLevel: 15, growthRate: 32.1 },
        { id: 9, productName: 'Chargeur Laptop Universel', productCode: 'PRD-009', category: 'Accessoires', unitsSold: 224, revenue: 4032000, avgPrice: 18000, stockLevel: 95, growthRate: 14.2 },
        { id: 10, productName: 'Hub USB-C 7 ports', productCode: 'PRD-010', category: 'Accessoires', unitsSold: 143, revenue: 5005000, avgPrice: 35000, stockLevel: 52, growthRate: 21.8 }
      ];
      
      setProducts(mockProducts);
      setStats({
        totalRevenue: mockProducts.reduce((sum, p) => sum + p.revenue, 0),
        totalUnitsSold: mockProducts.reduce((sum, p) => sum + p.unitsSold, 0),
        avgOrderValue: mockProducts.reduce((sum, p) => sum + p.revenue, 0) / mockProducts.reduce((sum, p) => sum + p.unitsSold, 0),
        topCategory: 'Accessoires'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts(periodFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodFilter]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  const getGrowthColor = (rate: number) => {
    if (rate >= 20) return 'success';
    if (rate >= 10) return 'primary';
    return 'warning';
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 32 }} />;
    if (index === 1) return <EmojiEventsIcon sx={{ color: '#C0C0C0', fontSize: 28 }} />;
    if (index === 2) return <EmojiEventsIcon sx={{ color: '#CD7F32', fontSize: 24 }} />;
    return <Typography sx={{ fontWeight: 700, fontSize: 20, color: 'text.secondary' }}>#{index + 1}</Typography>;
  };

  const maxRevenue = products.length > 0 ? Math.max(...products.map(p => p.revenue)) : 0;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Top Produits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Classement des produits les plus performants
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
                  <AttachMoneyIcon color="success" sx={{ fontSize: 40 }} />
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
                  <ShoppingCartIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalUnitsSold}</Typography>
                    <Typography variant="body2" color="text.secondary">Unités Vendues</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.avgOrderValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Valeur Moyenne</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <InventoryIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.topCategory}</Typography>
                    <Typography variant="body2" color="text.secondary">Catégorie Leader</Typography>
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
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucune donnée disponible</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={80} align="center">Rang</TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell align="center">Unités Vendues</TableCell>
                <TableCell align="right">Revenus</TableCell>
                <TableCell align="right">Prix Moyen</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Croissance</TableCell>
                <TableCell>Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id} hover>
                  <TableCell align="center">
                    {getRankBadge(index)}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.productCode}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {product.unitsSold}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(product.revenue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(product.avgPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={product.stockLevel} 
                      size="small" 
                      color={product.stockLevel < 20 ? 'error' : product.stockLevel < 50 ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`+${product.growthRate}%`} 
                      size="small" 
                      color={getGrowthColor(product.growthRate)}
                      icon={<TrendingUpIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(product.revenue / maxRevenue) * 100} 
                        sx={{ height: 8, borderRadius: 4 }}
                        color={index < 3 ? 'success' : 'primary'}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {((product.revenue / maxRevenue) * 100).toFixed(1)}%
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

export default TopProducts;
