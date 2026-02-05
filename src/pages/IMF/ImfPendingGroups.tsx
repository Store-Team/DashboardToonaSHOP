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
  DialogActions
} from '@mui/material';
import {
  Check as CheckIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface ImfGroup {
  id: number;
  name: string;
  contact: string;
  email: string;
  address: string;
  createdAt: string;
  planName?: string;
}

interface PaginatedResponse {
  data: ImfGroup[];
  total: number;
  page: number;
  totalPages: number;
}

const ImfPendingGroups: React.FC = () => {
  const [groups, setGroups] = useState<ImfGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ImfGroup | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchPendingGroups = async (currentPage: number, limit: number) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/imf/admin/groups/pending', {
        params: { page: currentPage + 1, limit }
      });
      setGroups(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement');
      // Mock data
      const mockData: ImfGroup[] = [
        {
          id: 1,
          name: 'IMF Alpha Finance',
          contact: '+243 900 000 001',
          email: 'contact@alphafinance.cd',
          address: 'Avenue Kasa-Vubu, Kinshasa',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          planName: 'Plan Entreprise'
        },
        {
          id: 2,
          name: 'IMF Beta Crédit',
          contact: '+243 900 000 002',
          email: 'info@betacredit.cd',
          address: 'Boulevard Lumumba, Lubumbashi',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          planName: 'Plan Premium'
        }
      ];
      setGroups(mockData);
      setTotalCount(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingGroups(page, rowsPerPage);
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

  const handleApproveClick = (group: ImfGroup) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedGroup) return;

    try {
      await api.patch(`/imf/admin/group/${selectedGroup.id}/approve`);
      showSuccess('Groupe IMF validé avec succès');
      setDialogOpen(false);
      setSelectedGroup(null);
      fetchPendingGroups(page, rowsPerPage);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Groupes IMF en Attente
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Validation des demandes d'enregistrement IMF
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : groups.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aucun groupe en attente
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom du Groupe</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Date Demande</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ color: 'action.disabled', opacity: 0.3 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {group.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {group.contact}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {group.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {group.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={group.planName || 'N/A'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(group.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={() => handleApproveClick(group)}
                      >
                        Valider
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
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmer la Validation</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Êtes-vous sûr de vouloir valider le groupe IMF suivant ?
          </Typography>
          {selectedGroup && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {selectedGroup.name}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {selectedGroup.email}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleApproveConfirm}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImfPendingGroups;
