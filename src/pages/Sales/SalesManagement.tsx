import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Undo as UndoIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: number;
  date: string;
  client: string;
  items: SaleItem[];
  total: number;
  status: 'completed' | 'cancelled' | 'returned';
}

const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [clientName, setClientName] = useState('');
  const [withDebt, setWithDebt] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    loadMockSales();
  }, []);

  const loadMockSales = () => {
    const mockSales: Sale[] = [
      {
        id: 1,
        date: new Date().toISOString(),
        client: 'Client ABC',
        items: [
          { productId: 1, productName: 'Ordinateur HP', quantity: 1, price: 425000 }
        ],
        total: 425000,
        status: 'completed'
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(),
        client: 'Client XYZ',
        items: [
          { productId: 2, productName: 'Clavier', quantity: 2, price: 15000 },
          { productId: 3, productName: 'Souris', quantity: 2, price: 8500 }
        ],
        total: 47000,
        status: 'completed'
      }
    ];
    setSales(mockSales);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddToCart = () => {
    if (!productSearch) return;
    // Mock add product - in real app, search product from API
    const mockItem: SaleItem = {
      productId: Date.now(),
      productName: productSearch,
      quantity: 1,
      price: 10000
    };
    setCart([...cart, mockItem]);
    setProductSearch('');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updated = [...cart];
    updated[index].quantity = Math.max(1, quantity);
    setCart(updated);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      showError('Ajoutez au moins un produit');
      return;
    }

    try {
      const endpoint = withDebt ? '/sale/create-with-debt' : '/sale/create';
      await api.post(endpoint, {
        client: clientName || 'Client inconnu',
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
      showSuccess('Vente créée avec succès');
      setDialogOpen(false);
      setCart([]);
      setClientName('');
      loadMockSales();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur création vente');
    }
  };

  const handleCancelSale = async (saleId: number) => {
    if (!confirm('Confirmer l\'annulation de cette vente ?')) return;

    try {
      await api.post(`/sale/${saleId}/cancel`);
      showSuccess('Vente annulée');
      loadMockSales();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur annulation');
    }
  };

  const handleReturnSale = async (type: 'replace' | 'remove') => {
    if (!selectedSale) return;

    try {
      await api.post(`/sale/${selectedSale.id}/return`, {
        type,
        items: selectedSale.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
      showSuccess(`Retour ${type === 'replace' ? 'avec remplacement' : 'simple'} effectué`);
      setReturnDialogOpen(false);
      loadMockSales();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur retour');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'returned': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complétée';
      case 'cancelled': return 'Annulée';
      case 'returned': return 'Retournée';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Ventes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Créer, annuler et gérer les retours
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Nouvelle Vente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Articles</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} hover>
                <TableCell>
                  <Typography variant="body2">{formatDate(sale.date)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {sale.client}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {sale.items.length} article(s)
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(sale.total)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(sale.status)}
                    size="small"
                    color={getStatusColor(sale.status)}
                  />
                </TableCell>
                <TableCell align="center">
                  {sale.status === 'completed' && (
                    <>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedSale(sale);
                          setReturnDialogOpen(true);
                        }}
                        title="Retour"
                      >
                        <UndoIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCancelSale(sale.id)}
                        title="Annuler"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Create Sale */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nouvelle Vente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                <input
                  type="checkbox"
                  checked={withDebt}
                  onChange={(e) => setWithDebt(e.target.checked)}
                  id="withDebt"
                />
                <label htmlFor="withDebt">
                  <Typography variant="body2">Vente à crédit</Typography>
                </label>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Ajouter des produits
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un produit..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddToCart()}
                />
                <Button variant="outlined" onClick={handleAddToCart}>
                  <AddIcon />
                </Button>
              </Box>
            </Grid>
            {cart.length > 0 && (
              <Grid item xs={12}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Produit</TableCell>
                        <TableCell>Qté</TableCell>
                        <TableCell align="right">Prix Unit.</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                              size="small"
                              sx={{ width: 80 }}
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleRemoveFromCart(index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {formatCurrency(calculateTotal())}
                          </Typography>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateSale} disabled={cart.length === 0}>
            Créer la Vente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Return */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Retour de Vente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Choisissez le type de retour pour cette vente:
          </Typography>
          {selectedSale && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Vente #{selectedSale.id} - {formatCurrency(selectedSale.total)}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => handleReturnSale('remove')}
            >
              Retour Simple
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => handleReturnSale('replace')}
            >
              Avec Remplacement
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesManagement;
