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
  Check as CheckIcon,
  Handshake as HandshakeIcon
} from '@mui/icons-material';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Partnership {
  id: number;
  supplierName: string;
  supplierId: number;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: string;
  responseDate?: string;
  email: string;
  phone: string;
}

const PartnershipManagement: React.FC = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const { showSuccess, showError } = useSnackbar();

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      // No list endpoint, using mock data
      const mockData: Partnership[] = [
        {
          id: 1,
          supplierName: 'Fournisseur Alpha',
          supplierId: 101,
          status: 'accepted',
          requestDate: new Date(Date.now() - 7 * 86400000).toISOString(),
          responseDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          email: 'contact@alpha.com',
          phone: '+243 900 000 001'
        },
        {
          id: 2,
          supplierName: 'Fournisseur Beta',
          supplierId: 102,
          status: 'pending',
          requestDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          email: 'info@beta.com',
          phone: '+243 900 000 002'
        },
        {
          id: 3,
          supplierName: 'Fournisseur Gamma',
          supplierId: 103,
          status: 'accepted',
          requestDate: new Date(Date.now() - 14 * 86400000).toISOString(),
          responseDate: new Date(Date.now() - 10 * 86400000).toISOString(),
          email: 'contact@gamma.com',
          phone: '+243 900 000 003'
        }
      ];
      setPartnerships(mockData);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleRequestPartnership = async () => {
    if (!supplierId || !supplierName) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await api.post(`/partnership/request/${supplierId}`);
      showSuccess('Demande de partenariat envoyée');
      setDialogOpen(false);
      setSupplierId('');
      setSupplierName('');
      fetchPartnerships();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la demande');
    }
  };

  const handleAcceptPartnership = async (partnershipId: number) => {
    try {
      await api.patch(`/partnership/accept/${partnershipId}`);
      showSuccess('Partenariat accepté');
      fetchPartnerships();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur acceptation');
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Partenariats
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Demandes et acceptations des partenariats fournisseurs
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Nouvelle Demande
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : partnerships.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aucun partenariat
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fournisseur</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Date Demande</TableCell>
                  <TableCell>Date Réponse</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partnerships.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((partnership) => (
                  <TableRow key={partnership.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {partnership.supplierName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        #{partnership.supplierId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {partnership.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {partnership.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(partnership.requestDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {partnership.responseDate ? formatDate(partnership.responseDate) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(partnership.status)}
                        size="small"
                        color={getStatusColor(partnership.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {partnership.status === 'pending' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckIcon />}
                          onClick={() => handleAcceptPartnership(partnership.id)}
                        >
                          Accepter
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={partnerships.length}
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

      {/* Dialog Request Partnership */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Demande de Partenariat</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du fournisseur *"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID Fournisseur *"
                type="number"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleRequestPartnership} startIcon={<HandshakeIcon />}>
            Envoyer la Demande
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnershipManagement;
