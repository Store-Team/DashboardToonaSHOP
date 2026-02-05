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
  CircularProgress,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  PersonOff as PersonOffIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface ImfGroup {
  id: number;
  name: string;
  contact: string;
  email: string;
  address: string;
  approvedAt: string;
  activeClients: number;
  inactiveClients: number;
  planName?: string;
}

interface PaginatedResponse {
  data: ImfGroup[];
  total: number;
  page: number;
  totalPages: number;
}

interface Analytics {
  totalSales: number;
  totalRevenue: number;
  averageTransaction: number;
  topProducts: Array<{ name: string; quantity: number }>;
}

const ImfApprovedGroups: React.FC = () => {
  const [groups, setGroups] = useState<ImfGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ImfGroup | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const { showError } = useSnackbar();

  const fetchApprovedGroups = async (currentPage: number, limit: number) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/imf/admin/groups/approved', {
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
          name: 'IMF Gamma Microfinance',
          contact: '+243 900 000 003',
          email: 'contact@gammamicro.cd',
          address: 'Avenue Lukusa, Kinshasa',
          approvedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          activeClients: 45,
          inactiveClients: 12,
          planName: 'Plan Entreprise'
        },
        {
          id: 2,
          name: 'IMF Delta Finance',
          contact: '+243 900 000 004',
          email: 'info@deltafinance.cd',
          address: 'Boulevard Mobutu, Goma',
          approvedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
          activeClients: 78,
          inactiveClients: 23,
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
    fetchApprovedGroups(page, rowsPerPage);
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

  const handleViewAnalytics = async (group: ImfGroup) => {
    setSelectedGroup(group);
    try {
      const response = await api.get<Analytics>(`/imf/analytics/${group.id}`);
      setAnalytics(response.data);
    } catch (err: any) {
      // Mock analytics
      setAnalytics({
        totalSales: 245,
        totalRevenue: 12500000,
        averageTransaction: 51020,
        topProducts: [
          { name: 'Produit A', quantity: 120 },
          { name: 'Produit B', quantity: 85 },
          { name: 'Produit C', quantity: 40 }
        ]
      });
    }
    setAnalyticsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Groupes IMF Approuvés
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Suivi des IMF validées et leurs affiliations
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
              Aucun groupe approuvé
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom du Groupe</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell align="center">Clients Actifs</TableCell>
                  <TableCell align="center">Clients Inactifs</TableCell>
                  <TableCell>Date Validation</TableCell>
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
                      <Typography variant="caption" display="block" color="text.secondary">
                        {group.contact}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
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
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'action.disabled', opacity: 0.3 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {group.activeClients}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <PersonOffIcon sx={{ fontSize: 16, color: 'action.disabled', opacity: 0.3 }} />
                        <Typography variant="body2" color="text.secondary">
                          {group.inactiveClients}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(group.approvedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        onClick={() => handleViewAnalytics(group)}
                      >
                        Analytics
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

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onClose={() => setAnalyticsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Analytics - {selectedGroup?.name}</DialogTitle>
        <DialogContent>
          {analytics && (
            <Grid container spacing={3} sx={{ pt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">Total Ventes</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    {analytics.totalSales}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">Chiffre d'Affaires</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    {formatCurrency(analytics.totalRevenue)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">Transaction Moyenne</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    {formatCurrency(analytics.averageTransaction)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Top Produits
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Produit</TableCell>
                        <TableCell align="right">Quantité Vendue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.topProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {product.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImfApprovedGroups;
