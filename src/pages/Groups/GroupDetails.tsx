import React, { useState, useEffect } from 'react';
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
  MenuItem
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
  CalendarMonth as CalendarIcon
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
  const [days, setDays] = useState(30);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!id) return;
      setLoading(true);
      console.log('[GroupDetails] Fetching data for group ID:', id);
      
      let groupData: Group | null = null;
      
      try {
        // Essayer d'abord de récupérer le groupe directement
        groupData = await adminService.getGroupById(Number(id));
        console.log('[GroupDetails] Successfully fetched group data directly:', groupData);
      } catch (directErr) {
        console.log('[GroupDetails] Direct fetch failed, trying to get from groups list');
        try {
          // Si l'endpoint direct n'existe pas, récupérer depuis la liste
          const allGroups = await adminService.getAllGroups(1, 100);
          groupData = allGroups.data.find(g => g.id === Number(id)) || null;
          console.log('[GroupDetails] Found group in list:', groupData);
        } catch (listErr) {
          console.error('[GroupDetails] Failed to fetch from list too:', listErr);
        }
      }
      
      if (!groupData) {
        throw new Error('Group not found');
      }
      
      try {
        // Fetch users and payments in parallel
        const [usersData, paymentsData] = await Promise.all([
          adminService.getGroupNewUsers(Number(id)),
          adminService.getGroupPayments(Number(id))
        ]);

        setGroup(groupData);
        setNewUsers(usersData.data || []);
        setPayments(paymentsData.data || []);
      } catch (err: any) {
        console.error('[GroupDetails] Error fetching group details:', {
          error: err,
          response: err?.response,
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url
        });
        showError(err?.response?.data?.error || 'Erreur lors du chargement des détails');
        // Mock data for development
        setGroup({
          id: Number(id),
          nomEntreprise: 'Tech Solutions Sarl',
          contact: '+237 6 99 88 77 66',
          email: 'contact@techsolutions.cm',
          nrccm: 'RC/DLA/2023/B/12345',
          user_count: 15,
          point_of_sale_count: 3,
          warehouse_count: 2,
          isPaid: true,
          subscriptionEnd: '2026-06-30 23:59:59'
        });
        setNewUsers([
          { id: 1, numero: 'USER001', nom: 'Kamga', prenom: 'Paul', roles: ['user'], created_at: '2026-01-28 10:00:00' },
          { id: 2, numero: 'USER002', nom: 'Mbida', prenom: 'Marie', roles: ['user'], created_at: '2026-01-29 14:30:00' }
        ]);
        setPayments([
          {
            id: 1,
            status: 'approved',
            transactionId: '2445104189',
            reference: 'OCETRASSID',
            amount: '35000',
            provider: 'MPESA',
            plan: 'pro',
            months: 3,
            createdAt: '2026-01-15 10:00:00'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fonction réutilisable pour récupérer les données du groupe avec fallback
  const fetchGroupData = async (groupId: number): Promise<Group | null> => {
    try {
      // Essayer d'abord de récupérer le groupe directement
      return await adminService.getGroupById(groupId);
    } catch (directErr) {
      console.log('[GroupDetails] Direct fetch failed, trying to get from groups list');
      try {
        // Si l'endpoint direct n'existe pas, récupérer depuis la liste
        const allGroups = await adminService.getAllGroups(1, 100);
        return allGroups.data.find(g => g.id === groupId) || null;
      } catch (listErr) {
        console.error('[GroupDetails] Failed to fetch from list too:', listErr);
        return null;
      }
    }
  };

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
      
      // Mise à jour optimiste de l'état local (gérer isPaid et isActive)
      console.log('[GroupDetails] Optimistic update - setting isPaid and isActive to:', activate);
      setGroup(prev => prev ? { 
        ...prev, 
        isPaid: activate,
        isActive: activate 
      } : null);
      
      // Attendre un peu pour laisser le backend traiter la requête
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh group data avec fallback
      console.log('[GroupDetails] Refreshing group data after status change...');
      const refreshedGroup = await fetchGroupData(group.id);
      if (refreshedGroup) {
        console.log('[GroupDetails] Refreshed group data:', {
          id: refreshedGroup.id,
          isPaid: refreshedGroup.isPaid,
          isActive: refreshedGroup.isActive,
          nomEntreprise: refreshedGroup.nomEntreprise
        });
        
        // Fusionner les données rafraîchies avec la mise à jour optimiste
        // Si le backend ne retourne pas les champs mis à jour, on garde notre valeur
        setGroup({
          ...refreshedGroup,
          isPaid: refreshedGroup.isPaid !== undefined ? refreshedGroup.isPaid : activate,
          isActive: refreshedGroup.isActive !== undefined ? refreshedGroup.isActive : activate
        });
      } else {
        console.warn('[GroupDetails] Could not refresh group data, keeping optimistic update');
      }
    } catch (err: any) {
      console.error('[GroupDetails] Error toggling status:', err);
      showError(err?.response?.data?.error || 'Erreur lors de la mise à jour');
      // Annuler la mise à jour optimiste en cas d'erreur
      setGroup(prev => prev ? { 
        ...prev, 
        isPaid: !activate,
        isActive: !activate 
      } : null);
    }
  };

  const handleExtendSubscription = async () => {
    if (!group) return;
    try {
      await adminService.extendSubscription(group.id, { days });
      showSuccess('Abonnement étendu avec succès');
      setExtendDialogOpen(false);
      
      // Refresh group data avec fallback
      const refreshedGroup = await fetchGroupData(group.id);
      if (refreshedGroup) {
        setGroup(refreshedGroup);
      }
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
                        {parseFloat(payment.amount).toLocaleString()} XAF
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
                label="Durée d'extension"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <MenuItem value={7}>7 Jours</MenuItem>
                <MenuItem value={15}>15 Jours</MenuItem>
                <MenuItem value={30}>30 Jours (1 Mois)</MenuItem>
                <MenuItem value={60}>60 Jours (2 Mois)</MenuItem>
                <MenuItem value={90}>90 Jours (3 Mois)</MenuItem>
                <MenuItem value={180}>180 Jours (6 Mois)</MenuItem>
                <MenuItem value={365}>365 Jours (1 An)</MenuItem>
              </TextField>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                L'abonnement sera étendu de {days} jour(s) à partir de la date d'expiration actuelle
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
