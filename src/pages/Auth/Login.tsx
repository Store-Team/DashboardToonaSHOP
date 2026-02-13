
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
import * as authService from '../../services/authService';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Numéro de téléphone ou email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    
    try {
      // Déterminer si c'est un numéro de téléphone ou un email
      const isEmail = identifier.includes('@');
      
      const credentials = {
        password,
        ...(isEmail ? { email: identifier } : { numero: identifier })
      };

      // Étape 1: Authentification
      const authResponse = await authService.login(credentials);
      
      // Stocker temporairement le token pour l'utiliser dans la prochaine requête
      localStorage.setItem('toona_admin_token', authResponse.token);
      
      // Étape 2: Récupérer les informations utilisateur
      const userInfo = await authService.getConnectedUser();
      
      console.log('User info received:', userInfo);
      
      // Stocker les informations utilisateur et appeler le contexte
      const userData = {
        id: userInfo.id.toString(),
        name: userInfo.nomUser || 'Utilisateur',
        role: userInfo.roles?.[0] || 'ROLE_USER'
      };
      
      console.log('Calling login with userData:', userData);
      
      login(authResponse.token, userData);

      console.log('Login context updated, navigating to dashboard...');
      
      showSuccess('Connexion réussie !');
      
      // Utiliser setTimeout pour s'assurer que le contexte est mis à jour
      setTimeout(() => {
        console.log('Executing navigate to /');
        navigate('/', { replace: true });
      }, 100);
    } catch (err: any) {
      // Nettoyer le token en cas d'erreur
      localStorage.removeItem('toona_admin_token');
      
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.error 
        || 'Identifiants invalides. Veuillez réessayer.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            Accéder à ToonaSHOP Admin Console
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Numéro de téléphone ou E-mail"
            variant="outlined"
            margin="normal"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
            placeholder="Ex: 0812345678 ou email@exemple.com"
            helperText=""
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
