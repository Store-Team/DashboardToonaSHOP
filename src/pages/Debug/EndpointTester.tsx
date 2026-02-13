import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { validateAllEndpoints, EndpointStatus } from '../../services/api/apiValidator';

interface TestResult {
  category: string;
  results: EndpointStatus[];
}

const EndpointTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runTests = async () => {
    setTesting(true);
    setProgress(0);
    setResults([]);

    try {
      const allResults = await validateAllEndpoints((current, total) => {
        setProgress((current / total) * 100);
      });

      // Grouper par catégorie
      const grouped: { [key: string]: EndpointStatus[] } = {};
      
      allResults.forEach(result => {
        if (!grouped[result.category]) {
          grouped[result.category] = [];
        }
        grouped[result.category].push(result);
      });

      const formattedResults = Object.entries(grouped).map(([category, results]) => ({
        category,
        results
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Erreur lors des tests:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
    }
  };

  const getCategoryStats = (results: EndpointStatus[]) => {
    const success = results.filter(r => r.status === 'success').length;
    const errors = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    return { success, errors, warnings, total: results.length };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🔍 Testeur d'Endpoints API
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Teste tous les endpoints de l'API pour identifier les problèmes
          </Typography>

          <Button
            variant="contained"
            onClick={runTests}
            disabled={testing}
            fullWidth
            sx={{ mb: 2 }}
          >
            {testing ? 'Tests en cours...' : 'Lancer les tests'}
          </Button>

          {testing && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Progression: {Math.round(progress)}%
              </Typography>
            </Box>
          )}

          {results.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Résultats des tests
              </Typography>

              {results.map((categoryResult) => {
                const stats = getCategoryStats(categoryResult.results);
                
                return (
                  <Accordion key={categoryResult.category} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="h6">
                          {categoryResult.category}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                          {stats.success > 0 && (
                            <Chip
                              label={`${stats.success} OK`}
                              color="success"
                              size="small"
                            />
                          )}
                          {stats.warnings > 0 && (
                            <Chip
                              label={`${stats.warnings} Avert.`}
                              color="warning"
                              size="small"
                            />
                          )}
                          {stats.errors > 0 && (
                            <Chip
                              label={`${stats.errors} Erreurs`}
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Status</TableCell>
                              <TableCell>Endpoint</TableCell>
                              <TableCell>Méthode</TableCell>
                              <TableCell>Code HTTP</TableCell>
                              <TableCell>Temps</TableCell>
                              <TableCell>Message</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {categoryResult.results.map((result, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {getStatusIcon(result.status)}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {result.endpoint}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={result.method}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={result.statusCode || 'N/A'}
                                    size="small"
                                    color={getStatusColor(result.status)}
                                  />
                                </TableCell>
                                <TableCell>
                                  {result.responseTime ? `${result.responseTime}ms` : '-'}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {result.message}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EndpointTester;
