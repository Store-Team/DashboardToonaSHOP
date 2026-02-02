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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as PaidIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Invoice {
  id: number;
  numero: string;
  groupName: string;
  clientName: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  issueDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface PaginatedResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const InvoiceManagement: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid' | 'cancelled'>('all');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchInvoices = async (currentPage: number, limit: number, search?: string, status?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/invoices/search', {
          params: { q: search, page: currentPage + 1, limit, status: status !== 'all' ? status : undefined }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/invoices', {
          params: { page: currentPage + 1, limit, status: status !== 'all' ? status : undefined }
        });
      }
      setInvoices(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des factures');
      // Mock data for development
      const mockInvoices: Invoice[] = [
        { 
          id: 1, 
          numero: 'INV-2026-001', 
          groupName: 'Tech Solutions Sarl', 
          clientName: 'Paul Nguema', 
          amount: 450000, 
          paidAmount: 450000, 
          status: 'paid', 
          issueDate: '2026-01-15 10:00:00', 
          dueDate: '2026-02-15 23:59:59',
          items: [
            { description: 'Produit A', quantity: 10, unitPrice: 25000, total: 250000 },
            { description: 'Produit B', quantity: 5, unitPrice: 40000, total: 200000 }
          ]
        },
        { 
          id: 2, 
          numero: 'INV-2026-002', 
          groupName: 'Commerce Plus', 
          clientName: 'Marie Kamga', 
          amount: 320000, 
          paidAmount: 150000, 
          status: 'partial', 
          issueDate: '2026-01-18 14:30:00', 
          dueDate: '2026-02-18 23:59:59',
          items: [
            { description: 'Service X', quantity: 1, unitPrice: 320000, total: 320000 }
          ]
        },
        { 
          id: 3, 
          numero: 'INV-2026-003', 
          groupName: 'AgriPro Group', 
          clientName: 'Jean Mbida', 
          amount: 580000, 
          paidAmount: 0, 
          status: 'unpaid', 
          issueDate: '2026-01-20 09:15:00', 
          dueDate: '2026-02-20 23:59:59',
          items: [
            { description: 'Équipement Y', quantity: 3, unitPrice: 120000, total: 360000 },
            { description: 'Installation', quantity: 1, unitPrice: 220000, total: 220000 }
          ]
        },
        { 
          id: 4, 
          numero: 'INV-2026-004', 
          groupName: 'Digital Wave', 
          clientName: 'Alice Fotso', 
          amount: 190000, 
          paidAmount: 0, 
          status: 'cancelled', 
          issueDate: '2026-01-10 11:00:00', 
          dueDate: '2026-02-10 23:59:59',
          items: [
            { description: 'Consultation', quantity: 2, unitPrice: 95000, total: 190000 }
          ]
        },
        { 
          id: 5, 
          numero: 'INV-2026-005', 
          groupName: 'Tech Solutions Sarl', 
          clientName: 'Robert Tagne', 
          amount: 725000, 
          paidAmount: 725000, 
          status: 'paid', 
          issueDate: '2026-01-22 16:45:00', 
          dueDate: '2026-02-22 23:59:59',
          items: [
            { description: 'Produit Premium', quantity: 5, unitPrice: 145000, total: 725000 }
          ]
        }
      ];
      
      let filteredInvoices = mockInvoices;
      if (status !== 'all') {
        filteredInvoices = mockInvoices.filter(i => i.status === status);
      }
      
      setInvoices(filteredInvoices);
      setTotalCount(filteredInvoices.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(page, rowsPerPage, searchQuery, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, statusFilter]);

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

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handlePrint = (invoiceId: number) => {
    showSuccess(`Impression de la facture #${invoiceId}`);
  };

  const handleDownload = (invoiceId: number) => {
    showSuccess(`Téléchargement de la facture #${invoiceId}`);
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

  const getStatusChip = (status: string) => {
    const configs: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactElement }> = {
      paid: { label: 'Payée', color: 'success', icon: <PaidIcon /> },
      partial: { label: 'Partielle', color: 'warning', icon: <WarningIcon /> },
      unpaid: { label: 'Impayée', color: 'error', icon: <WarningIcon /> },
      cancelled: { label: 'Annulée', color: 'default', icon: <CancelIcon /> }
    };
    const config = configs[status] || { label: status, color: 'default' as const, icon: <WarningIcon /> };
    return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
  };

  const handleExport = () => {
    showSuccess('Export des factures lancé');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Factures
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount} facture{totalCount > 1 ? 's' : ''} enregistrée{totalCount > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
            Exporter
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par numéro, entreprise ou client (min. 2 caractères)..."
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="paid">Payées</MenuItem>
              <MenuItem value="partial">Partielles</MenuItem>
              <MenuItem value="unpaid">Impayées</MenuItem>
              <MenuItem value="cancelled">Annulées</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucune facture trouvée</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Essayez une autre recherche' : 'Aucune facture enregistrée pour le moment'}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  <TableCell align="right">Payé</TableCell>
                  <TableCell>Date Émission</TableCell>
                  <TableCell>Date Échéance</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {invoice.numero}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{invoice.groupName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{invoice.clientName}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(invoice.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: invoice.paidAmount === invoice.amount ? 'success.main' : 
                                 invoice.paidAmount > 0 ? 'warning.main' : 'error.main'
                        }}
                      >
                        {formatCurrency(invoice.paidAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(invoice.issueDate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(invoice.dueDate)}</Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Voir détails">
                          <IconButton size="small" onClick={() => handleViewDetails(invoice)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimer">
                          <IconButton size="small" onClick={() => handlePrint(invoice.id)}>
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger">
                          <IconButton size="small" onClick={() => handleDownload(invoice.id)}>
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
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

      {/* Invoice Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la Facture</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Numéro</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedInvoice.numero}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Statut</Typography>
                  <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedInvoice.status)}</Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Entreprise</Typography>
                  <Typography variant="body1">{selectedInvoice.groupName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Client</Typography>
                  <Typography variant="body1">{selectedInvoice.clientName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Date d'émission</Typography>
                  <Typography variant="body1">{formatDate(selectedInvoice.issueDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Date d'échéance</Typography>
                  <Typography variant="body1">{formatDate(selectedInvoice.dueDate)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Articles
              </Typography>
              <List disablePadding>
                {selectedInvoice.items.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={item.description}
                      secondary={`${item.quantity} × ${formatCurrency(item.unitPrice)}`}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.total)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Montant Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatCurrency(selectedInvoice.amount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Montant Payé</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {formatCurrency(selectedInvoice.paidAmount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Reste à Payer</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {formatCurrency(selectedInvoice.amount - selectedInvoice.paidAmount)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fermer</Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>Imprimer</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>Télécharger</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceManagement;
