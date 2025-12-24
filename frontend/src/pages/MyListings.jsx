import { useState, useEffect } from 'react';
import { Home, MapPin, DollarSign, Edit2, Trash2, Plus, Bed, Bath, Square, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://192.168.29.67:8081'; // Replace with your actual API URL

const MyListingsPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please login to view your listings');
        return;
      }

      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch all properties and filter by owner
      const response = await fetch(`${API_BASE_URL}/api/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Handle both array and object responses
      let allProperties = Array.isArray(data) ? data : (data.properties || []);
      
      // Filter properties by current user
      const myProperties = allProperties.filter(prop => 
        prop.owner === user._id || prop.owner?._id === user._id
      );
      
      setProperties(myProperties);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error loading listings');
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prop => 
        prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(prop => prop.status === filterStatus);
    }

    setFilteredProperties(filtered);
  };

  const handleDelete = async (propertyId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete property');
      }

      setSuccess('Property deleted successfully!');
      setDeleteConfirm(null);
      
      // Remove from list
      setProperties(properties.filter(p => p._id !== propertyId));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Error deleting property');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleEdit = (propertyId) => {
    // Navigate to edit page
    window.location.href = `/edit-property/${propertyId}`;
  };

  const handleCreateNew = () => {
    // Navigate to create property page
    window.location.href = '/create-property';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                  <p className="text-sm text-gray-500">{properties.length} properties</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                {success}
              </div>
            )}
          </div>
        )}

        {/* Properties Grid */}
        {loading && properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your listings...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Home className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Properties Listed</h3>
            <p className="text-gray-500 mb-6">You haven't created any property listings yet.</p>
            <button 
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Your First Listing
              </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200">
                {/* Property Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      property.status === 'available' 
                        ? 'bg-green-500 text-white' 
                        : property.status === 'sold'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {property.status || 'Available'}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-start gap-1 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm line-clamp-2">{property.address}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(property.price)}
                    </span>
                  </div>

                  {/* Property Features */}
                  <div className="flex gap-4 mb-4 text-sm text-gray-600 pb-4 border-b">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.area} sqft</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(property._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(property._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Property?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone and all property data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Property'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;