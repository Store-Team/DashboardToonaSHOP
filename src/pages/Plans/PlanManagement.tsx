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
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  monthlyPrice: number;
  semesterPrice: number;
  annualPrice: number;
  maxUsers: number;
  maxPointOfSales: number;
  maxWarehouses: number;
  maxLocations: number;
  features: string[];
}

interface PlanFormData {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  monthlyPrice: number;
  semesterPrice: number;
  annualPrice: number;
  maxUsers: number;
  maxPointOfSales: number;
  maxWarehouses: number;
  maxLocations: number;
  features: string[];
}

const initialFormData: PlanFormData = {
  code: '',
  name: '',
  description: '',
  isActive: true,
  monthlyPrice: 0,
  semesterPrice: 0,
  annualPrice: 0,
  maxUsers: 0,
  maxPointOfSales: 0,
  maxWarehouses: 0,
  maxLocations: 0,
  features: []
};

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [newFeature, setNewFeature] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterActive !== null ? { isActive: filterActive } : {};
      const response = await api.get<{ plans: Plan[] }>('/admin/plans', { params });
      setPlans(response.data.plans);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement des plans');
      // Mock data for development
      setPlans([
        {
          id: 1,
          code: 'basic',
          name: 'Basic',
          description: 'Plan de base pour petites entreprises',
          isActive: true,
          monthlyPrice: 15000,
          semesterPrice: 80000,
          annualPrice: 150000,
          maxUsers: 5,
          maxPointOfSales: 1,
          maxWarehouses: 1,
          maxLocations: 1,
          features: ['Gestion des ventes', 'Inventaire de base', 'Rapports basiques']
        },
        {
          id: 2,
          code: 'pro',
          name: 'Pro',
          description: 'Plan professionnel pour moyennes entreprises',
          isActive: true,
          monthlyPrice: 35000,
          semesterPrice: 180000,
          annualPrice: 350000,
          maxUsers: 20,
          maxPointOfSales: 5,
          maxWarehouses: 3,
          maxLocations: 5,
          features: ['Gestion des ventes', 'Inventaire avancé', 'Multi-points de vente', 'Rapports avancés', 'Support prioritaire']
        },
        {
          id: 3,
          code: 'enterprise',
          name: 'Enterprise',
          description: 'Plan entreprise avec toutes les fonctionnalités',
          isActive: true,
          monthlyPrice: 75000,
          semesterPrice: 400000,
          annualPrice: 750000,
          maxUsers: -1,
          maxPointOfSales: -1,
          maxWarehouses: -1,
          maxLocations: -1,
          features: ['Toutes les fonctionnalités Pro', 'Utilisateurs illimités', 'Points de vente illimités', 'API Access', 'Support 24/7', 'Formation personnalisée']
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterActive, showError]);

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterActive]);

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        code: plan.code,
        name: plan.name,
        description: plan.description,
        isActive: plan.isActive,
        monthlyPrice: plan.monthlyPrice,
        semesterPrice: plan.semesterPrice,
        annualPrice: plan.annualPrice,
        maxUsers: plan.maxUsers,
        maxPointOfSales: plan.maxPointOfSales,
        maxWarehouses: plan.maxWarehouses,
        maxLocations: plan.maxLocations,
        features: [...plan.features]
      });
    } else {
      setEditingPlan(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
    setFormData(initialFormData);
    setNewFeature('');
  };

  const handleSubmit = async () => {
    try {
      if (editingPlan) {
        await api.put(`/admin/plans/${editingPlan.id}`, formData);
        showSuccess('Plan mis à jour avec succès');
      } else {
        await api.post('/admin/plans', formData);
        showSuccess('Plan créé avec succès');
      }
      fetchPlans();
      handleCloseDialog();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la sauvegarde du plan');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await api.post(`/admin/plans/${id}/deactivate`);
      showSuccess('Plan désactivé avec succès');
      fetchPlans();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la désactivation');
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(price);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Plans Tarifaires
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {plans.length} plan{plans.length > 1 ? 's' : ''} disponible{plans.length > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterActive === true}
                onChange={(e) => setFilterActive(e.target.checked ? true : null)}
              />
            }
            label="Actifs uniquement"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Nouveau Plan
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : plans.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Aucun plan disponible</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prix Mensuel</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prix Semestriel</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prix Annuel</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Limites</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} hover>
                  <TableCell>
                    <Chip label={plan.code} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plan.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatPrice(plan.monthlyPrice)}</TableCell>
                  <TableCell>{formatPrice(plan.semesterPrice)}</TableCell>
                  <TableCell>{formatPrice(plan.annualPrice)}</TableCell>
                  <TableCell align="center">
                    <Box>
                      <Typography variant="caption" display="block">
                        👥 {plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers} users
                      </Typography>
                      <Typography variant="caption" display="block">
                        🏪 {plan.maxPointOfSales === -1 ? 'Illimité' : plan.maxPointOfSales} POS
                      </Typography>
                      <Typography variant="caption" display="block">
                        📦 {plan.maxWarehouses === -1 ? 'Illimité' : plan.maxWarehouses} entrepôts
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.isActive ? 'Actif' : 'Inactif'}
                      color={plan.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => handleOpenDialog(plan)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {plan.isActive && (
                      <Tooltip title="Désactiver">
                        <IconButton size="small" color="error" onClick={() => handleDeactivate(plan.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Dialog for Create/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ex: basic, pro, enterprise"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Plan Basic"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Tarification (XAF)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Prix Mensuel"
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Prix Semestriel"
                type="number"
                value={formData.semesterPrice}
                onChange={(e) => setFormData({ ...formData, semesterPrice: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Prix Annuel"
                type="number"
                value={formData.annualPrice}
                onChange={(e) => setFormData({ ...formData, annualPrice: Number(e.target.value) })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Limites (-1 pour illimité)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Utilisateurs"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Points de Vente"
                type="number"
                value={formData.maxPointOfSales}
                onChange={(e) => setFormData({ ...formData, maxPointOfSales: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Entrepôts"
                type="number"
                value={formData.maxWarehouses}
                onChange={(e) => setFormData({ ...formData, maxWarehouses: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Emplacements"
                type="number"
                value={formData.maxLocations}
                onChange={(e) => setFormData({ ...formData, maxLocations: Number(e.target.value) })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Fonctionnalités
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ajouter une fonctionnalité"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button variant="outlined" onClick={handleAddFeature}>
                  Ajouter
                </Button>
              </Box>
              <List dense>
                {formData.features.map((feature, index) => (
                  <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 0.5, borderRadius: 1 }}>
                    <ListItemText primary={feature} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" size="small" onClick={() => handleRemoveFeature(index)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Plan actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingPlan ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlanManagement;
