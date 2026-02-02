import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
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
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Tooltip,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  ErrorOutline as CriticalIcon,
  ShoppingCart as OrderIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface StockAlert {
  id: number;
  productName: string;
  productCode: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  locationType: 'warehouse' | 'pos';
  groupName: string;
  lastRestockDate: string;
  alertLevel: 'critical' | 'low' | 'warning';
}

interface PaginatedResponse {
  data: StockAlert[];
  total: number;
  criticalCount: number;
  lowCount: number;
  page: number;
  limit: number;
  total_pages: number;
}

const StockAlerts: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [lowCount, setLowCount] = useState(0);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const { showSuccess, showError } = useSnackbar();

  const fetchStockAlerts = async (currentPage: number, limit: number, search?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/inventory/alerts/search', {
          params: { q: search, page: currentPage + 1, limit }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/inventory/alerts', {
          params: { page: currentPage + 1, limit }
        });
      }
      setAlerts(response.data.data);
      setTotalCount(response.data.total);
      setCriticalCount(response.data.criticalCount);
      setLowCount(response.data.lowCount);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des alertes');
      // Mock data for development
      const mockAlerts: StockAlert[] = [
        { id: 1, productName: 'Ordinateur Portable HP', productCode: 'PRD-001', currentStock: 2, minStock: 5, maxStock: 20, location: 'Entrepôt Central', locationType: 'warehouse', groupName: 'Tech Solutions Sarl', lastRestockDate: '2025-12-15 10:00:00', alertLevel: 'critical' },
        { id: 2, productName: 'Clavier Sans Fil', productCode: 'PRD-002', currentStock: 8, minStock: 15, maxStock: 50, location: 'Point Vente Yaoundé', locationType: 'pos', groupName: 'Tech Solutions Sarl', lastRestockDate: '2026-01-10 14:30:00', alertLevel: 'low' },
        { id: 3, productName: 'Écran LED 24"', productCode: 'PRD-003', currentStock: 0, minStock: 10, maxStock: 30, location: 'Entrepôt Douala', locationType: 'warehouse', groupName: 'Commerce Plus', lastRestockDate: '2025-11-28 09:15:00', alertLevel: 'critical' },
        { id: 4, productName: 'Souris Optique', productCode: 'PRD-004', currentStock: 12, minStock: 20, maxStock: 100, location: 'Point Vente Douala', locationType: 'pos', groupName: 'Tech Solutions Sarl', lastRestockDate: '2026-01-20 16:45:00', alertLevel: 'warning' },
        { id: 5, productName: 'Câble HDMI', productCode: 'PRD-005', currentStock: 3, minStock: 30, maxStock: 150, location: 'Entrepôt Central', locationType: 'warehouse', groupName: 'Digital Wave', lastRestockDate: '2026-01-05 11:20:00', alertLevel: 'critical' },
        { id: 6, productName: 'Webcam HD', productCode: 'PRD-006', currentStock: 15, minStock: 25, maxStock: 80, location: 'Point Vente Yaoundé', locationType: 'pos', groupName: 'Commerce Plus', lastRestockDate: '2026-01-18 08:30:00', alertLevel: 'low' },
        { id: 7, productName: 'Casque Audio Bluetooth', productCode: 'PRD-007', currentStock: 1, minStock: 8, maxStock: 40, location: 'Entrepôt Douala', locationType: 'warehouse', groupName: 'Tech Solutions Sarl', lastRestockDate: '2025-12-22 13:00:00', alertLevel: 'critical' }
      ];
      
      setAlerts(mockAlerts);
      setTotalCount(mockAlerts.length);
      setCriticalCount(mockAlerts.filter(a => a.alertLevel === 'critical').length);
      setLowCount(mockAlerts.filter(a => a.alertLevel === 'low').length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAlerts(page, rowsPerPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery]);

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

  const handleOpenOrderDialog = (alert: StockAlert) => {
    setSelectedAlert(alert);
    setOrderQuantity(String(alert.maxStock - alert.currentStock));
    setOrderDialogOpen(true);
  };

  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setSelectedAlert(null);
    setOrderQuantity('');
  };

  const handleCreateOrder = async () => {
    if (!selectedAlert || !orderQuantity) {
      showError('Veuillez entrer une quantité valide');
      return;
    }

    const quantity = parseInt(orderQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      showError('Quantité invalide');
      return;
    }

    try {
      await api.post(`/admin/inventory/order`, {
        productId: selectedAlert.id,
        quantity,
        location: selectedAlert.location
      });
      showSuccess('Commande de réapprovisionnement créée avec succès');
      handleCloseOrderDialog();
      fetchStockAlerts(page, rowsPerPage, searchQuery);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de la création de la commande');
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getAlertChip = (level: string) => {
    const configs: Record<string, { label: string; color: 'error' | 'warning' | 'default'; icon: JSX.Element }> = {
      critical: { label: 'Critique', color: 'error', icon: <CriticalIcon /> },
      low: { label: 'Bas', color: 'warning', icon: <WarningIcon /> },
      warning: { label: 'Attention', color: 'default', icon: <WarningIcon /> }
    };
    const config = configs[level] || { label: level, color: 'default' as const, icon: <WarningIcon /> };
    return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
  };

  const getLocationChip = (type: string) => {
    return type === 'warehouse' ? (
      <Chip label="Entrepôt" size="small" variant="outlined" />
    ) : (
      <Chip label="Point de vente" size="small" variant="outlined" color="primary" />
    );
  };

  const handleExport = () => {
    showSuccess('Export des alertes lancé');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Alertes de Stock
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount} alerte{totalCount > 1 ? 's' : ''} de stock
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
            Exporter
          </Button>
        </Box>
      </Box>

      {/* Alert Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Alert severity="error" sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Alertes Critiques</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{criticalCount}</Typography>
          </Box>
        </Alert>
        <Alert severity="warning" sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Stock Bas</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{lowCount}</Typography>
          </Box>
        </Alert>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
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
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucune alerte de stock</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Essayez une autre recherche' : 'Tous les stocks sont suffisants'}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell>Emplacement</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell align="center">Stock Actuel</TableCell>
                  <TableCell align="center">Min / Max</TableCell>
                  <TableCell>Dernier Réappro.</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: alert.alertLevel === 'critical' ? 'error.light' : 'warning.light',
                            color: alert.alertLevel === 'critical' ? 'error.main' : 'warning.main'
                          }}
                        >
                          <WarningIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {alert.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.productCode}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>{alert.location}</Typography>
                      {getLocationChip(alert.locationType)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{alert.groupName}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: alert.currentStock === 0 ? 'error.main' : 
                                 alert.currentStock < alert.minStock ? 'warning.main' : 'text.primary'
                        }}
                      >
                        {alert.currentStock}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {alert.minStock} / {alert.maxStock}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(alert.lastRestockDate)}</Typography>
                    </TableCell>
                    <TableCell>{getAlertChip(alert.alertLevel)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Commander">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenOrderDialog(alert)}
                        >
                          <OrderIcon />
                        </IconButton>
                      </Tooltip>
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

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onClose={handleCloseOrderDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une Commande de Réapprovisionnement</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>{selectedAlert.productName}</strong>
                </Typography>
                <Typography variant="body2">
                  Stock actuel: <strong>{selectedAlert.currentStock}</strong> | 
                  Stock minimum: <strong>{selectedAlert.minStock}</strong>
                </Typography>
                <Typography variant="body2">
                  Emplacement: <strong>{selectedAlert.location}</strong>
                </Typography>
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Quantité à commander"
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    helperText={`Quantité recommandée: ${selectedAlert.maxStock - selectedAlert.currentStock} unités`}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateOrder} startIcon={<OrderIcon />}>
            Créer la Commande
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockAlerts;
