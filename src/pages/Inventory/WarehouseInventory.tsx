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
  Warehouse as WarehouseIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface WarehouseItem {
  id: number;
  productName: string;
  productCode: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  lastMovement: string;
  movementType: 'in' | 'out';
}

interface WarehouseStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  overstockCount: number;
}

interface PaginatedResponse {
  data: WarehouseItem[];
  stats: WarehouseStats;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const WarehouseInventory: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const { showSuccess, showError } = useSnackbar();

  const fetchWarehouseInventory = async (currentPage: number, limit: number, search?: string, warehouse?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/inventory/warehouse/search', {
          params: { q: search, page: currentPage + 1, limit, warehouse: warehouse !== 'all' ? warehouse : undefined }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/inventory/warehouse', {
          params: { page: currentPage + 1, limit, warehouse: warehouse !== 'all' ? warehouse : undefined }
        });
      }
      setItems(response.data.data);
      setStats(response.data.stats);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement de l\'inventaire');
      // Mock data for development
      const mockItems: WarehouseItem[] = [
        { id: 1, productName: 'Ordinateur Portable HP', productCode: 'PRD-001', category: 'Informatique', quantity: 45, minStock: 10, maxStock: 80, unitPrice: 425000, totalValue: 19125000, lastMovement: '2026-01-30 10:00:00', movementType: 'in' },
        { id: 2, productName: 'Clavier Sans Fil', productCode: 'PRD-002', category: 'Accessoires', quantity: 120, minStock: 50, maxStock: 200, unitPrice: 15000, totalValue: 1800000, lastMovement: '2026-01-28 14:30:00', movementType: 'out' },
        { id: 3, productName: 'Écran LED 24"', productCode: 'PRD-003', category: 'Informatique', quantity: 32, minStock: 15, maxStock: 60, unitPrice: 185000, totalValue: 5920000, lastMovement: '2026-01-25 09:15:00', movementType: 'in' },
        { id: 4, productName: 'Souris Optique', productCode: 'PRD-004', category: 'Accessoires', quantity: 250, minStock: 100, maxStock: 400, unitPrice: 8500, totalValue: 2125000, lastMovement: '2026-01-29 16:45:00', movementType: 'out' },
        { id: 5, productName: 'Câble HDMI', productCode: 'PRD-005', category: 'Accessoires', quantity: 180, minStock: 80, maxStock: 300, unitPrice: 5500, totalValue: 990000, lastMovement: '2026-01-27 11:20:00', movementType: 'in' },
        { id: 6, productName: 'Webcam HD', productCode: 'PRD-006', category: 'Informatique', quantity: 68, minStock: 25, maxStock: 100, unitPrice: 45000, totalValue: 3060000, lastMovement: '2026-01-31 08:30:00', movementType: 'out' },
        { id: 7, productName: 'Casque Audio Bluetooth', productCode: 'PRD-007', category: 'Audio', quantity: 95, minStock: 40, maxStock: 150, unitPrice: 32000, totalValue: 3040000, lastMovement: '2026-01-26 13:00:00', movementType: 'in' },
        { id: 8, productName: 'Imprimante Laser', productCode: 'PRD-008', category: 'Bureautique', quantity: 28, minStock: 15, maxStock: 50, unitPrice: 285000, totalValue: 7980000, lastMovement: '2026-01-24 15:15:00', movementType: 'out' }
      ];
      
      setItems(mockItems);
      setStats({
        totalProducts: mockItems.length,
        totalValue: mockItems.reduce((sum, item) => sum + item.totalValue, 0),
        lowStockCount: mockItems.filter(i => i.quantity < i.minStock).length,
        overstockCount: mockItems.filter(i => i.quantity > i.maxStock).length
      });
      setTotalCount(mockItems.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouseInventory(page, rowsPerPage, searchQuery, warehouseFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, warehouseFilter]);

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

  const getStockStatus = (quantity: number, minStock: number, maxStock: number) => {
    if (quantity < minStock) {
      return <Chip label="Stock bas" color="error" size="small" />;
    } else if (quantity > maxStock) {
      return <Chip label="Surstock" color="warning" size="small" />;
    }
    return <Chip label="Normal" color="success" size="small" />;
  };

  const getMovementChip = (type: string) => {
    return type === 'in' ? (
      <Chip label="Entrée" size="small" color="success" variant="outlined" />
    ) : (
      <Chip label="Sortie" size="small" color="error" variant="outlined" />
    );
  };

  const handleExport = () => {
    showSuccess('Export de l\'inventaire lancé');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Inventaire Entrepôts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestion des stocks dans les entrepôts
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
                  <WarehouseIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.totalValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Valeur Totale</Typography>
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
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'warning.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: 'warning.main', fontWeight: 700 }}>{stats.overstockCount}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.overstockCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Surstock</Typography>
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
            <InputLabel>Entrepôt</InputLabel>
            <Select
              value={warehouseFilter}
              label="Entrepôt"
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tous les entrepôts</MenuItem>
              <MenuItem value="central">Entrepôt Central</MenuItem>
              <MenuItem value="douala">Entrepôt Douala</MenuItem>
              <MenuItem value="yaounde">Entrepôt Yaoundé</MenuItem>
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
                  <TableCell align="center">Quantité</TableCell>
                  <TableCell align="center">Min / Max</TableCell>
                  <TableCell align="right">Prix Unitaire</TableCell>
                  <TableCell align="right">Valeur Totale</TableCell>
                  <TableCell>Dernier Mouvement</TableCell>
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
                    <TableCell align="center">
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {item.minStock} / {item.maxStock}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.totalValue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatDate(item.lastMovement)}
                      </Typography>
                      {getMovementChip(item.movementType)}
                    </TableCell>
                    <TableCell>{getStockStatus(item.quantity, item.minStock, item.maxStock)}</TableCell>
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

export default WarehouseInventory;
