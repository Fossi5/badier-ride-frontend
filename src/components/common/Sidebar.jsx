// src/components/common/Sidebar.jsx
import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  ListItemButton,
  Avatar,
  IconButton,
  Collapse
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Composant de barre latérale de navigation
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.open - État d'ouverture du drawer
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {Array} props.menuItems - Items du menu 
 * @param {Object} props.user - Informations sur l'utilisateur
 * @param {string} props.appName - Nom de l'application
 * @param {string} props.version - Version de l'application
 */
const Sidebar = ({
  open,
  onClose,
  menuItems = [],
  user = null,
  appName = 'Badier Ride',
  version = '1.0.0'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState({});

  // Fonction pour naviguer vers une page
  const navigateTo = (path) => {
    navigate(path);
    onClose();
  };
  
  // Fonction pour vérifier si un item est actif
  const isItemActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };
  
  // Fonction pour gérer l'expansion des sous-menus
  const handleToggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Fonction pour obtenir les initiales d'un nom
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          {appName}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Profil utilisateur */}
      {user && (
        <>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              {getInitials(user.username)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">{user.username}</Typography>
              <Typography variant="body2" color="text.secondary">{user.role}</Typography>
            </Box>
          </Box>
          <Divider />
        </>
      )}
      
      {/* Menu de navigation */}
      <List sx={{ flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.id || index}>
            {/* S'il s'agit d'un élément avec sous-menu */}
            {item.children ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleToggleExpand(item.id || index)}
                    selected={item.children.some(child => isItemActive(child.path))}
                  >
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    <ListItemText primary={item.text} />
                    {expandedItems[item.id || index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                </ListItem>
                
                {/* Sous-menu */}
                <Collapse in={expandedItems[item.id || index]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child, childIndex) => (
                      <ListItem key={childIndex} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => navigateTo(child.path)}
                          selected={isItemActive(child.path)}
                        >
                          {child.icon && <ListItemIcon>{child.icon}</ListItemIcon>}
                          <ListItemText primary={child.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              /* S'il s'agit d'un élément simple */
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigateTo(item.path)}
                  selected={isItemActive(item.path)}
                >
                  {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )}
            
            {/* Séparateur optionnel */}
            {item.divider && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
      
      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Version {version}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;