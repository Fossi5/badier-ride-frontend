import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box,
  Menu, MenuItem, Divider, Badge, Drawer, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon, AccountCircle, Notifications, Dashboard,
  DirectionsCar, People, Route, Map, Logout, LocalShipping
} from '@mui/icons-material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../api/notifications';

const Header = () => {
  const { currentUser, logout, isAdmin, isDispatcher, isDriver } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!currentUser;

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data?.count ?? 0);
      } catch {
        // silently ignore
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 60000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { handleMenuClose(); logout(); };
  const handleDrawerToggle = () => setDrawerOpen(prev => !prev);
  const navigateTo = (path) => { navigate(path); setDrawerOpen(false); };

  const adminDrawerItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Chauffeurs', icon: <DirectionsCar />, path: '/admin/drivers' },
    { text: 'Répartiteurs', icon: <People />, path: '/admin/dispatchers' },
    { text: 'Points de livraison', icon: <LocalShipping />, path: '/admin/delivery-points' },
    { text: 'Notifications', icon: <Notifications />, path: '/admin/notifications' },
  ];

  const dispatcherDrawerItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/dispatcher/dashboard' },
    { text: 'Tournées', icon: <Route />, path: '/dispatcher/routes' },
    { text: 'Optimisation', icon: <Map />, path: '/dispatcher/optimize' },
    { text: 'Points de livraison', icon: <LocalShipping />, path: '/dispatcher/delivery-points' },
    { text: 'Alertes', icon: <LocationOnIcon />, path: '/dispatcher/alerts' },
    { text: 'Notifications', icon: <Notifications />, path: '/dispatcher/notifications' },
  ];

  const driverDrawerItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/driver/dashboard' },
    { text: 'Notifications', icon: <Notifications />, path: '/driver/notifications' },
  ];

  const drawerItems = isAdmin()
    ? adminDrawerItems
    : isDispatcher()
    ? dispatcherDrawerItems
    : isDriver()
    ? driverDrawerItems
    : [];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">Badier Ride</Typography>
      </Box>
      <Divider />
      <List>
        {drawerItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigateTo(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
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
            <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }} onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Badier Ride</Link>
          </Typography>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="large" color="inherit" onClick={() => navigateTo(`/${currentUser?.role?.toLowerCase()}/notifications`)}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton size="large" edge="end" onClick={handleMenuOpen} color="inherit">
                <AccountCircle />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{currentUser?.role || 'Utilisateur'}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                  Déconnexion
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>Connexion</Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
