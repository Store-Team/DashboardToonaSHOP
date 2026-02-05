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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapHorizIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface StockMovement {
  id: number;
  date: string;
  productName: string;
  productCode: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  fromLocation: string;
  toLocation: string;
  reason: string;
  performedBy: string;
  reference: string | null;
}

interface StockStats {
  totalIn: number;
  totalOut: number;
  totalTransfers: number;
  totalAdjustments: number;
}

interface PaginatedResponse {
  data: StockMovement[];
  stats: StockStats;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const StockHistory: React.FC = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const { showSuccess, showError } = useSnackbar();

  const fetchStockHistory = async (currentPage: number, limit: number, search?: string, type?: string, date?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/operations/stock-history/search', {
          params: { q: search, page: currentPage + 1, limit, type: type !== 'all' ? type : undefined, date }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/operations/stock-history', {
          params: { page: currentPage + 1, limit, type: type !== 'all' ? type : undefined, date }
        });
      }
      setMovements(response.data.data);
      setStats(response.data.stats);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement de l\'historique');
      // Mock data for development
      const mockMovements: StockMovement[] = [
        { id: 1, date: '2026-02-01 14:30:00', productName: 'Ordinateur Portable HP', productCode: 'PRD-001', type: 'in', quantity: 20, fromLocation: 'Fournisseur XYZ', toLocation: 'Entrepôt Central', reason: 'Réapprovisionnement', performedBy: 'Admin', reference: 'PO-2026-045' },
        { id: 2, date: '2026-02-01 10:15:00', productName: 'Clavier Sans Fil', productCode: 'PRD-002', type: 'out', quantity: 15, fromLocation: 'Entrepôt Central', toLocation: 'Point Vente Yaoundé', reason: 'Transfert vers POS', performedBy: 'Marie Dupont', reference: 'TRANS-2026-102' },
        { id: 3, date: '2026-01-31 16:45:00', productName: 'Écran LED 24"', productCode: 'PRD-003', type: 'transfer', quantity: 10, fromLocation: 'Entrepôt Douala', toLocation: 'Point Vente Douala', reason: 'Demande client', performedBy: 'Jean Kamga', reference: 'TRANS-2026-101' },
        { id: 4, date: '2026-01-31 09:20:00', productName: 'Souris Optique', productCode: 'PRD-004', type: 'adjustment', quantity: -5, fromLocation: 'Point Vente Bafoussam', toLocation: 'Point Vente Bafoussam', reason: 'Inventaire - produits endommagés', performedBy: 'Paul Nkoa', reference: 'ADJ-2026-012' },
        { id: 5, date: '2026-01-30 11:00:00', productName: 'Webcam HD', productCode: 'PRD-006', type: 'in', quantity: 30, fromLocation: 'Fournisseur ABC', toLocation: 'Entrepôt Central', reason: 'Nouvelle commande', performedBy: 'Admin', reference: 'PO-2026-044' },
        { id: 6, date: '2026-01-30 08:30:00', productName: 'Casque Audio Bluetooth', productCode: 'PRD-007', type: 'out', quantity: 12, fromLocation: 'Entrepôt Central', toLocation: 'Point Vente Douala', reason: 'Restockage POS', performedBy: 'Jean Kamga', reference: 'TRANS-2026-100' },
        { id: 7, date: '2026-01-29 15:45:00', productName: 'Câble HDMI', productCode: 'PRD-005', type: 'transfer', quantity: 25, fromLocation: 'Entrepôt Central', toLocation: 'Entrepôt Yaoundé', reason: 'Redistribution stock', performedBy: 'Admin', reference: 'TRANS-2026-099' },
        { id: 8, date: '2026-01-29 13:20:00', productName: 'Imprimante Laser', productCode: 'PRD-008', type: 'adjustment', quantity: 2, fromLocation: 'Entrepôt Central', toLocation: 'Entrepôt Central', reason: 'Correction inventaire', performedBy: 'Admin', reference: 'ADJ-2026-011' },
        { id: 9, date: '2026-01-28 10:00:00', productName: 'Chargeur Laptop', productCode: 'PRD-009', type: 'in', quantity: 50, fromLocation: 'Fournisseur XYZ', toLocation: 'Entrepôt Douala', reason: 'Commande mensuelle', performedBy: 'Jean Kamga', reference: 'PO-2026-043' },
        { id: 10, date: '2026-01-27 14:30:00', productName: 'Souris Optique', productCode: 'PRD-004', type: 'out', quantity: 30, fromLocation: 'Entrepôt Yaoundé', toLocation: 'Point Vente Yaoundé', reason: 'Stock bas POS', performedBy: 'Marie Dupont', reference: 'TRANS-2026-098' }
      ];
      
      setMovements(mockMovements);
      setStats({
        totalIn: mockMovements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0),
        totalOut: mockMovements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0),
        totalTransfers: mockMovements.filter(m => m.type === 'transfer').length,
        totalAdjustments: mockMovements.filter(m => m.type === 'adjustment').length
      });
      setTotalCount(mockMovements.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockHistory(page, rowsPerPage, searchQuery, typeFilter, dateFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, typeFilter, dateFilter]);

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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeChip = (type: string, quantity: number) => {
    switch (type) {
      case 'in':
        return <Chip label="Entrée" color="success" size="small" icon={<TrendingUpIcon />} />;
      case 'out':
        return <Chip label="Sortie" color="error" size="small" icon={<TrendingDownIcon />} />;
      case 'transfer':
        return <Chip label="Transfert" color="primary" size="small" icon={<SwapHorizIcon />} />;
      case 'adjustment':
        return quantity > 0 
          ? <Chip label="Ajustement +" color="info" size="small" />
          : <Chip label="Ajustement -" color="warning" size="small" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Historique des Stocks
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Traçabilité complète des mouvements de stock
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalIn}</Typography>
                    <Typography variant="body2" color="text.secondary">Entrées</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingDownIcon color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalOut}</Typography>
                    <Typography variant="body2" color="text.secondary">Sorties</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SwapHorizIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalTransfers}</Typography>
                    <Typography variant="body2" color="text.secondary">Transferts</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <InventoryIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalAdjustments}</Typography>
                    <Typography variant="body2" color="text.secondary">Ajustements</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            sx={{ flex: 1, minWidth: 300 }}
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
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Type de mouvement</InputLabel>
            <Select
              value={typeFilter}
              label="Type de mouvement"
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tous les types</MenuItem>
              <MenuItem value="in">Entrées</MenuItem>
              <MenuItem value="out">Sorties</MenuItem>
              <MenuItem value="transfer">Transferts</MenuItem>
              <MenuItem value="adjustment">Ajustements</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Date"
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : movements.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucun mouvement trouvé</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Heure</TableCell>
                  <TableCell>Produit</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="center">Quantité</TableCell>
                  <TableCell>De</TableCell>
                  <TableCell>Vers</TableCell>
                  <TableCell>Raison</TableCell>
                  <TableCell>Effectué par</TableCell>
                  <TableCell>Référence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDateTime(movement.date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {movement.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {movement.productCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getTypeChip(movement.type, movement.quantity)}
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: movement.type === 'in' || (movement.type === 'adjustment' && movement.quantity > 0) 
                            ? 'success.main' 
                            : movement.type === 'out' || (movement.type === 'adjustment' && movement.quantity < 0)
                            ? 'error.main'
                            : 'primary.main'
                        }}
                      >
                        {movement.quantity > 0 && movement.type !== 'out' ? '+' : ''}{movement.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {movement.fromLocation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {movement.toLocation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {movement.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{movement.performedBy}</Typography>
                    </TableCell>
                    <TableCell>
                      {movement.reference && (
                        <Chip label={movement.reference} size="small" variant="outlined" />
                      )}
                    </TableCell>
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

export default StockHistory;
