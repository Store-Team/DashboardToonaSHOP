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
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  isActive: boolean;
  isService: boolean;
}

interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    isService: false
  });
  const { showSuccess, showError } = useSnackbar();

  const fetchProducts = async (currentPage: number, limit: number, search?: string) => {
    setLoading(true);
    try {
      let response;
      if (search && search.length >= 2) {
        response = await api.get<Product[]>(`/products/search`, {
          params: { query: search }
        });
        setProducts(response.data);
        setTotalCount(response.data.length);
      } else {
        response = await api.get<PaginatedResponse>('/products', {
          params: { page: currentPage + 1, limit }
        });
        setProducts(response.data.data);
        setTotalCount(response.data.total);
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement des produits');
      // Mock data
      const mockProducts: Product[] = [
        { id: 1, name: 'Ordinateur Portable HP', sku: 'HP-001', price: 425000, isActive: true, isService: false },
        { id: 2, name: 'Clavier Sans Fil', sku: 'KEY-002', price: 15000, isActive: true, isService: false },
        { id: 3, name: 'Souris Optique', sku: 'MOU-003', price: 8500, isActive: true, isService: false },
        { id: 4, name: 'Écran LED 24"', sku: 'MON-004', price: 185000, isActive: true, isService: false },
        { id: 5, name: 'Service Installation', sku: 'SRV-001', price: 50000, isActive: true, isService: true }
      ];
      setProducts(mockProducts);
      setTotalCount(mockProducts.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, rowsPerPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        setSearchQuery(searchTerm);
        setPage(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchQuery]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' XAF';
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price.toString(),
        isService: product.isService
      });
    } else {
      setEditMode(false);
      setSelectedProduct(null);
      setFormData({ name: '', sku: '', price: '', isService: false });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
    setFormData({ name: '', sku: '', price: '', isService: false });
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.sku || !formData.price) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editMode && selectedProduct) {
        await api.patch(`/products/${selectedProduct.id}`, {
          name: formData.name,
          sku: formData.sku,
          isService: formData.isService
        });
        showSuccess('Produit modifié avec succès');
      } else {
        await api.post('/products', {
          name: formData.name,
          sku: formData.sku,
          price: parseFloat(formData.price),
          isService: formData.isService
        });
        showSuccess('Produit créé avec succès');
      }
      handleCloseDialog();
      fetchProducts(page, rowsPerPage, searchQuery);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleUpdatePrice = async (productId: number) => {
    const newPrice = prompt('Nouveau prix:');
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      try {
        await api.put(`/products/${productId}/change/price`, {
          price: parseFloat(newPrice)
        });
        showSuccess('Prix mis à jour');
        fetchProducts(page, rowsPerPage, searchQuery);
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Erreur mise à jour prix');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestion des Produits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Catalogue complet des produits et services
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nouveau Produit
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom ou SKU (min. 2 caractères)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Aucun produit trouvé</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Prix</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.isService ? 'Service' : 'Produit'} 
                        size="small" 
                        color={product.isService ? 'info' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatCurrency(product.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.isActive ? 'Actif' : 'Inactif'} 
                        size="small" 
                        color={product.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(product)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <Button size="small" onClick={() => handleUpdatePrice(product.id)}>
                        Prix
                      </Button>
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

      {/* Dialog Create/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Modifier le Produit' : 'Nouveau Produit'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du produit *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU *"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix (XAF) *"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={formData.isService}
                  onChange={(e) => setFormData({ ...formData, isService: e.target.checked })}
                  id="isService"
                />
                <label htmlFor="isService">
                  <Typography variant="body2">C'est un service</Typography>
                </label>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveProduct}>
            {editMode ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
