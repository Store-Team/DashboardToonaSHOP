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
  InputAdornment,
  CircularProgress,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  ElectricalServices as ElectricalServicesIcon,
  Build as BuildIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  posName: string;
  groupName: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money';
  receipt: string | null;
  approvedBy: string;
  createdAt: string;
}

interface ExpenseStats {
  totalExpenses: number;
  thisMonth: number;
  lastMonth: number;
  avgPerDay: number;
}

interface PaginatedResponse {
  data: Expense[];
  stats: ExpenseStats;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'mobile_money'
  });
  const { showSuccess, showError } = useSnackbar();

  const categories = [
    'Transport',
    'Électricité',
    'Eau',
    'Maintenance',
    'Fournitures',
    'Salaires',
    'Loyer',
    'Télécommunication',
    'Marketing',
    'Autre'
  ];

  const fetchExpenses = async (currentPage: number, limit: number, search?: string, category?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/operations/expenses/search', {
          params: { q: search, page: currentPage + 1, limit, category: category !== 'all' ? category : undefined }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/operations/expenses', {
          params: { page: currentPage + 1, limit, category: category !== 'all' ? category : undefined }
        });
      }
      setExpenses(response.data.data);
      setStats(response.data.stats);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des dépenses');
      // Mock data for development
      const mockExpenses: Expense[] = [
        { id: 1, date: '2026-02-01', category: 'Électricité', description: 'Facture ENEO - Janvier 2026', amount: 85000, posName: 'Point Vente Yaoundé', groupName: 'Tech Solutions Sarl', paymentMethod: 'bank_transfer', receipt: 'REC-2026-001', approvedBy: 'Marie Dupont', createdAt: '2026-02-01 10:30:00' },
        { id: 2, date: '2026-02-01', category: 'Transport', description: 'Livraison marchandises', amount: 45000, posName: 'Point Vente Douala', groupName: 'Commerce Plus', paymentMethod: 'cash', receipt: null, approvedBy: 'Jean Kamga', createdAt: '2026-02-01 14:15:00' },
        { id: 3, date: '2026-01-31', category: 'Fournitures', description: 'Achat papeterie et fournitures bureau', amount: 32000, posName: 'Point Vente Yaoundé', groupName: 'Tech Solutions Sarl', paymentMethod: 'mobile_money', receipt: 'REC-2026-002', approvedBy: 'Marie Dupont', createdAt: '2026-01-31 16:45:00' },
        { id: 4, date: '2026-01-30', category: 'Maintenance', description: 'Réparation système de climatisation', amount: 125000, posName: 'Point Vente Bafoussam', groupName: 'Digital Wave', paymentMethod: 'bank_transfer', receipt: 'REC-2026-003', approvedBy: 'Paul Nkoa', createdAt: '2026-01-30 09:20:00' },
        { id: 5, date: '2026-01-29', category: 'Télécommunication', description: 'Abonnement internet - Janvier', amount: 55000, posName: 'Point Vente Douala', groupName: 'Commerce Plus', paymentMethod: 'bank_transfer', receipt: 'REC-2026-004', approvedBy: 'Jean Kamga', createdAt: '2026-01-29 11:00:00' },
        { id: 6, date: '2026-01-28', category: 'Eau', description: 'Facture CDE - Janvier 2026', amount: 18000, posName: 'Point Vente Yaoundé', groupName: 'Tech Solutions Sarl', paymentMethod: 'cash', receipt: null, approvedBy: 'Marie Dupont', createdAt: '2026-01-28 15:30:00' },
        { id: 7, date: '2026-01-27', category: 'Marketing', description: 'Campagne publicitaire réseaux sociaux', amount: 150000, posName: 'Siège', groupName: 'ToonaShop Global', paymentMethod: 'bank_transfer', receipt: 'REC-2026-005', approvedBy: 'Admin', createdAt: '2026-01-27 13:45:00' }
      ];
      
      setExpenses(mockExpenses);
      setStats({
        totalExpenses: mockExpenses.reduce((sum, e) => sum + e.amount, 0),
        thisMonth: mockExpenses.filter(e => new Date(e.date).getMonth() === 1).reduce((sum, e) => sum + e.amount, 0),
        lastMonth: 0,
        avgPerDay: mockExpenses.reduce((sum, e) => sum + e.amount, 0) / 7
      });
      setTotalCount(mockExpenses.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(page, rowsPerPage, searchQuery, categoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, categoryFilter]);

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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'bank_transfer': return 'Virement';
      case 'mobile_money': return 'Mobile Money';
      default: return method;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Transport': return <LocalShippingIcon fontSize="small" />;
      case 'Électricité': return <ElectricalServicesIcon fontSize="small" />;
      case 'Maintenance': return <BuildIcon fontSize="small" />;
      default: return <ReceiptIcon fontSize="small" />;
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/admin/operations/expenses', {
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      });
      showSuccess('Dépense ajoutée avec succès');
      setAddDialogOpen(false);
      setNewExpense({ category: '', description: '', amount: '', paymentMethod: 'cash' });
      fetchExpenses(page, rowsPerPage, searchQuery, categoryFilter);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de l\'ajout de la dépense');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dépenses
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestion des dépenses opérationnelles
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
          Nouvelle Dépense
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AttachMoneyIcon color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.totalExpenses)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Dépenses</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.thisMonth)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Ce Mois</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'warning.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: 'warning.main', fontWeight: 700 }}>📊</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {formatCurrency(stats.avgPerDay)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Moy. / Jour</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'success.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: 'success.main', fontWeight: 700 }}>{expenses.length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{expenses.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Transactions</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par description (min. 2 caractères)..."
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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={categoryFilter}
              label="Catégorie"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Toutes les catégories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : expenses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucune dépense trouvée</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Point de Vente</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  <TableCell>Mode Paiement</TableCell>
                  <TableCell>Approuvé par</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(expense.date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCategoryIcon(expense.category)}
                        <Chip label={expense.category} size="small" variant="outlined" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{expense.description}</Typography>
                      {expense.receipt && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Reçu: {expense.receipt}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{expense.posName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{expense.groupName}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getPaymentMethodLabel(expense.paymentMethod)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{expense.approvedBy}</Typography>
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

      {/* Add Expense Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Dépense</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Catégorie *</InputLabel>
              <Select
                value={newExpense.category}
                label="Catégorie *"
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={3}
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />

            <TextField
              fullWidth
              label="Montant (XAF) *"
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Mode de Paiement</InputLabel>
              <Select
                value={newExpense.paymentMethod}
                label="Mode de Paiement"
                onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value as any })}
              >
                <MenuItem value="cash">Espèces</MenuItem>
                <MenuItem value="bank_transfer">Virement Bancaire</MenuItem>
                <MenuItem value="mobile_money">Mobile Money</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddExpense}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
