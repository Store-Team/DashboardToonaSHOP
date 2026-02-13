
import React, { useState, useEffect, useCallback } from 'react';
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
  Modal, 
  TextField, 
  MenuItem, 
  CircularProgress,
  Divider,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface PaymentGroup {
  id: number;
  nomEntreprise: string;
  email: string;
}

interface Payment {
  id: number;
  status: string;
  transactionId: string;
  reference: string;
  statusDescription: string;
  amount: string;
  provider: string;
  plan: string;
  months: number;
  orderCurrency: string;
  createdAt: string;
  group: PaymentGroup;
}

interface PaginatedResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { showSuccess, showError } = useSnackbar();

  // Form states
  const [targetGroupId, setTargetGroupId] = useState('');
  const [plan, setPlan] = useState('pro');
  const [months, setMonths] = useState(3);

  const fetchPayments = useCallback(async (currentPage: number, limit: number, status?: string) => {
    setLoading(true);
    try {
      const params: any = { page: currentPage + 1, limit };
      // if (status && status !== 'all') {
      //   params.status = status; // Uncomment when API supports status filter
      // }
      
      const response = await api.get<PaginatedResponse>('/admin/payments', { params });
      setPayments(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      console.error('❌ Error fetching payments:', err);
      showError(err?.response?.data?.error || 'Erreur lors du chargement des paiements');
      // Afficher une liste vide en cas d'erreur
      setPayments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPayments(page, rowsPerPage, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter]);

  const handleExtend = async () => {
    if (!targetGroupId) {
      showError('Veuillez sélectionner une entreprise');
      return;
    }
    
    try {
      await api.post(`/admin/group/${targetGroupId}/subscription/extend`, { 
        months, 
        plan 
      });
      showSuccess('L\'abonnement a été étendu avec succès.');
      setModalOpen(false);
      setTargetGroupId('');
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de l\'extension.');
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
      approved: { label: 'Approuvé', color: 'success' },
      failed: { label: 'Échoué', color: 'error' },
      timeout: { label: 'Timeout', color: 'warning' },
      pending: { label: 'En attente', color: 'default' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Paiements & Abonnements
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount} paiement{totalCount > 1 ? 's' : ''} enregistré{totalCount > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Étendre un abonnement
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par statut</InputLabel>
          <Select
            value={statusFilter}
            label="Filtrer par statut"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            <MenuItem value="approved">Approuvé</MenuItem>
            <MenuItem value="failed">Échoué</MenuItem>
            <MenuItem value="timeout">Timeout</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : payments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Aucun paiement trouvé</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Référence</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Entreprise</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Montant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{payment.reference}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        TX: {payment.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{payment.group.nomEntreprise}</Typography>
                      <Typography variant="caption" color="text.secondary">{payment.group.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {payment.amount && !isNaN(parseFloat(payment.amount)) 
                        ? `${parseFloat(payment.amount).toFixed(2)} ${payment.orderCurrency || ''}` 
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Chip label={payment.provider} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{payment.plan}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{payment.months} mois</Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(payment.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(payment.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<ReceiptIcon />}>Détails</Button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Étendre l'abonnement</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cette action prolongera manuellement l'accès pour une entreprise spécifique après réception d'un paiement hors-ligne.
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="ID de l'entreprise"
              fullWidth
              type="number"
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              placeholder="Ex: 12"
              helperText="Entrez l'ID numérique de l'entreprise"
            />
            
            <TextField
              select
              label="Plan Tarifaire"
              fullWidth
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="pro">Pro</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </TextField>

            <TextField
              select
              label="Durée (Mois)"
              fullWidth
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              <MenuItem value={1}>1 Mois</MenuItem>
              <MenuItem value={3}>3 Mois</MenuItem>
              <MenuItem value={6}>6 Mois</MenuItem>
              <MenuItem value={12}>12 Mois (Annuel)</MenuItem>
              <MenuItem value={24}>24 Mois</MenuItem>
            </TextField>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button variant="contained" onClick={handleExtend}>Confirmer l'extension</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default PaymentHistory;
