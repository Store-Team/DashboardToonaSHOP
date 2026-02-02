
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
  Modal, 
  TextField, 
  MenuItem, 
  CircularProgress,
  Divider
} from '@mui/material';
import { Add as AddIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface Payment {
  id: string;
  groupName: string;
  amount: number;
  date: string;
  method: string;
  plan: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  // Form states
  const [targetGroup, setTargetGroup] = useState('');
  const [plan, setPlan] = useState('premium');
  const [duration, setDuration] = useState(12);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/admin/payments');
        setPayments(response.data);
      } catch (err) {
        setPayments([
          { id: 'TX-1001', groupName: 'Global Tech Sarl', amount: 450000, date: '2023-10-01', method: 'Orange Money', plan: 'Enterprise' },
          { id: 'TX-1002', groupName: 'Blue Sky Soft', amount: 120000, date: '2023-10-05', method: 'Momo', plan: 'Premium' },
          { id: 'TX-1003', groupName: 'Logistics Pro', amount: 50000, date: '2023-10-12', method: 'Visa', plan: 'Standard' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleExtend = async () => {
    try {
      // In a real app, targetGroup would be an ID from a dropdown
      await api.post(`/admin/group/${targetGroup || '1'}/subscription/extend`, { plan, duration });
      showSuccess('L\'abonnement a été étendu avec succès.');
      setModalOpen(false);
    } catch (err) {
      showError('Erreur lors de l\'extension.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Paiements & Abonnements
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Étendre un abonnement
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount (XAF)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Invoice</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.groupName}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.amount.toLocaleString()}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.plan}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<ReceiptIcon />}>PDF</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Étendre l'abonnement</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cette action prolongera manuellement l'accès pour une entreprise spécifique après réception d'un paiement hors-ligne.
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Nom de l'entreprise"
              fullWidth
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              placeholder="Ex: Global Tech Sarl"
            />
            
            <TextField
              select
              label="Plan Tarifaire"
              fullWidth
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <MenuItem value="standard">Standard (Basic Features)</MenuItem>
              <MenuItem value="premium">Premium (All Features)</MenuItem>
              <MenuItem value="enterprise">Enterprise (Unlimited + API)</MenuItem>
            </TextField>

            <TextField
              select
              label="Durée (Mois)"
              fullWidth
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <MenuItem value={1}>1 Mois</MenuItem>
              <MenuItem value={3}>3 Mois</MenuItem>
              <MenuItem value={6}>6 Mois</MenuItem>
              <MenuItem value={12}>12 Mois (Annuel)</MenuItem>
              <MenuItem value={24}>24 Mois</MenuItem>
            </TextField>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button variant="contained" onClick={handleExtend}>Confirmer l'extension</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default PaymentHistory;
