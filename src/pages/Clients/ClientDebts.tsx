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
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Download as DownloadIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface DebtClient {
  id: number;
  numero: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  groupName: string;
  totalAchats: number;
  solde: number;
  lastPayment: string;
  daysSinceLastPayment: number;
  invoiceCount: number;
}

interface PaginatedResponse {
  data: DebtClient[];
  total: number;
  totalDebt: number;
  page: number;
  limit: number;
  total_pages: number;
}

const ClientDebts: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<DebtClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DebtClient | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const { showSuccess, showError } = useSnackbar();

  const fetchDebtClients = async (currentPage: number, limit: number, search?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/clients/debts/search', {
          params: { q: search, page: currentPage + 1, limit }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/clients/debts', {
          params: { page: currentPage + 1, limit }
        });
      }
      setClients(response.data.data);
      setTotalCount(response.data.total);
      setTotalDebt(response.data.totalDebt);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des clients débiteurs');
      // Mock data for development
      const mockDebtClients: DebtClient[] = [
        { id: 2, numero: 'CLI002', nom: 'Kamga', prenom: 'Marie', telephone: '+237677554433', email: 'marie.kamga@example.com', groupName: 'Commerce Plus', totalAchats: 2300000, solde: 450000, lastPayment: '2026-01-15 10:00:00', daysSinceLastPayment: 18, invoiceCount: 3 },
        { id: 4, numero: 'CLI004', nom: 'Fotso', prenom: 'Alice', telephone: '+237644332211', email: 'alice.fotso@example.com', groupName: 'AgriPro Group', totalAchats: 3200000, solde: 820000, lastPayment: '2025-12-10 14:30:00', daysSinceLastPayment: 54, invoiceCount: 5 },
        { id: 6, numero: 'CLI006', nom: 'Nkongo', prenom: 'Sophie', telephone: '+237622110099', email: 'sophie.nkongo@example.com', groupName: 'Tech Solutions Sarl', totalAchats: 5600000, solde: 320000, lastPayment: '2026-01-20 09:15:00', daysSinceLastPayment: 13, invoiceCount: 2 },
        { id: 8, numero: 'CLI008', nom: 'Atangana', prenom: 'Grace', telephone: '+237600998877', email: 'grace.atangana@example.com', groupName: 'AgriPro Group', totalAchats: 4100000, solde: 180000, lastPayment: '2026-01-22 16:45:00', daysSinceLastPayment: 11, invoiceCount: 1 },
        { id: 10, numero: 'CLI010', nom: 'Biya', prenom: 'Laurent', telephone: '+237655998877', email: 'laurent.biya@example.com', groupName: 'Digital Wave', totalAchats: 1800000, solde: 650000, lastPayment: '2025-11-30 11:20:00', daysSinceLastPayment: 64, invoiceCount: 4 }
      ];
      
      setClients(mockDebtClients);
      setTotalCount(mockDebtClients.length);
      setTotalDebt(mockDebtClients.reduce((sum, c) => sum + c.solde, 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtClients(page, rowsPerPage, searchQuery);
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

  const handleOpenPaymentDialog = (client: DebtClient) => {
    setSelectedClient(client);
    setPaymentAmount('');
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedClient(null);
    setPaymentAmount('');
  };

  const handleRecordPayment = async () => {
    if (!selectedClient || !paymentAmount) {
      showError('Veuillez entrer un montant valide');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showError('Montant invalide');
      return;
    }

    if (amount > selectedClient.solde) {
      showError('Le montant ne peut pas dépasser le solde dû');
      return;
    }

    try {
      await api.post(`/admin/client/${selectedClient.id}/payment`, { amount });
      showSuccess('Paiement enregistré avec succès');
      handleClosePaymentDialog();
      fetchDebtClients(page, rowsPerPage, searchQuery);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de l\'enregistrement du paiement');
    }
  };

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
      year: 'numeric'
    });
  };

  const getUrgencyChip = (days: number) => {
    if (days > 45) {
      return <Chip label="Très urgent" color="error" size="small" icon={<WarningIcon />} />;
    } else if (days > 30) {
      return <Chip label="Urgent" color="warning" size="small" />;
    }
    return <Chip label="À suivre" color="info" size="small" />;
  };

  const handleExport = () => {
    showSuccess('Export des clients débiteurs lancé');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Clients Débiteurs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount} client{totalCount > 1 ? 's' : ''} avec des dettes en cours
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
            Exporter
          </Button>
        </Box>
      </Box>

      {/* Total Debt Alert */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            <strong>Dette totale en cours:</strong>
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
            {formatCurrency(totalDebt)}
          </Typography>
        </Box>
      </Alert>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom, prénom, téléphone ou email (min. 2 caractères)..."
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
        ) : clients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucun client débiteur</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Essayez une autre recherche' : 'Tous les clients sont à jour'}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell align="right">Solde Dû</TableCell>
                  <TableCell align="center">Factures</TableCell>
                  <TableCell>Dernier Paiement</TableCell>
                  <TableCell>Urgence</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                          {client.prenom.charAt(0)}{client.nom.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {client.prenom} {client.nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {client.numero}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{client.telephone}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{client.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2">{client.groupName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {formatCurrency(client.solde)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={client.invoiceCount} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(client.lastPayment)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Il y a {client.daysSinceLastPayment} jours
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getUrgencyChip(client.daysSinceLastPayment)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Enregistrer un paiement">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenPaymentDialog(client)}
                        >
                          <PaymentIcon />
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

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enregistrer un paiement</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>{selectedClient.prenom} {selectedClient.nom}</strong>
                </Typography>
                <Typography variant="body2">
                  Solde dû: <strong>{formatCurrency(selectedClient.solde)}</strong>
                </Typography>
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Montant du paiement"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">XAF</InputAdornment>,
                    }}
                    helperText={`Maximum: ${formatCurrency(selectedClient.solde)}`}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleRecordPayment}>
            Enregistrer le paiement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientDebts;
