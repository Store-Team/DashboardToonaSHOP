
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
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Group {
  id: number;
  nomEntreprise: string;
  contact: string;
  email: string;
  nrccm: string;
  user_count: number;
  point_of_sale_count: number;
  warehouse_count: number;
  isPaid: boolean;
  subscriptionEnd: string;
}

interface PaginatedResponse {
  data: Group[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const GroupManagement: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const { showSuccess, showError } = useSnackbar();

  const fetchGroups = useCallback(async (currentPage: number, limit: number, search?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        // Utiliser l'endpoint de recherche
        response = await api.get<PaginatedResponse>('/admin/groups/search', {
          params: { q: search, page: currentPage + 1, limit }
        });
      } else {
        // Utiliser l'endpoint de liste normale
        response = await api.get<PaginatedResponse>('/admin/groups', {
          params: { page: currentPage + 1, limit }
        });
      }
      setGroups(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors du chargement des groupes');
      // Mock data for development
      const mockGroups: Group[] = [
        { id: 1, nomEntreprise: 'Tech Solutions Sarl', contact: '+237699887766', email: 'contact@techsolutions.cm', nrccm: 'RC/DLA/2023/B/12345', user_count: 15, point_of_sale_count: 3, warehouse_count: 2, isPaid: true, subscriptionEnd: '2026-06-30 23:59:59' },
        { id: 2, nomEntreprise: 'Commerce Plus', contact: '+237677554433', email: 'info@commerceplus.cm', nrccm: 'RC/DLA/2023/B/54321', user_count: 8, point_of_sale_count: 2, warehouse_count: 1, isPaid: true, subscriptionEnd: '2026-02-08 23:59:59' },
        { id: 3, nomEntreprise: 'AgriPro Group', contact: '+237655443322', email: 'contact@agripro.cm', nrccm: 'RC/DLA/2024/A/11111', user_count: 5, point_of_sale_count: 1, warehouse_count: 1, isPaid: false, subscriptionEnd: '2026-01-15 23:59:59' }
      ];
      setGroups(mockGroups);
      setTotalCount(mockGroups.length);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchGroups(page, rowsPerPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        setSearchQuery(searchTerm);
        setPage(0); // Reset to first page on new search
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchQuery]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, group: Group) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleViewDetails = () => {
    if (selectedGroup) {
      navigate(`/groups/${selectedGroup.id}`);
    }
    handleMenuClose();
  };

  const handleToggleStatus = async (activate: boolean) => {
    if (!selectedGroup) return;
    try {
      const endpoint = activate ? `/admin/group/${selectedGroup.id}/active` : `/admin/group/${selectedGroup.id}/disable`;
      await api.post(endpoint);
      showSuccess(`Groupe ${activate ? 'activé' : 'désactivé'} avec succès`);
      fetchGroups(page, rowsPerPage, searchQuery);
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

  const getStatusChip = (isPaid: boolean, subscriptionEnd: string) => {
    const endDate = new Date(subscriptionEnd);
    const today = new Date();
    const isExpired = endDate < today;

    if (!isPaid || isExpired) {
      return <Chip label="Inactif" color="error" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
    }
    
    // Check if expiring soon (within 7 days)
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) {
      return <Chip label="Expire bientôt" color="warning" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
    }

    return <Chip label="Actif" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Entreprises
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount} entreprise{totalCount > 1 ? 's' : ''} enregistrée{totalCount > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<FilterIcon />}>
          Filtrer
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom, email, contact ou NRCCM (min. 2 caractères)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : groups.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Aucune entreprise trouvée</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Nom de l'entreprise</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>NRCCM</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Utilisateurs</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">POS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Entrepôts</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Expiration</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{group.nomEntreprise}</Typography>
                      <Typography variant="caption" color="text.secondary">{group.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{group.contact}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{group.nrccm}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={group.user_count} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={group.point_of_sale_count} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={group.warehouse_count} size="small" />
                    </TableCell>
                    <TableCell>{getStatusChip(group.isPaid, group.subscriptionEnd)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(group.subscriptionEnd)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Actions">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, group)}>
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
        <MenuItem onClick={() => handleToggleStatus(false)}>
          <ListItemIcon><BlockIcon fontSize="small" color="error" /></ListItemIcon>
          Désactiver
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(true)}>
          <ListItemIcon><ActiveIcon fontSize="small" color="success" /></ListItemIcon>
          Activer
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><UpdateIcon fontSize="small" /></ListItemIcon>
          Étendre l'abonnement
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GroupManagement;
