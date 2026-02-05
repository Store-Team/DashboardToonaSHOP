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
  CircularProgress,
  Tabs,
  Tab,
  TablePagination
} from '@mui/material';
import {
  Warning as WarningIcon
} from '@mui/icons-material';
import api from '../../services/api/axios';
import { useSnackbar } from '../../context/SnackbarContext';

interface ExpiringLot {
  id: number;
  productName: string;
  sku: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  location: string;
  daysRemaining: number;
}

const ExpirationAlerts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [posExpirations, setPosExpirations] = useState<ExpiringLot[]>([]);
  const [warehouseExpirations, setWarehouseExpirations] = useState<ExpiringLot[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { showError } = useSnackbar();

  const fetchExpirations = async () => {
    setLoading(true);
    try {
      const [posResponse, warehouseResponse] = await Promise.all([
        api.get<ExpiringLot[]>('/expiration/point-of-sale'),
        api.get<ExpiringLot[]>('/expiration/warehouse')
      ]);
      setPosExpirations(posResponse.data);
      setWarehouseExpirations(warehouseResponse.data);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Erreur lors du chargement');
      // Mock data
      const mockPosData: ExpiringLot[] = [
        {
          id: 1,
          productName: 'Médicament A',
          sku: 'MED-001',
          lotNumber: 'LOT-2024-001',
          expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          quantity: 50,
          location: 'Point de Vente Central',
          daysRemaining: 30
        },
        {
          id: 2,
          productName: 'Complément B',
          sku: 'COM-002',
          lotNumber: 'LOT-2024-002',
          expirationDate: new Date(Date.now() + 45 * 86400000).toISOString(),
          quantity: 120,
          location: 'Point de Vente Nord',
          daysRemaining: 45
        }
      ];

      const mockWarehouseData: ExpiringLot[] = [
        {
          id: 3,
          productName: 'Produit C',
          sku: 'PRD-003',
          lotNumber: 'LOT-2024-003',
          expirationDate: new Date(Date.now() + 60 * 86400000).toISOString(),
          quantity: 200,
          location: 'Entrepôt Principal',
          daysRemaining: 60
        },
        {
          id: 4,
          productName: 'Article D',
          sku: 'ART-004',
          lotNumber: 'LOT-2024-004',
          expirationDate: new Date(Date.now() + 20 * 86400000).toISOString(),
          quantity: 75,
          location: 'Entrepôt Secondaire',
          daysRemaining: 20
        }
      ];

      setPosExpirations(mockPosData);
      setWarehouseExpirations(mockWarehouseData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpirations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getUrgencyColor = (daysRemaining: number): 'error' | 'warning' | 'default' => {
    if (daysRemaining <= 30) return 'error';
    if (daysRemaining <= 60) return 'warning';
    return 'default';
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentData = tabValue === 0 ? posExpirations : warehouseExpirations;
  const paginatedData = currentData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Alertes de Péremption
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Produits expirant dans les 2.5 prochains mois
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => {
            setTabValue(newValue);
            setPage(0);
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`Points de Vente (${posExpirations.length})`}
            icon={<WarningIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Entrepôts (${warehouseExpirations.length})`}
            icon={<WarningIcon />}
            iconPosition="start"
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : currentData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aucune alerte de péremption
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>N° Lot</TableCell>
                    <TableCell>Date Expiration</TableCell>
                    <TableCell align="center">Quantité</TableCell>
                    <TableCell>Localisation</TableCell>
                    <TableCell align="center">Urgence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.productName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.lotNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(item.expirationDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.location}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${item.daysRemaining}j`}
                          size="small"
                          color={getUrgencyColor(item.daysRemaining)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={currentData.length}
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
      </Paper>
    </Box>
  );
};

export default ExpirationAlerts;
