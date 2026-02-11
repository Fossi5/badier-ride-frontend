// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';

// Composants de mise en page
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AlertDisplay from './components/common/AlertDisplay';

// Pages d'authentification
import Login from './pages/auth/Login';

// Pages administrateur
import AdminDashboard from './pages/admin/Dashboard';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageDispatchers from './pages/admin/ManageDispatchers';
//import ManageAddresses from './pages/admin/ManageAddresses';

// Pages répartiteur
import DispatcherDashboard from './pages/dispatcher/Dashboard';
import ManageRoutes from './pages/dispatcher/ManageRoutes';
import RouteOptimization from './pages/dispatcher/RouteOptimization';
import ManageDeliveryPoints from './pages/dispatcher/ManageDeliveryPoints';

// Pages chauffeur
import DriverDashboard from './pages/driver/Dashboard';
import RouteDetails from './pages/driver/RouteDetails';

// Thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Fonction pour vérifier le rôle et rediriger vers le tableau de bord approprié
const RoleBasedRedirect = () => {
  const userRole = localStorage.getItem('userRole');

  if (userRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  } else if (userRole === 'DISPATCHER') {
    return <Navigate to="/dispatcher/dashboard" />;
  } else if (userRole === 'DRIVER') {
    return <Navigate to="/driver/dashboard" />;
  } else {
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AlertProvider>
          <AuthProvider>
            <Header />
            <AlertDisplay />
            <Routes>
              {/* Route publique */}
              <Route path="/login" element={<Login />} />

              {/* Redirection basée sur le rôle */}
              <Route path="/" element={<RoleBasedRedirect />} />

              {/* Routes Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="drivers" element={<ManageDrivers />} />
                <Route path="dispatchers" element={<ManageDispatchers />} />
                <Route path="routes" element={<ManageRoutes />} />


                <Route path="delivery-points" element={<ManageDeliveryPoints />} />
              </Route>

              {/* Routes Dispatcher */}
              <Route path="/dispatcher" element={<ProtectedRoute allowedRoles={['DISPATCHER']} />}>
                <Route path="dashboard" element={<DispatcherDashboard />} />
                <Route path="routes" element={<ManageRoutes />} />
                <Route path="optimize" element={<RouteOptimization />} />
                <Route path="delivery-points" element={<ManageDeliveryPoints />} />
              </Route>

              {/* Routes Driver */}
              <Route path="/driver" element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
                <Route path="dashboard" element={<DriverDashboard />} />
                <Route path="route/:id" element={<RouteDetails />} />
              </Route>

              {/* Route par défaut - redirection vers la page de connexion */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <Footer />
          </AuthProvider>
        </AlertProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;