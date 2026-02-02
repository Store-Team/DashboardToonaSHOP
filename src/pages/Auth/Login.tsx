
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Link,
  IconButton
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Login
    setTimeout(() => {
      if (email === 'admin@toonaerp.com' && password === 'admin') {
        login('mock-jwt-token', { id: '1', name: 'Toona Admin', role: 'ROLE_ADMIN_GLOBAL' });
        navigate('/');
      } else {
        showError('Identifiants invalides. Utilisez admin@toonaerp.com / admin');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: 'background.default',
      p: 2
    }}>
      <Paper sx={{ p: 5, width: '100%', maxWidth: 450, borderRadius: 3, border: '1px solid #dadce0', boxShadow: 'none' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: '#202124' }}>
            Connexion
          </Typography>
          <Typography variant="body1" sx={{ color: '#202124' }}>
            Accéder à ToonaShop Admin Console
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-mail ou téléphone"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 1 }}
          />
          
          <Link href="#" sx={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'block', mb: 4 }}>
            Mot de passe oublié ?
          </Link>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Button variant="text" sx={{ color: 'primary.main', fontWeight: 500 }}>
              Créer un compte
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Suivant'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Box sx={{ mt: 3, width: '100%', maxWidth: 450, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Français</Typography>
          <IconButton size="small"><LanguageIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', cursor: 'pointer' }}>Aide</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', cursor: 'pointer' }}>Confidentialité</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', cursor: 'pointer' }}>Conditions</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
