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
          <Route path="/create-property" element={<CreateProperty />} />
          <Route path="/map" element={<PropertyMapView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;


// import useAuthStore from './store/authStore';

// // Layout
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';


// import Properties from './pages/Properties';
// import PropertyDetails from './pages/PropertyDetails';

// import Dashboard from './pages/Dashboard';
// import Showings from './pages/Showings';


// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//     },
//   },
// });

// function App() {
//   const { getCurrentUser, token, isLoading } = useAuthStore();

//   // Load user on mount if token exists
//   useEffect(() => {
//     if (token) {
//       getCurrentUser();
//     }
//   }, [token, getCurrentUser]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <QueryClientProvider client={queryClient}>
//       <Router>
//         <div className="min-h-screen bg-gray-50">
//           <Navbar />
          
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<Home />} />
//             <Route path="/properties" element={<Properties />} />
//             <Route path="/properties/:id" element={<PropertyDetails />} />
            
//             {/* Auth Routes - Redirect to dashboard if already logged in */}
//             {/* <Route 
//               path="/login" 
//               element={
//                 token ? <Navigate to="/dashboard" replace /> : <Login />
//               } 
//             />
//             <Route 
//               path="/register" 
//               element={
//                 token ? <Navigate to="/dashboard" replace /> : <Register />
//               } 
//             /> */}

//             {/* Protected Routes - Require authentication */}
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/properties/create"
//               element={
//                 <ProtectedRoute>
//                   <CreateProperty />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/showings"
//               element={
//                 <ProtectedRoute>
//                   <Showings />
//                 </ProtectedRoute>
//               }
//             />

//             {/* 404 - Redirect to home */}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </div>
//       </Router>
//     </QueryClientProvider>
//   );
// }

// export default App;