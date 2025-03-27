// src/components/common/Header.jsx
import React, { useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Correct icon import
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Divider,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  Notifications, 
  Dashboard, 
  DirectionsCar, 
  People, 
  Route, 
  Map,
  Logout,
  LocalShipping 
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, logout, isAdmin, isDispatcher, isDriver } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const isAuthenticated = !!currentUser;
  
  // Ouvrir le menu de profil
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Fermer le menu de profil
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Gérer la déconnexion
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  // Ouvrir le tiroir de navigation
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Navigation vers une page
  const navigateTo = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };
  
  // Elements du tiroir de navigation pour l'administrateur
  const adminDrawerItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Chauffeurs', icon: <DirectionsCar />, path: '/admin/drivers' },
    { text: 'Répartiteurs', icon: <People />, path: '/admin/dispatchers' },
    { text: 'Adresses', icon: <LocationOnIcon />, path: '/admin/addresses' }, // Fixed icon
  ];
  
  // Elements du tiroir de navigation pour le répartiteur
  const dispatcherDrawerItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/dispatcher/dashboard' },
    { text: 'Tournées', icon: <Route />, path: '/dispatcher/routes' },
    { text: 'Optimisation', icon: <Map />, path: '/dispatcher/optimize' },
    { text: 'Points de livraison', icon: <LocalShipping />, path: '/dispatcher/delivery-points' },
  ];
  
  // Elements du tiroir de navigation pour le chauffeur
  const driverDrawerItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/driver/dashboard' },
  ];
  
  // Déterminer les éléments du tiroir en fonction du rôle
  let drawerItems = [];
  
  if (isAdmin()) {
    drawerItems = adminDrawerItems;
  } else if (isDispatcher()) {
    drawerItems = dispatcherDrawerItems;
  } else if (isDriver()) {
    drawerItems = driverDrawerItems;
  }
  
  // Contenu du tiroir de navigation
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          Badier Ride
        </Typography>
      </Box>
      <Divider />
      <List>
        {drawerItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigateTo(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isAuthenticated && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Badier Ride
            </Link>
          </Typography>
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="large"
                aria-label="notifications"
                color="inherit"
              >
                <Badge badgeContent={0} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              
              <IconButton
                size="large"
                edge="end"
                aria-label="account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {currentUser?.role || 'Utilisateur'}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Déconnexion
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Connexion
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Tiroir de navigation */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;