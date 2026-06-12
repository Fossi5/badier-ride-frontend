import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button,
  Paper, Avatar, InputAdornment, IconButton
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    } catch (err) {
      if (err.response) {
        showError(err.response.data.error || 'Identifiants incorrects');
      } else if (err.request) {
        showError('Serveur inaccessible. Veuillez réessayer plus tard.');
      } else {
        showError('Erreur lors de la connexion');
      }
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
            label="Nom d'utilisateur"
            name="username"
            autoComplete="username"
            placeholder="ex : admin"
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
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{
              '& input::-ms-reveal': { display: 'none' },
              '& input::-ms-clear': { display: 'none' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(prev => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
