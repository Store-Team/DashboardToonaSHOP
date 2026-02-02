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
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface PromoCode {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUsageCount: number;
  usageCount: number;
  allowedPlanTypes: number[];
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface PromoCodeFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUsageCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  allowedPlanTypes: number[];
}

const initialFormData: PromoCodeFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  maxUsageCount: 0,
  isActive: true,
  validFrom: '',
  validUntil: '',
  allowedPlanTypes: []
};

const PromoCodeManagement: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormData>(initialFormData);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterActive !== null ? { isActive: filterActive } : {};
      const response = await api.get<{ promoCodes: PromoCode[] }>('/admin/promo-codes', { params });
      setPromoCodes(response.data.promoCodes);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement des codes promo');
      // Mock data for development
      setPromoCodes([
        {
          id: 1,
          code: 'WELCOME2026',
          description: 'Offre de bienvenue pour nouveaux clients',
          discountType: 'percentage',
          discountValue: 20,
          maxUsageCount: 100,
          usageCount: 45,
          allowedPlanTypes: [1, 2],
          validFrom: '2026-01-01T00:00:00',
          validUntil: '2026-06-30T23:59:59',
          isActive: true
        },
        {
          id: 2,
          code: 'SUMMER50',
          description: 'Réduction de 50000 XAF pour l\'été',
          discountType: 'fixed',
          discountValue: 50000,
          maxUsageCount: 50,
          usageCount: 12,
          allowedPlanTypes: [2, 3],
          validFrom: '2026-06-01T00:00:00',
          validUntil: '2026-08-31T23:59:59',
          isActive: true
        },
        {
          id: 3,
          code: 'EXPIRED2025',
          description: 'Code promo expiré',
          discountType: 'percentage',
          discountValue: 15,
          maxUsageCount: 200,
          usageCount: 200,
          allowedPlanTypes: [1],
          validFrom: '2025-01-01T00:00:00',
          validUntil: '2025-12-31T23:59:59',
          isActive: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterActive, showError]);

  useEffect(() => {
    fetchPromoCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDialog = (promoCode?: PromoCode) => {
    if (promoCode) {
      setEditingPromoCode(promoCode);
      setFormData({
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        maxUsageCount: promoCode.maxUsageCount,
        isActive: promoCode.isActive,
        validFrom: promoCode.validFrom.split('T')[0],
        validUntil: promoCode.validUntil.split('T')[0],
        allowedPlanTypes: promoCode.allowedPlanTypes
      });
    } else {
      setEditingPromoCode(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPromoCode(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString()
      };

      if (editingPromoCode) {
        await api.put(`/admin/promo-codes/${editingPromoCode.id}`, payload);
        showSuccess('Code promo mis à jour avec succès');
      } else {
        await api.post('/admin/promo-codes', payload);
        showSuccess('Code promo créé avec succès');
      }
      fetchPromoCodes();
      handleCloseDialog();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la sauvegarde du code promo');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await api.post(`/admin/promo-codes/${id}/deactivate`);
      showSuccess('Code promo désactivé avec succès');
      fetchPromoCodes();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la désactivation');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  const getStatusChip = (promoCode: PromoCode) => {
    if (!promoCode.isActive) {
      return <Chip label="Inactif" size="small" color="default" variant="outlined" />;
    }
    if (isExpired(promoCode.validUntil)) {
      return <Chip label="Expiré" size="small" color="error" variant="outlined" />;
    }
    if (promoCode.usageCount >= promoCode.maxUsageCount) {
      return <Chip label="Épuisé" size="small" color="warning" variant="outlined" />;
    }
    return <Chip label="Actif" size="small" color="success" variant="outlined" />;
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Codes Promo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {promoCodes.length} code{promoCodes.length > 1 ? 's' : ''} promo
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
            Nouveau Code Promo
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : promoCodes.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Aucun code promo disponible</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Réduction</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Utilisation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Validité</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promoCodes.map((promoCode) => (
                <TableRow key={promoCode.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OfferIcon color="primary" fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {promoCode.code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{promoCode.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        promoCode.discountType === 'percentage'
                          ? `${promoCode.discountValue}%`
                          : `${promoCode.discountValue.toLocaleString()} XAF`
                      }
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {promoCode.usageCount} / {promoCode.maxUsageCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((promoCode.usageCount / promoCode.maxUsageCount) * 100)}% utilisé
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      Du {formatDate(promoCode.validFrom)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Au {formatDate(promoCode.validUntil)}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(promoCode)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => handleOpenDialog(promoCode)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {promoCode.isActive && (
                      <Tooltip title="Désactiver">
                        <IconButton size="small" color="error" onClick={() => handleDeactivate(promoCode.id)}>
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingPromoCode ? 'Modifier le Code Promo' : 'Nouveau Code Promo'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="ex: WELCOME2026"
                required
                helperText="Utilisez uniquement des lettres majuscules et chiffres"
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

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Type de réduction"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
              >
                <MenuItem value="percentage">Pourcentage (%)</MenuItem>
                <MenuItem value="fixed">Montant fixe (XAF)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={formData.discountType === 'percentage' ? 'Pourcentage' : 'Montant (XAF)'}
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                inputProps={{
                  min: 0,
                  max: formData.discountType === 'percentage' ? 100 : undefined
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de fin"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre d'utilisations max"
                type="number"
                value={formData.maxUsageCount}
                onChange={(e) => setFormData({ ...formData, maxUsageCount: Number(e.target.value) })}
                helperText="0 pour illimité"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Plans autorisés</InputLabel>
                <Select
                  multiple
                  value={formData.allowedPlanTypes}
                  onChange={(e: SelectChangeEvent<number[]>) => 
                    setFormData({ ...formData, allowedPlanTypes: e.target.value as number[] })
                  }
                  input={<OutlinedInput label="Plans autorisés" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => (
                        <Chip key={value} label={`Plan ${value}`} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value={1}>Plan Basic (ID: 1)</MenuItem>
                  <MenuItem value={2}>Plan Pro (ID: 2)</MenuItem>
                  <MenuItem value={3}>Plan Enterprise (ID: 3)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Code promo actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingPromoCode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromoCodeManagement;
