import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Search, SlidersHorizontal, X, Home, ChevronRight } from 'lucide-react';
import axios from 'axios';

import API_BASE_URL from '../config'; 

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    listingType: '',
    minPrice: '', 
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters based on filters
      const params = new URLSearchParams();
      
      if (filters.city) params.append('city', filters.city);
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.listingType) params.append('listingType', filters.listingType);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/properties${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url);
      setProperties(response.data.properties || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      propertyType: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: ''
    });
    // Fetch all properties after clearing filters
    setTimeout(() => {
      fetchProperties();
    }, 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
              Find Your Dream Home
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100">
              Discover the perfect property from our curated collection
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Filter Toggle Button (Mobile) */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 sm:px-6 rounded-lg shadow-md flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 border border-gray-200"
          >
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            <span className="text-sm sm:text-base">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                  <span>Filters</span>
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* Location */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Listing Type
                  </label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                    value={filters.listingType}
                    onChange={(e) => handleFilterChange('listingType', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-200">
                    <div className="bg-gray-300 h-48 sm:h-52"></div>
                    <div className="p-4 sm:p-5">
                      <div className="h-5 bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center border border-gray-200">
                <div className="text-red-500 mb-4 sm:mb-6">
                  <X className="h-16 w-16 sm:h-20 sm:w-20 mx-auto" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {error}
                </h3>
                <button 
                  onClick={fetchProperties} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg shadow-md transition-all text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center border border-gray-200">
                <div className="text-gray-300 mb-4 sm:mb-6">
                  <Home className="h-16 w-16 sm:h-20 sm:w-20 mx-auto" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  No properties found
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button 
                  onClick={clearFilters} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg shadow-md transition-all text-sm sm:text-base"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6 flex items-center justify-between bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200">
                  <span className="text-sm sm:text-base text-gray-700 font-semibold">
                    Found <span className="text-blue-600 font-bold">{properties.length}</span> properties
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {properties.map((property) => (
                    <Link
                      key={property._id}
                      to={`/properties/${property._id}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200 group"
                    >
                      {/* Property Image */}
                      <div className="relative h-48 sm:h-52 overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0].url || property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="h-12 w-12 sm:h-14 sm:w-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Home className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-bold shadow-lg capitalize ${
                            property.listingType === 'sale' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-amber-500 text-white'
                          }`}>
                            For {property.listingType}
                          </span>
                        </div>
                        {property.featured && (
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-bold shadow-lg bg-yellow-500 text-white">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="p-4 sm:p-5">
                        <div className="mb-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded capitalize">
                            {property.propertyType}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-gray-500 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {property.address.city}, {property.address.state}
                          </span>
                        </div>

                        {/* Features */}
                        {property.features && (
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                            {property.features.bedrooms > 0 && (
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                <span className="font-medium">{property.features.bedrooms}</span>
                              </div>
                            )}
                            {property.features.bathrooms > 0 && (
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <Bath className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                <span className="font-medium">{property.features.bathrooms}</span>
                              </div>
                            )}
                            {property.features.area > 0 && (
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                <span className="font-medium">{property.features.area} sqft</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">
                            {formatPrice(property.price)}
                          </span>
                          <span className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-sm">
                            View
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;