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
  Button,
  Chip,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Info as InfoIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface PointOfSale {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  isActive: boolean;
  manager: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: PointOfSale[];
  total: number;
  page: number;
  totalPages: number;
}

const PointOfSaleManagement: React.FC = () => {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<PointOfSale | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    manager: ''
  });
  const { showSuccess, showError } = useSnackbar();

  const fetchPointsOfSale = async (currentPage: number, limit: number) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/site/list', {
        params: { page: currentPage + 1, limit }
      });
      setPointsOfSale(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement');
      // Mock data
      const mockData: PointOfSale[] = [
        {
          id: 1,
          name: 'Point de Vente Central',
          address: '123 Avenue Principale',
          city: 'Kinshasa',
          phone: '+243 900 000 001',
          email: 'central@toonashop.com',
          isActive: true,
          manager: 'Jean Mukendi',
          createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
        },
        {
          id: 2,
          name: 'Point de Vente Nord',
          address: '456 Boulevard du Nord',
          city: 'Lubumbashi',
          phone: '+243 900 000 002',
          email: 'nord@toonashop.com',
          isActive: true,
          manager: 'Marie Tshimanga',
          createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
        },
        {
          id: 3,
          name: 'Point de Vente Sud',
          address: '789 Route du Sud',
          city: 'Goma',
          phone: '+243 900 000 003',
          email: 'sud@toonashop.com',
          isActive: false,
          manager: 'Paul Kabongo',
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
        }
      ];
      setPointsOfSale(mockData);
      setTotalCount(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPointsOfSale(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setFormData({ name: '', address: '', city: '', phone: '', email: '', manager: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCreatePointOfSale = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/site/new', formData);
      showSuccess('Point de vente créé avec succès');
      handleCloseDialog();
      fetchPointsOfSale(page, rowsPerPage);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur création point de vente');
    }
  };

  const handleViewInfo = async (pos: PointOfSale) => {
    try {
      const response = await api.get('/site/info', {
        params: { id: pos.id }
      });
      setSelectedPos(response.data);
      setInfoDialogOpen(true);
    } catch (err: any) {
      // Use mock data
      setSelectedPos(pos);
      setInfoDialogOpen(true);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Points de Vente
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Créer et gérer les points de vente
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          Nouveau Point de Vente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : pointsOfSale.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aucun point de vente
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Date Création</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pointsOfSale.map((pos) => (
                  <TableRow key={pos.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {pos.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {pos.city}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {pos.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {pos.manager}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {pos.phone}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {pos.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(pos.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pos.isActive ? 'Actif' : 'Inactif'}
                        size="small"
                        color={pos.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<InfoIcon />}
                        onClick={() => handleViewInfo(pos)}
                      >
                        Info
                      </Button>
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
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </TableContainer>

      {/* Dialog Create Point of Sale */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Point de Vente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ville *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Responsable"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleCreatePointOfSale} startIcon={<StoreIcon />}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Info */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Informations du Point de Vente</DialogTitle>
        <DialogContent>
          {selectedPos && (
            <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Nom</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedPos.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ville</Typography>
                <Typography variant="body1">{selectedPos.city}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Responsable</Typography>
                <Typography variant="body1">{selectedPos.manager}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Adresse</Typography>
                <Typography variant="body1">{selectedPos.address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Téléphone</Typography>
                <Typography variant="body1">{selectedPos.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedPos.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Date Création</Typography>
                <Typography variant="body1">{formatDate(selectedPos.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Statut</Typography>
                <Chip
                  label={selectedPos.isActive ? 'Actif' : 'Inactif'}
                  size="small"
                  color={selectedPos.isActive ? 'success' : 'default'}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PointOfSaleManagement;
