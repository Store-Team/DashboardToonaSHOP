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
  Button,
  Chip,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface User {
  id: number;
  numero: string;
  nom: string;
  prenom: string;
  roles: string[];
  is_enable: boolean;
  point_of_sale?: { id: number; name: string };
  entrepot?: { id: number; name: string };
}

interface PaginatedResponse {
  data: User[];
  total: number;
  page: number;
  totalPages: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    numero: '',
    password: '',
    nom: '',
    prenom: '',
    roles: 'ROLE_USER' as string,
    isEnable: true,
    warehouse_id: '',
    point_of_sale_id: ''
  });
  const { showSuccess, showError } = useSnackbar();

  const fetchUsers = async (currentPage: number, limit: number) => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>('/user/list', {
        params: { page: currentPage + 1, limit }
      });
      setUsers(response.data.data);
      setTotalCount(response.data.total);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement');
      // Mock data
      const mockData: User[] = [
        {
          id: 1,
          numero: '0812345678',
          nom: 'Kibasonga',
          prenom: 'Merdi',
          roles: ['ROLE_USER'],
          is_enable: true,
          point_of_sale: { id: 3, name: 'Bar Principal' }
        },
        {
          id: 2,
          numero: '0823456789',
          nom: 'Tshimanga',
          prenom: 'Marie',
          roles: ['ROLE_MANAGER'],
          is_enable: true,
          entrepot: { id: 2, name: 'Entrepôt Central' }
        },
        {
          id: 3,
          numero: '0834567890',
          nom: 'Kabongo',
          prenom: 'Paul',
          roles: ['ROLE_USER'],
          is_enable: false,
          point_of_sale: { id: 1, name: 'Point de Vente Nord' }
        }
      ];
      setUsers(mockData);
      setTotalCount(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditMode(true);
      setSelectedUser(user);
      setFormData({
        numero: user.numero,
        password: '',
        nom: user.nom,
        prenom: user.prenom,
        roles: user.roles[0] || 'ROLE_USER',
        isEnable: user.is_enable,
        warehouse_id: user.entrepot?.id.toString() || '',
        point_of_sale_id: user.point_of_sale?.id.toString() || ''
      });
    } else {
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        numero: '',
        password: '',
        nom: '',
        prenom: '',
        roles: 'ROLE_USER',
        isEnable: true,
        warehouse_id: '',
        point_of_sale_id: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    if (!formData.numero || !formData.nom || !formData.prenom) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!editMode && !formData.password) {
      showError('Le mot de passe est requis pour créer un utilisateur');
      return;
    }

    try {
      const payload = {
        numero: formData.numero,
        ...(formData.password && { password: formData.password }),
        nom: formData.nom,
        prenom: formData.prenom,
        roles: [formData.roles],
        ...(editMode && { isEnable: formData.isEnable }),
        ...(formData.warehouse_id && { warehouse_id: parseInt(formData.warehouse_id) }),
        ...(formData.point_of_sale_id && { point_of_sale_id: parseInt(formData.point_of_sale_id) })
      };

      if (editMode && selectedUser) {
        await api.put(`/user/update/${selectedUser.id}`, payload);
        showSuccess('Utilisateur modifié avec succès');
      } else {
        await api.post('/user/create-in-group', payload);
        showSuccess('Utilisateur créé avec succès');
      }
      handleCloseDialog();
      fetchUsers(page, rowsPerPage);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_USER': return 'Utilisateur';
      case 'ROLE_MANAGER': return 'Gestionnaire';
      case 'ROLE_ADMIN': return 'Administrateur';
      default: return role;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Utilisateurs du groupe connecté
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nouvel Utilisateur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aucun utilisateur
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom & Prénom</TableCell>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Affectation</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: 'action.disabled', opacity: 0.3 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.nom} {user.prenom}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.numero}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleLabel(user.roles[0])} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.point_of_sale 
                          ? `PdV: ${user.point_of_sale.name}`
                          : user.entrepot
                          ? `Entrepôt: ${user.entrepot.name}`
                          : 'Non affecté'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_enable ? 'Actif' : 'Désactivé'} 
                        size="small" 
                        color={user.is_enable ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
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
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </TableContainer>

      {/* Dialog Create/Edit User */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom *"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom *"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Numéro *"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                disabled={editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={formData.roles}
                  label="Rôle"
                  onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                >
                  <MenuItem value="ROLE_USER">Utilisateur</MenuItem>
                  <MenuItem value="ROLE_MANAGER">Gestionnaire</MenuItem>
                  <MenuItem value="ROLE_ADMIN">Administrateur</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {editMode && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={formData.isEnable ? 'active' : 'inactive'}
                    label="Statut"
                    onChange={(e) => setFormData({ ...formData, isEnable: e.target.value === 'active' })}
                  >
                    <MenuItem value="active">Actif</MenuItem>
                    <MenuItem value="inactive">Désactivé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Entrepôt (optionnel)"
                type="number"
                value={formData.warehouse_id}
                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value, point_of_sale_id: '' })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Point de Vente (optionnel)"
                type="number"
                value={formData.point_of_sale_id}
                onChange={(e) => setFormData({ ...formData, point_of_sale_id: e.target.value, warehouse_id: '' })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {editMode ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
