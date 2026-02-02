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
  Menu,
  MenuItem,
  CircularProgress,
  ListItemIcon,
  TablePagination,
  Tooltip,
  Avatar,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Client {
  id: number;
  numero: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  groupName: string;
  totalAchats: number;
  solde: number;
  lastActivity: string;
  isActive: boolean;
}

interface PaginatedResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const ClientManagement: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { showSuccess, showError } = useSnackbar();

  const fetchClients = async (currentPage: number, limit: number, search?: string, status?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<PaginatedResponse>('/admin/clients/search', {
          params: { q: search, page: currentPage + 1, limit, status: status !== 'all' ? status : undefined }
        });
      } else {
        response = await api.get<PaginatedResponse>('/admin/clients', {
          params: { page: currentPage + 1, limit, status: status !== 'all' ? status : undefined }
        });
      }
      setClients(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des clients');
      // Mock data for development
      const mockClients: Client[] = [
        { id: 1, numero: 'CLI001', nom: 'Nguema', prenom: 'Paul', telephone: '+237699887766', email: 'paul.nguema@example.com', groupName: 'Tech Solutions Sarl', totalAchats: 4500000, solde: 0, lastActivity: '2026-02-01 14:30:00', isActive: true },
        { id: 2, numero: 'CLI002', nom: 'Kamga', prenom: 'Marie', telephone: '+237677554433', email: 'marie.kamga@example.com', groupName: 'Commerce Plus', totalAchats: 2300000, solde: 150000, lastActivity: '2026-01-28 10:15:00', isActive: true },
        { id: 3, numero: 'CLI003', nom: 'Mbida', prenom: 'Jean', telephone: '+237655443322', email: 'jean.mbida@example.com', groupName: 'Tech Solutions Sarl', totalAchats: 1800000, solde: 0, lastActivity: '2026-01-15 16:45:00', isActive: true },
        { id: 4, numero: 'CLI004', nom: 'Fotso', prenom: 'Alice', telephone: '+237644332211', email: 'alice.fotso@example.com', groupName: 'AgriPro Group', totalAchats: 3200000, solde: 450000, lastActivity: '2025-12-20 09:00:00', isActive: false },
        { id: 5, numero: 'CLI005', nom: 'Tagne', prenom: 'Robert', telephone: '+237633221100', email: 'robert.tagne@example.com', groupName: 'Commerce Plus', totalAchats: 890000, solde: 0, lastActivity: '2026-01-30 11:20:00', isActive: true },
        { id: 6, numero: 'CLI006', nom: 'Nkongo', prenom: 'Sophie', telephone: '+237622110099', email: 'sophie.nkongo@example.com', groupName: 'Tech Solutions Sarl', totalAchats: 5600000, solde: 320000, lastActivity: '2026-02-01 08:45:00', isActive: true },
        { id: 7, numero: 'CLI007', nom: 'Essomba', prenom: 'Pierre', telephone: '+237611009988', email: 'pierre.essomba@example.com', groupName: 'Digital Wave', totalAchats: 1200000, solde: 0, lastActivity: '2025-11-15 15:30:00', isActive: false },
        { id: 8, numero: 'CLI008', nom: 'Atangana', prenom: 'Grace', telephone: '+237600998877', email: 'grace.atangana@example.com', groupName: 'AgriPro Group', totalAchats: 4100000, solde: 180000, lastActivity: '2026-01-25 13:00:00', isActive: true }
      ];
      
      let filteredClients = mockClients;
      if (status === 'active') {
        filteredClients = mockClients.filter(c => c.isActive);
      } else if (status === 'inactive') {
        filteredClients = mockClients.filter(c => !c.isActive);
      }
      
      setClients(filteredClients);
      setTotalCount(filteredClients.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(page, rowsPerPage, searchQuery, statusFilter);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleViewDetails = () => {
    if (selectedClient) {
      navigate(`/clients/${selectedClient.id}`);
    }
    handleMenuClose();
  };

  const handleToggleStatus = async (activate: boolean) => {
    if (!selectedClient) return;
    try {
      const endpoint = activate ? `/admin/client/${selectedClient.id}/activate` : `/admin/client/${selectedClient.id}/deactivate`;
      await api.post(endpoint);
      showSuccess(`Client ${activate ? 'activé' : 'désactivé'} avec succès`);
      fetchClients(page, rowsPerPage, searchQuery, statusFilter);
      handleMenuClose();
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de la mise à jour du statut');
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

  const getStatusChip = (isActive: boolean) => {
    return isActive ? (
      <Chip label="Actif" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
    ) : (
      <Chip label="Inactif" color="error" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
    );
  };

  const getSoldeChip = (solde: number) => {
    if (solde === 0) {
      return <Chip label="À jour" color="success" size="small" />;
    } else if (solde > 0) {
      return <Chip label={`Débiteur`} color="error" size="small" />;
    }
    return null;
  };

  const handleExport = () => {
    showSuccess('Export des clients lancé');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Clients
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount} client{totalCount > 1 ? 's' : ''} enregistré{totalCount > 1 ? 's' : ''}
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                setPage(0);
              }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="active">Actifs</MenuItem>
              <MenuItem value="inactive">Inactifs</MenuItem>
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
            <Typography variant="h6" color="text.secondary">Aucun client trouvé</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Essayez une autre recherche' : 'Aucun client enregistré pour le moment'}
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
                  <TableCell align="right">Solde</TableCell>
                  <TableCell>Dernière Activité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: client.solde > 0 ? 'error.main' : 'success.main' }}>
                          {formatCurrency(client.solde)}
                        </Typography>
                        {getSoldeChip(client.solde)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(client.lastActivity)}</Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(client.isActive)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Actions">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, client)}>
                          <MoreIcon />
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          Voir les détails
        </MenuItem>
        {selectedClient?.isActive ? (
          <MenuItem onClick={() => handleToggleStatus(false)}>
            <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
            Désactiver
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleToggleStatus(true)}>
            <ListItemIcon><ActiveIcon fontSize="small" /></ListItemIcon>
            Activer
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ClientManagement;
