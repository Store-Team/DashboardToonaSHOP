import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Warehouse as WarehouseIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  PersonAdd as PersonAddIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import * as adminService from '../../services/adminService';
import { useSnackbar } from '../../context/SnackbarContext';

// Utiliser les types du service adminService
type Group = adminService.Group;
type NewUser = adminService.NewUser;
type Payment = adminService.Payment;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [newUsers, setNewUsers] = useState<NewUser[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [months, setMonths] = useState(3);
  const [plan, setPlan] = useState('pro');
  const { showSuccess, showError } = useSnackbar();

  // Fonction réutilisable pour récupérer les données du groupe avec fallback
  const fetchGroupData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    console.log('[GroupDetails] Fetching data for group ID:', id);
    
    try {
      // Essayer d'abord de récupérer le groupe directement
      const groupData = await adminService.getGroupById(Number(id));
      console.log('[GroupDetails] ✅ Successfully fetched group data directly:', groupData);
      setGroup(groupData);
    } catch (directErr) {
      console.log('[GroupDetails] ⚠️ Direct fetch failed, trying to get from groups list');
      try {
        // Si l'endpoint direct n'existe pas, récupérer depuis la liste
        const allGroups = await adminService.getAllGroups(1, 100);
        const groupData = allGroups.data.find(g => g.id === Number(id)) || null;
        console.log('[GroupDetails] ✅ Found group in list:', groupData);
        setGroup(groupData);
      } catch (listErr) {
        console.error('[GroupDetails] ❌ Failed to fetch from list too:', listErr);
        showError('Erreur lors du chargement du groupe');
        setGroup(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  // Charger les données du groupe au montage et quand l'ID change
  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // Charger les données associées (users, payments)
  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!id) return;
      
      try {
        // Fetch users and payments in parallel
        const [usersData, paymentsData] = await Promise.all([
          adminService.getGroupNewUsers(Number(id)),
          adminService.getGroupPayments(Number(id))
        ]);

        setNewUsers(usersData.data || []);
        setPayments(paymentsData.data || []);
      } catch (err: any) {
        console.error('[GroupDetails] Error fetching related data:', {
          error: err,
          response: err?.response,
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url
        });
        
        // Afficher des listes vides en cas d'erreur
        setNewUsers([]);
        setPayments([]);
      }
    };

    fetchRelatedData();
  }, [id]);

  const handleToggleStatus = async (activate: boolean) => {
    if (!group) return;
    try {
      console.log(`[GroupDetails] Toggling status to ${activate ? 'active' : 'inactive'} for group ${group.id}`);
      
      if (activate) {
        await adminService.activateGroup(group.id);
      } else {
        await adminService.disableGroup(group.id);
      }
      
      showSuccess(`Groupe ${activate ? 'activé' : 'désactivé'} avec succès`);
      
      // Rafraîchir les données
      await fetchGroupData();
      
    } catch (err: any) {
      console.error('[GroupDetails] Error toggling status:', err);
      showError(err?.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleExtendSubscription = async () => {
    if (!group) return;
    try {
      await api.post(`/admin/group/${group.id}/subscription/extend`, { 
        months, 
        plan 
      });
      showSuccess('Abonnement étendu avec succès');
      setExtendDialogOpen(false);
      
      // Rafraîchir les données
      await fetchGroupData();
      
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erreur lors de l\'extension');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = () => {
    if (!group) return null;
    const endDate = new Date(group.subscriptionEnd);
    const today = new Date();
    const isExpired = endDate < today;
    
    // Utiliser isActive si disponible, sinon isPaid
    const isGroupActive = group.isActive !== undefined ? group.isActive : group.isPaid;

    if (!isGroupActive || isExpired) {
      return <Chip label="Inactif" color="error" size="medium" />;
    }

    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) {
      return <Chip label="Expire bientôt" color="warning" size="medium" />;
    }

    return <Chip label="Actif" color="success" size="medium" />;
  };

  const getPaymentStatusChip = (status: string) => {
    const configs: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
      approved: { label: 'Approuvé', color: 'success' },
      failed: { label: 'Échoué', color: 'error' },
      timeout: { label: 'Timeout', color: 'warning' },
      pending: { label: 'En attente', color: 'default' }
    };
    const config = configs[status] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">Groupe non trouvé</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/groups')} sx={{ mt: 2 }}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/groups')} sx={{ mb: 2 }}>
            Retour à la liste
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {group.nomEntreprise}
            </Typography>
            {getStatusChip()}
          </Box>
          <Typography variant="body2" color="text.secondary">
            ID: {group.id} • NRCCM: {group.nrccm}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Rafraîchir les données">
            <span>
              <IconButton onClick={fetchGroupData} disabled={loading} color="primary">
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button variant="outlined" startIcon={<EditIcon />}>
            Modifier
          </Button>
          {(group.isActive !== undefined ? group.isActive : group.isPaid) ? (
            <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => handleToggleStatus(false)}>
              Désactiver
            </Button>
          ) : (
            <Button variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleToggleStatus(true)}>
              Activer
            </Button>
          )}
          <Button variant="contained" startIcon={<CalendarIcon />} onClick={() => setExtendDialogOpen(true)}>
            Étendre l'abonnement
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{group.user_count}</Typography>
                  <Typography variant="body2" color="text.secondary">Utilisateurs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                  <StoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{group.point_of_sale_count}</Typography>
                  <Typography variant="body2" color="text.secondary">Points de vente</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                  <WarehouseIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{group.warehouse_count}</Typography>
                  <Typography variant="body2" color="text.secondary">Entrepôts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                  <CalendarIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Expire le</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {new Date(group.subscriptionEnd).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Info Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Informations de contact
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{group.email}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Téléphone</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{group.contact}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">NRCCM</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{group.nrccm}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label={`Nouveaux utilisateurs (${newUsers.length})`} icon={<PersonAddIcon />} iconPosition="start" />
          <Tab label={`Paiements (${payments.length})`} icon={<PaymentIcon />} iconPosition="start" />
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          {newUsers.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Aucun nouvel utilisateur
            </Typography>
          ) : (
            <List>
              {newUsers.map((user, index) => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                        {user.prenom.charAt(0)}{user.nom.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {user.prenom} {user.nom}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="caption" color="text.secondary">
                            Numéro: {user.numero}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            Créé le {formatDate(user.created_at)}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < newUsers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {payments.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Aucun paiement enregistré
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Référence</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Durée</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{payment.reference}</Typography>
                        <Typography variant="caption" color="text.secondary">TX: {payment.transactionId}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {parseFloat(payment.amount).toLocaleString()} USD
                      </TableCell>
                      <TableCell>
                        <Chip label={payment.provider} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{payment.plan}</TableCell>
                      <TableCell>{payment.months} mois</TableCell>
                      <TableCell>{getPaymentStatusChip(payment.status)}</TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Extend Subscription Dialog */}
      <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Étendre l'abonnement</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Durée d'extension (Mois)"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              >
                <MenuItem value={1}>1 Mois</MenuItem>
                <MenuItem value={2}>2 Mois</MenuItem>
                <MenuItem value={3}>3 Mois</MenuItem>
                <MenuItem value={6}>6 Mois</MenuItem>
                <MenuItem value={12}>12 Mois (1 An)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="pro">Pro</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                L'abonnement sera étendu de {months} mois avec le plan {plan}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleExtendSubscription}>Confirmer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupDetails;
