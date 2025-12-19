import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar'; // Add this import
import Home from './pages/HomePage';
import Properties from './pages/Properties';
import CreateProperty from './pages/CreateProperty';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthPage from './pages/Login';
import PropertyDetailPage from './pages/PropertyDetails';
import PropertyMapView from './pages/MapView';
import RoleRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar /> {/* Add the Navbar here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/property-details/:id" element={<PropertyDetailPage />} />
          <Route path="/properties" element={<Properties />} />
          <Route
  path="/create-property"
  element={
    <RoleRoute allowedRoles={['agent']}>
      <CreateProperty />
    </RoleRoute>
  }
/>
          <Route path="/map" element={<PropertyMapView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

