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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface InactiveClient {
  id: number;
  numero: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  groupName: string;
  totalAchats: number;
  lastActivity: string;
  daysSinceLastActivity: number;
  lastPurchaseAmount: number;
}

interface PaginatedResponse {
  data: InactiveClient[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const InactiveClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<InactiveClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState<number>(30);
  const { showSuccess, showError } = useSnackbar();

  const fetchInactiveClients = async (currentPage: number, limit: number, search?: string, days?: number) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/clients/inactive/search', {
          params: { q: search, page: currentPage + 1, limit, days }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/clients/inactive', {
          params: { page: currentPage + 1, limit, days }
        });
      }
      setClients(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des clients inactifs');
      // Mock data for development
      const mockInactiveClients: InactiveClient[] = [
        { id: 4, numero: 'CLI004', nom: 'Fotso', prenom: 'Alice', telephone: '+237644332211', email: 'alice.fotso@example.com', groupName: 'AgriPro Group', totalAchats: 3200000, lastActivity: '2025-12-20 09:00:00', daysSinceLastActivity: 44, lastPurchaseAmount: 250000 },
        { id: 7, numero: 'CLI007', nom: 'Essomba', prenom: 'Pierre', telephone: '+237611009988', email: 'pierre.essomba@example.com', groupName: 'Digital Wave', totalAchats: 1200000, lastActivity: '2025-11-15 15:30:00', daysSinceLastActivity: 79, lastPurchaseAmount: 180000 },
        { id: 10, numero: 'CLI010', nom: 'Biya', prenom: 'Laurent', telephone: '+237655998877', email: 'laurent.biya@example.com', groupName: 'Digital Wave', totalAchats: 1800000, lastActivity: '2025-11-30 11:20:00', daysSinceLastActivity: 64, lastPurchaseAmount: 320000 },
        { id: 12, numero: 'CLI012', nom: 'Onana', prenom: 'Christine', telephone: '+237688776655', email: 'christine.onana@example.com', groupName: 'Commerce Plus', totalAchats: 980000, lastActivity: '2025-10-15 14:00:00', daysSinceLastActivity: 110, lastPurchaseAmount: 95000 },
        { id: 15, numero: 'CLI015', nom: 'Tchuente', prenom: 'David', telephone: '+237677665544', email: 'david.tchuente@example.com', groupName: 'Tech Solutions Sarl', totalAchats: 2500000, lastActivity: '2025-12-01 10:30:00', daysSinceLastActivity: 63, lastPurchaseAmount: 420000 }
      ];
      
      const filteredClients = mockInactiveClients.filter(c => c.daysSinceLastActivity >= days);
      setClients(filteredClients);
      setTotalCount(filteredClients.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveClients(page, rowsPerPage, searchQuery, inactiveDaysFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, inactiveDaysFilter]);

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

  const handleSendReminder = async (clientId: number) => {
    try {
      await api.post(`/admin/client/${clientId}/reminder`);
      showSuccess('Rappel envoyé avec succès');
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de l\'envoi du rappel');
    }
  };

  const handleDeactivate = async (clientId: number) => {
    try {
      await api.post(`/admin/client/${clientId}/deactivate`);
      showSuccess('Client désactivé avec succès');
      fetchInactiveClients(page, rowsPerPage, searchQuery, inactiveDaysFilter);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de la désactivation');
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

  const getInactivityChip = (days: number) => {
    if (days > 90) {
      return <Chip label={`${days} jours`} color="error" size="small" />;
    } else if (days > 60) {
      return <Chip label={`${days} jours`} color="warning" size="small" />;
    }
    return <Chip label={`${days} jours`} color="default" size="small" />;
  };

  const handleExport = () => {
    showSuccess('Export des clients inactifs lancé');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Clients Inactifs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount} client{totalCount > 1 ? 's' : ''} inactif{totalCount > 1 ? 's' : ''}
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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Inactif depuis</InputLabel>
            <Select
              value={inactiveDaysFilter}
              label="Inactif depuis"
              onChange={(e) => {
                setInactiveDaysFilter(e.target.value as number);
                setPage(0);
              }}
            >
              <MenuItem value={30}>30 jours</MenuItem>
              <MenuItem value={60}>60 jours</MenuItem>
              <MenuItem value={90}>90 jours</MenuItem>
              <MenuItem value={180}>180 jours</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : clients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucun client inactif</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Essayez une autre recherche' : 'Tous les clients sont actifs'}
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
                  <TableCell align="right">Total Achats</TableCell>
                  <TableCell align="right">Dernier Achat</TableCell>
                  <TableCell>Dernière Activité</TableCell>
                  <TableCell align="center">Inactivité</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'grey.400', color: 'white' }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(client.totalAchats)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(client.lastPurchaseAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(client.lastActivity)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getInactivityChip(client.daysSinceLastActivity)}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Envoyer un rappel">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleSendReminder(client.id)}
                          >
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Désactiver">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeactivate(client.id)}
                          >
                            <BlockIcon />
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
    </Box>
  );
};

export default InactiveClients;
