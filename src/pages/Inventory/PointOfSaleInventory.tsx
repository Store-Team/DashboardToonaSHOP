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
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Store as StoreIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface POSItem {
  id: number;
  productName: string;
  productCode: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  salesCount: number;
  lastSale: string;
  posName: string;
  groupName: string;
}

interface POSStats {
  totalProducts: number;
  totalSales: number;
  lowStockCount: number;
  topSelling: number;
}

interface PaginatedResponse {
  data: POSItem[];
  stats: POSStats;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const PointOfSaleInventory: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<POSItem[]>([]);
  const [stats, setStats] = useState<POSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [posFilter, setPosFilter] = useState<string>('all');
  const { showSuccess, showError } = useSnackbar();

  const fetchPOSInventory = async (currentPage: number, limit: number, search?: string, pos?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/inventory/pos/search', {
          params: { q: search, page: currentPage + 1, limit, pos: pos !== 'all' ? pos : undefined }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/inventory/pos', {
          params: { page: currentPage + 1, limit, pos: pos !== 'all' ? pos : undefined }
        });
      }
      setItems(response.data.data);
      setStats(response.data.stats);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement de l\'inventaire');
      // Mock data for development
      const mockItems: POSItem[] = [
        { id: 1, productName: 'Ordinateur Portable HP', productCode: 'PRD-001', category: 'Informatique', quantity: 12, minStock: 5, maxStock: 20, unitPrice: 425000, salesCount: 28, lastSale: '2026-02-01 15:30:00', posName: 'Point Vente Yaoundé', groupName: 'Tech Solutions Sarl' },
        { id: 2, productName: 'Clavier Sans Fil', productCode: 'PRD-002', category: 'Accessoires', quantity: 45, minStock: 20, maxStock: 80, unitPrice: 15000, salesCount: 87, lastSale: '2026-02-01 18:20:00', posName: 'Point Vente Douala', groupName: 'Tech Solutions Sarl' },
        { id: 3, productName: 'Écran LED 24"', productCode: 'PRD-003', category: 'Informatique', quantity: 8, minStock: 5, maxStock: 25, unitPrice: 185000, salesCount: 42, lastSale: '2026-02-01 12:45:00', posName: 'Point Vente Yaoundé', groupName: 'Commerce Plus' },
        { id: 4, productName: 'Souris Optique', productCode: 'PRD-004', category: 'Accessoires', quantity: 68, minStock: 30, maxStock: 120, unitPrice: 8500, salesCount: 156, lastSale: '2026-02-01 17:10:00', posName: 'Point Vente Douala', groupName: 'Tech Solutions Sarl' },
        { id: 5, productName: 'Câble HDMI', productCode: 'PRD-005', category: 'Accessoires', quantity: 52, minStock: 25, maxStock: 100, unitPrice: 5500, salesCount: 203, lastSale: '2026-02-01 16:55:00', posName: 'Point Vente Yaoundé', groupName: 'Digital Wave' },
        { id: 6, productName: 'Webcam HD', productCode: 'PRD-006', category: 'Informatique', quantity: 22, minStock: 10, maxStock: 40, unitPrice: 45000, salesCount: 64, lastSale: '2026-02-01 14:25:00', posName: 'Point Vente Douala', groupName: 'Commerce Plus' },
        { id: 7, productName: 'Casque Audio Bluetooth', productCode: 'PRD-007', category: 'Audio', quantity: 35, minStock: 15, maxStock: 60, unitPrice: 32000, salesCount: 95, lastSale: '2026-02-01 19:00:00', posName: 'Point Vente Yaoundé', groupName: 'Tech Solutions Sarl' },
        { id: 8, productName: 'Chargeur Laptop', productCode: 'PRD-009', category: 'Accessoires', quantity: 41, minStock: 20, maxStock: 80, unitPrice: 18000, salesCount: 112, lastSale: '2026-02-01 13:40:00', posName: 'Point Vente Douala', groupName: 'Digital Wave' }
      ];
      
      setItems(mockItems);
      setStats({
        totalProducts: mockItems.length,
        totalSales: mockItems.reduce((sum, item) => sum + item.salesCount, 0),
        lowStockCount: mockItems.filter(i => i.quantity < i.minStock).length,
        topSelling: mockItems.length > 0 ? Math.max(...mockItems.map(i => i.salesCount)) : 0
      });
      setTotalCount(mockItems.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSInventory(page, rowsPerPage, searchQuery, posFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, posFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        setSearchQuery(searchTerm);
        setPage(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchQuery]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity < minStock) {
      return <Chip label="Stock bas" color="error" size="small" />;
    } else if (quantity < minStock * 1.5) {
      return <Chip label="À surveiller" color="warning" size="small" />;
    }
    return <Chip label="Normal" color="success" size="small" />;
  };

  const getSalesChip = (count: number) => {
    if (count > 150) {
      return <Chip label="Top vente" color="success" size="small" icon={<TrendingUpIcon />} />;
    } else if (count > 80) {
      return <Chip label="Bonne vente" color="primary" size="small" />;
    }
    return <Chip label={`${count} ventes`} size="small" variant="outlined" />;
  };

  const handleExport = () => {
    showSuccess('Export de l\'inventaire lancé');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Inventaire Points de Vente
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestion des stocks dans les points de vente
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
            Exporter
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalProducts}</Typography>
                    <Typography variant="body2" color="text.secondary">Produits</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StoreIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalSales}</Typography>
                    <Typography variant="body2" color="text.secondary">Ventes Totales</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'error.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: 'error.main', fontWeight: 700 }}>{stats.lowStockCount}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.lowStockCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Stock Bas</Typography>
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
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.topSelling}</Typography>
                    <Typography variant="body2" color="text.secondary">Meilleure Vente</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par nom de produit ou code (min. 2 caractères)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Point de Vente</InputLabel>
            <Select
              value={posFilter}
              label="Point de Vente"
              onChange={(e) => {
                setPosFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tous les points</MenuItem>
              <MenuItem value="yaounde">Point Vente Yaoundé</MenuItem>
              <MenuItem value="douala">Point Vente Douala</MenuItem>
              <MenuItem value="bafoussam">Point Vente Bafoussam</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucun produit trouvé</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Essayez une autre recherche' : 'L\'inventaire est vide'}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Point de Vente</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="right">Prix</TableCell>
                  <TableCell>Ventes</TableCell>
                  <TableCell>Dernière Vente</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.productCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.posName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{item.groupName}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.quantity}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min: {item.minStock}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                    </TableCell>
                    <TableCell>
                      {getSalesChip(item.salesCount)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.lastSale)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStockStatus(item.quantity, item.minStock)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </TableContainer>
    </Box>
  );
};

export default PointOfSaleInventory;
