// src/components/common/Footer.jsx
import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center" color="text.secondary">
          &copy; {new Date().getFullYear()} Badier Ride
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Application de gestion des livraisons
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;