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
  CircularProgress,
  TablePagination,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountBalance as AccountBalanceIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Closure {
  id: number;
  date: string;
  posName: string;
  groupName: string;
  openingBalance: number;
  sales: number;
  expenses: number;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  status: 'validated' | 'pending' | 'discrepancy';
  closedBy: string;
  closedAt: string;
  transactionCount: number;
}

interface ClosureStats {
  totalSales: number;
  totalExpenses: number;
  totalDiscrepancies: number;
  pendingClosures: number;
}

interface PaginatedResponse {
  data: Closure[];
  stats: ClosureStats;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const DailyClosures: React.FC = () => {
  const navigate = useNavigate();
  const [closures, setClosures] = useState<Closure[]>([]);
  const [stats, setStats] = useState<ClosureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClosure, setSelectedClosure] = useState<Closure | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dateFilter, setDateFilter] = useState('');
  const { showSuccess, showError } = useSnackbar();

  const fetchClosures = async (currentPage: number, limit: number, date?: string) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/admin/operations/closures', {
        params: { page: currentPage + 1, limit, date }
      });
      setClosures(response.data.data);
      setStats(response.data.stats);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des clôtures');
      // Mock data for development
      const mockClosures: Closure[] = [
        { 
          id: 1, 
          date: '2026-02-01', 
          posName: 'Point Vente Yaoundé', 
          groupName: 'Tech Solutions Sarl', 
          openingBalance: 500000, 
          sales: 2850000, 
          expenses: 125000, 
          expectedBalance: 3225000, 
          actualBalance: 3225000, 
          difference: 0, 
          status: 'validated', 
          closedBy: 'Marie Dupont', 
          closedAt: '2026-02-01 20:30:00',
          transactionCount: 47
        },
        { 
          id: 2, 
          date: '2026-02-01', 
          posName: 'Point Vente Douala', 
          groupName: 'Commerce Plus', 
          openingBalance: 750000, 
          sales: 3200000, 
          expenses: 180000, 
          expectedBalance: 3770000, 
          actualBalance: 3755000, 
          difference: -15000, 
          status: 'discrepancy', 
          closedBy: 'Jean Kamga', 
          closedAt: '2026-02-01 21:15:00',
          transactionCount: 62
        },
        { 
          id: 3, 
          date: '2026-01-31', 
          posName: 'Point Vente Yaoundé', 
          groupName: 'Tech Solutions Sarl', 
          openingBalance: 480000, 
          sales: 2950000, 
          expenses: 140000, 
          expectedBalance: 3290000, 
          actualBalance: 3290000, 
          difference: 0, 
          status: 'validated', 
          closedBy: 'Marie Dupont', 
          closedAt: '2026-01-31 20:45:00',
          transactionCount: 51
        },
        { 
          id: 4, 
          date: '2026-01-31', 
          posName: 'Point Vente Bafoussam', 
          groupName: 'Digital Wave', 
          openingBalance: 320000, 
          sales: 1850000, 
          expenses: 95000, 
          expectedBalance: 2075000, 
          actualBalance: 2080000, 
          difference: 5000, 
          status: 'discrepancy', 
          closedBy: 'Paul Nkoa', 
          closedAt: '2026-01-31 19:50:00',
          transactionCount: 38
        },
        { 
          id: 5, 
          date: '2026-01-30', 
          posName: 'Point Vente Douala', 
          groupName: 'Commerce Plus', 
          openingBalance: 680000, 
          sales: 3450000, 
          expenses: 165000, 
          expectedBalance: 3965000, 
          actualBalance: 3965000, 
          difference: 0, 
          status: 'validated', 
          closedBy: 'Jean Kamga', 
          closedAt: '2026-01-30 20:20:00',
          transactionCount: 58
        }
      ];
      
      setClosures(mockClosures);
      setStats({
        totalSales: mockClosures.reduce((sum, c) => sum + c.sales, 0),
        totalExpenses: mockClosures.reduce((sum, c) => sum + c.expenses, 0),
        totalDiscrepancies: Math.abs(mockClosures.reduce((sum, c) => sum + c.difference, 0)),
        pendingClosures: mockClosures.filter(c => c.status === 'pending').length
      });
      setTotalCount(mockClosures.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosures(page, rowsPerPage, dateFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, dateFilter]);

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
      month: 'long',
      year: 'numeric'
    });
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

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'validated':
        return <Chip label="Validée" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'pending':
        return <Chip label="En attente" color="warning" size="small" />;
      case 'discrepancy':
        return <Chip label="Écart" color="error" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleViewDetails = (closure: Closure) => {
    setSelectedClosure(closure);
    setDetailsOpen(true);
  };

  const handleValidate = async (closureId: number) => {
    try {
      await api.post(`/admin/operations/closures/${closureId}/validate`);
      showSuccess('Clôture validée avec succès');
      fetchClosures(page, rowsPerPage, dateFilter);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de la validation');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Clôtures Journalières
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Suivi des clôtures de caisse quotidiennes
          </Typography>
        </Box>
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
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.totalSales)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Ventes Totales</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShoppingCartIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.totalExpenses)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Dépenses Totales</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CancelIcon color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.totalDiscrepancies)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Écarts Totaux</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventAvailableIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.pendingClosures}</Typography>
                    <Typography variant="body2" color="text.secondary">En Attente</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          label="Filtrer par date"
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(0);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 250 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : closures.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucune clôture trouvée</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Point de Vente</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell align="right">Ventes</TableCell>
                  <TableCell align="right">Dépenses</TableCell>
                  <TableCell align="right">Attendu</TableCell>
                  <TableCell align="right">Réel</TableCell>
                  <TableCell align="right">Écart</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {closures.map((closure) => (
                  <TableRow key={closure.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(closure.date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StoreIcon fontSize="small" color="action" />
                        <Typography variant="body2">{closure.posName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{closure.groupName}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {formatCurrency(closure.sales)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'error.main' }}>
                        {formatCurrency(closure.expenses)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(closure.expectedBalance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(closure.actualBalance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700,
                          color: closure.difference === 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {closure.difference > 0 ? '+' : ''}{formatCurrency(closure.difference)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(closure.status)}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(closure)}
                      >
                        Détails
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
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la Clôture</DialogTitle>
        <DialogContent>
          {selectedClosure && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {formatDate(selectedClosure.date)}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Point de Vente</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {selectedClosure.posName}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Entreprise</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {selectedClosure.groupName}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Clôturée par</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {selectedClosure.closedBy}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Heure de clôture</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDateTime(selectedClosure.closedAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Résumé Financier
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Solde d'ouverture:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedClosure.openingBalance)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'success.main' }}>Ventes:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        +{formatCurrency(selectedClosure.sales)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'error.main' }}>Dépenses:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        -{formatCurrency(selectedClosure.expenses)}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Solde attendu:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatCurrency(selectedClosure.expectedBalance)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Solde réel:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatCurrency(selectedClosure.actualBalance)}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Écart:</Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700,
                          color: selectedClosure.difference === 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {selectedClosure.difference > 0 ? '+' : ''}{formatCurrency(selectedClosure.difference)}
                      </Typography>
                    </Box>
                  </Paper>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Nombre de transactions</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedClosure.transactionCount}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                    <Box sx={{ mt: 1 }}>
                      {getStatusChip(selectedClosure.status)}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedClosure?.status === 'discrepancy' && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                handleValidate(selectedClosure.id);
                setDetailsOpen(false);
              }}
            >
              Valider Malgré l'Écart
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyClosures;
