
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
  // Fix: Added missing ListItemIcon import
  ListItemIcon
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Group {
  id: string;
  name: string;
  nrccm: string;
  userCount: number;
  status: 'active' | 'inactive' | 'trial';
  expiryDate: string;
}

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/admin/groups');
        setGroups(response.data);
      } catch (err) {
        // Mock data
        setGroups([
          { id: '1', name: 'Global Tech Sarl', nrccm: 'RC/DLA/2023/B/123', userCount: 45, status: 'active', expiryDate: '2024-12-31' },
          { id: '2', name: 'Agro Invest Group', nrccm: 'RC/YDE/2022/B/556', userCount: 12, status: 'trial', expiryDate: '2023-11-15' },
          { id: '3', name: 'Logistics Pro', nrccm: 'RC/LBE/2021/A/998', userCount: 8, status: 'inactive', expiryDate: '2023-05-20' },
          { id: '4', name: 'Blue Sky Soft', nrccm: 'RC/DLA/2023/B/777', userCount: 150, status: 'active', expiryDate: '2025-06-30' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedGroup) return;
    try {
      await api.post(`/admin/group/${selectedGroup}/active`);
      showSuccess('Le statut du groupe a été mis à jour.');
      handleMenuClose();
    } catch (err) {
      showError('Erreur lors de la mise à jour.');
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.nrccm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusChip = (status: Group['status']) => {
    const configs = {
      active: { label: 'Active', color: 'success' as const },
      inactive: { label: 'Inactive', color: 'error' as const },
      trial: { label: 'Trial', color: 'warning' as const },
    };
    return <Chip label={configs[status].label} color={configs[status].color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Gestion des Entreprises
        </Typography>
        <Button variant="contained" startIcon={<FilterIcon />}>
          Filtrer
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom, NRCCM..."
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
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>NRCCM</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Users</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{group.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{group.nrccm}</Typography>
                  </TableCell>
                  <TableCell align="center">{group.userCount}</TableCell>
                  <TableCell>{getStatusChip(group.status)}</TableCell>
                  <TableCell>{group.expiryDate}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, group.id)}>
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          Détails
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
          Désactiver / Activer
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
