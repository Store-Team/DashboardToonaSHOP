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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  ReportProblem as ReportIcon
} from '@mui/icons-material';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Reclamation {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
  client: string;
}

interface PaginatedResponse {
  data: Reclamation[];
  total: number;
  page: number;
  totalPages: number;
}

const ClaimManagement: React.FC = () => {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    client: ''
  });
  const { showSuccess, showError } = useSnackbar();

  const fetchReclamations = async (currentPage: number, limit: number) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/reclamation/list', {
        params: { page: currentPage + 1, limit }
      });
      setReclamations(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement');
      // Mock data
      const mockData: Reclamation[] = [
        {
          id: 1,
          title: 'Produit défectueux',
          description: 'Le produit livré ne fonctionne pas correctement',
          status: 'in-progress',
          priority: 'high',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          client: 'Client ABC'
        },
        {
          id: 2,
          title: 'Livraison incomplète',
          description: 'Il manque 2 articles dans la commande',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          client: 'Client XYZ'
        },
        {
          id: 3,
          title: 'Problème de facturation',
          description: 'Montant facturé incorrect',
          status: 'resolved',
          priority: 'low',
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          resolvedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          client: 'Client DEF'
        }
      ];
      setReclamations(mockData);
      setTotalCount(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamations(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    setFormData({ title: '', description: '', priority: 'medium', client: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCreateReclamation = async () => {
    if (!formData.title || !formData.description) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/reclamation/create', formData);
      showSuccess('Réclamation créée avec succès');
      handleCloseDialog();
      fetchReclamations(page, rowsPerPage);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur création réclamation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return 'Résolu';
      case 'in-progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Réclamations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Suivi des réclamations clients
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          Nouvelle Réclamation
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : reclamations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aucune réclamation
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Priorité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date Création</TableCell>
                  <TableCell>Date Résolution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reclamations.map((claim) => (
                  <TableRow key={claim.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {claim.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {claim.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {claim.client}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityLabel(claim.priority)}
                        size="small"
                        color={getPriorityColor(claim.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(claim.status)}
                        size="small"
                        color={getStatusColor(claim.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(claim.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {claim.resolvedAt ? formatDate(claim.resolvedAt) : '-'}
                      </Typography>
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

      {/* Dialog Create Reclamation */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Réclamation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priorité"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Basse</MenuItem>
                  <MenuItem value="medium">Moyenne</MenuItem>
                  <MenuItem value="high">Haute</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateReclamation} startIcon={<ReportIcon />}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimManagement;
