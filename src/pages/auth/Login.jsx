// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { error: showError } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      showError('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    
    try {
      await login(username, password);
      // La redirection est gérée dans le contexte d'authentification
    } catch (err) {
      let errorMessage = 'Erreur lors de la connexion';
      
      if (err.response) {
        // Le serveur a répondu avec un code d'erreur
        errorMessage = err.response.data.error || 'Identifiants incorrects';
      } else if (err.request) {
        // Pas de réponse du serveur
        errorMessage = 'Serveur inaccessible. Veuillez réessayer plus tard.';
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5">
          Connexion à Badier Ride
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nom d'utilisateur"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;