import { Link } from 'react-router-dom';
import { Search, Home, MapPin, TrendingUp, Shield, Star, Users, Building2, ChevronRight, Bed, Bath, Maximize, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// API Configuration
import API_BASE_URL from '../config';
import { useUser } from '../context/UserContext';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  });
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const { userLocation } = useUser();
  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Properties', type: null, listingType: null },
    { id: 'sale', label: 'For Sale', type: null, listingType: 'sale' },
    { id: 'rent', label: 'For Rent', type: null, listingType: 'rent' },
    { id: 'house', label: 'Houses', type: 'house', listingType: null },
    { id: 'apartment', label: 'Apartments', type: 'apartment', listingType: null },
    { id: 'land', label: 'Land/Plots', type: 'land', listingType: null },
    { id: 'Villa', label: 'Villa', type: 'Villa', listingType: null },
    { id: 'commercial', label: 'Commercial', type: 'commercial', listingType: null },
  ];

  // Fetch properties from API
  useEffect(() => {
    if (userLocation?.coords?.lat && userLocation?.coords?.lng) {
      fetchProperties();
    }
  }, [userLocation]);
  

  // Filter properties when activeFilter, properties, or searchQuery change
  useEffect(() => {
    filterProperties();
  }, [activeFilter, properties, searchQuery, isSearchActive]);

  const fetchProperties = async () => {
    try {
      
  
      setLoading(true);
  
      const response = await axios.get(
        `${API_BASE_URL}/api/properties`,
        {
          params: {
            lat: userLocation?.coords?.lat,
            lng: userLocation?.coords?.lng,
            radius: 100, // km
            page: 1,
            limit: 10,
          },
        }
      );
  
      setProperties(response.data.properties || []);
      setError("");
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };
  

  const filterProperties = () => {
    let filtered = [...properties];

    // Apply tab filter (All, Sale, Rent, etc.)
    const selectedFilter = filterOptions.find(f => f.id === activeFilter);
    if (selectedFilter && selectedFilter.id !== 'all') {
      if (selectedFilter.listingType) {
        filtered = filtered.filter(property => property.listingType === selectedFilter.listingType);
      }
      if (selectedFilter.type) {
        filtered = filtered.filter(property => property.propertyType === selectedFilter.type);
      }
    }

    // Apply search filters if search is active
    if (isSearchActive) {
      // Location filter
      if (searchQuery.location) {
        const locationLower = searchQuery.location.toLowerCase();
        filtered = filtered.filter(property =>
          property.address.city?.toLowerCase().includes(locationLower) ||
          property.address.state?.toLowerCase().includes(locationLower) ||
          property.address.street?.toLowerCase().includes(locationLower)
        );
      }

      // Property type filter
      if (searchQuery.propertyType) {
        filtered = filtered.filter(property => 
          property.propertyType === searchQuery.propertyType
        );
      }

      // Price range filter
      if (searchQuery.priceRange) {
        filtered = filtered.filter(property => {
          const price = property.price;
          switch (searchQuery.priceRange) {
            case '0-50':
              return price < 5000000; // Under 50L
            case '50-100':
              return price >= 5000000 && price < 10000000; // 50L - 1Cr
            case '100-200':
              return price >= 10000000 && price < 20000000; // 1Cr - 2Cr
            case '200+':
              return price >= 20000000; // Above 2Cr
            default:
              return true;
          }
        });
      }
    }

    setFilteredProperties(filtered);
  };

  // Handle search button click
  const handleSearch = () => {
    setIsSearchActive(true);
    setActiveFilter('all'); // Reset to all when searching
    // Scroll to results
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Clear search filters
  const clearSearch = () => {
    setSearchQuery({
      location: '',
      propertyType: '',
      priceRange: ''
    });
    setIsSearchActive(false);
  };

  // Format price in Indian format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Home
              <span className="block text-blue-200 mt-2">In Paradise</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100">
              Discover perfect properties from thousands of verified listings across Kerala
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    value={searchQuery.location}
                    onChange={(e) => setSearchQuery({...searchQuery, location: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    value={searchQuery.propertyType}
                    onChange={(e) => setSearchQuery({...searchQuery, propertyType: e.target.value})}
                  >
                    <option value="">Property Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    value={searchQuery.priceRange}
                    onChange={(e) => setSearchQuery({...searchQuery, priceRange: e.target.value})}
                  >
                    <option value="">Price Range</option>
                    <option value="0-50">Under ₹50L</option>
                    <option value="50-100">₹50L - ₹1Cr</option>
                    <option value="100-200">₹1Cr - ₹2Cr</option>
                    <option value="200+">Above ₹2Cr</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Search Indicator */}
      {isSearchActive && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-blue-900 font-semibold">Active Filters:</span>
                {searchQuery.location && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    📍 {searchQuery.location}
                  </span>
                )}
                {searchQuery.propertyType && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    🏠 {searchQuery.propertyType}
                  </span>
                )}
                {searchQuery.priceRange && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    💰 {searchQuery.priceRange === '0-50' ? 'Under ₹50L' : 
                        searchQuery.priceRange === '50-100' ? '₹50L - ₹1Cr' :
                        searchQuery.priceRange === '100-200' ? '₹1Cr - ₹2Cr' : 'Above ₹2Cr'}
                  </span>
                )}
              </div>
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center overflow-x-auto py-4 gap-2 scrollbar-hide">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                {activeFilter === filter.id && (
                  <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {filteredProperties.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtered Properties Section */}
      <div id="results-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {isSearchActive ? 'Search Results' : filterOptions.find(f => f.id === activeFilter)?.label || 'All Properties'}
            </h2>
            <p className="text-xl text-gray-600">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 text-lg">{error}</p>
              <button 
                onClick={fetchProperties}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No properties found</p>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
              {isSearchActive ? (
                <button 
                  onClick={clearSearch}
                  className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Clear Search Filters
                </button>
              ) : (
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="mt-6 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All Properties
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {filteredProperties.slice(0, 9).map((property) => (
                  <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-20 w-20 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
                        {property.listingType}
                      </div>
                      {property.featured && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded capitalize">
                          {property.propertyType}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {property.address.city}, {property.address.state}
                        </span>
                      </div>
                      
                      {property.features && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b">
                          {property.features.bedrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              <span>{property.features.bedrooms}</span>
                            </div>
                          )}
                          {property.features.bathrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              <span>{property.features.bathrooms}</span>
                            </div>
                          )}
                          {property.features.area > 0 && (
                            <div className="flex items-center gap-1">
                              <Maximize className="h-4 w-4" />
                              <span>{property.features.area} sqft</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(property.price)}
                        </span>
                        <Link
                          to={`/property-details/${property._id}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProperties.length > 9 && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Showing 9 of {filteredProperties.length} properties
                  </p>
                  <Link to="/properties" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                    View All {filteredProperties.length} Properties
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">Making property search simple and secure</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-600 transition-all">
                <Search className="h-10 w-10 text-blue-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced filters to find exactly what you're looking for with ease
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-600 transition-all">
                <Shield className="h-10 w-10 text-blue-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Listings</h3>
              <p className="text-gray-600 leading-relaxed">
                All properties verified by our team for authenticity and quality
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-600 transition-all">
                <TrendingUp className="h-10 w-10 text-blue-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Best Deals</h3>
              <p className="text-gray-600 leading-relaxed">
                Competitive pricing and exclusive deals on premium properties
              </p>
            </div>
          </div>
        </div>
      </div>

     

    </div>
  );
};

export default HomePage;