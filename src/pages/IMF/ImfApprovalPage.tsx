import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Check as CheckIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface GroupInfo {
  id: number;
  name: string;
  contact: string;
  email: string;
  address: string;
  status: string;
  isImf: boolean;
}

const ImfApprovalPage: React.FC = () => {
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useSnackbar();

  const handleSearchGroup = async () => {
    if (!groupId) {
      setError('Veuillez entrer un ID de groupe');
      return;
    }

    setLoading(true);
    setError('');
    setGroupInfo(null);

    try {
      // Rechercher les infos du groupe (endpoint à adapter selon l'API)
      const response = await api.get<GroupInfo>(`/group/info`, {
        params: { id: groupId }
      });
      setGroupInfo(response.data);
      
      if (!response.data.isImf) {
        setError('Ce groupe n\'est pas un groupe IMF');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Groupe introuvable');
      // Mock data pour test
      setGroupInfo({
        id: parseInt(groupId),
        name: `Groupe IMF #${groupId}`,
        contact: '+243 900 000 000',
        email: 'contact@imf.cd',
        address: 'Kinshasa, RDC',
        status: 'pending',
        isImf: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveGroup = async () => {
    if (!groupInfo) return;

    setLoading(true);
    try {
      await api.patch(`/imf/admin/group/${groupInfo.id}/approve`);
      showSuccess('Groupe IMF validé avec succès');
      setGroupInfo({ ...groupInfo, status: 'approved' });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        showError('Non autorisé - Permissions insuffisantes');
      } else if (status === 404) {
        showError('Groupe non trouvé ou non IMF');
      } else {
        showError(err?.response?.data?.message || 'Erreur lors de la validation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGroupId('');
    setGroupInfo(null);
    setError('');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Validation Groupe IMF
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rechercher et valider un groupe IMF par son ID
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Rechercher un Groupe
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="ID du Groupe *"
                type="number"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchGroup()}
              />
              <Button
                variant="contained"
                onClick={handleSearchGroup}
                disabled={loading || !groupId}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ minWidth: 120 }}
              >
                Rechercher
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {groupInfo && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Informations du Groupe
                </Typography>

                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Nom
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {groupInfo.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Contact
                      </Typography>
                      <Typography variant="body2">
                        {groupInfo.contact}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2">
                        {groupInfo.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Adresse
                      </Typography>
                      <Typography variant="body2">
                        {groupInfo.address}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Type
                      </Typography>
                      <Chip 
                        label={groupInfo.isImf ? 'IMF' : 'Non-IMF'} 
                        size="small" 
                        color={groupInfo.isImf ? 'info' : 'default'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Statut
                      </Typography>
                      <Chip 
                        label={groupInfo.status === 'approved' ? 'Approuvé' : 'En attente'} 
                        size="small" 
                        color={groupInfo.status === 'approved' ? 'success' : 'warning'}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleApproveGroup}
                    disabled={loading || !groupInfo.isImf || groupInfo.status === 'approved'}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                  >
                    {groupInfo.status === 'approved' ? 'Déjà Approuvé' : 'Valider ce Groupe'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Nouveau
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Codes de Réponse
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Chip label="200" size="small" color="success" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  IMF validé avec succès
                </Typography>
              </Box>

              <Box>
                <Chip label="403" size="small" color="error" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Non autorisé - Permissions administrateur requises
                </Typography>
              </Box>

              <Box>
                <Chip label="404" size="small" color="warning" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Groupe non trouvé ou le groupe n'est pas un IMF
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="caption">
                <strong>Note:</strong> Seuls les groupes de type IMF peuvent être validés via cet endpoint. 
                Assurez-vous que le groupe existe et qu'il est bien enregistré comme IMF.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImfApprovalPage;
