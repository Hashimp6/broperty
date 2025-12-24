import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Search, SlidersHorizontal, X, Home, ChevronRight, Award, TrendingUp } from 'lucide-react';
import axios from 'axios';

import API_BASE_URL from '../config'; 
import { useUser } from '../context/UserContext';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userLocation } = useUser();
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minPrice: '', 
    maxPrice: '',
    bedrooms: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeSort, setActiveSort] = useState('featured');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
  
      const response = await axios.get(`${API_BASE_URL}/api/properties`, {
        params: {
          // filters
          city: filters.city || undefined,
          propertyType: filters.propertyType || undefined,
          listingType: 'sale', // Fixed to sale only
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          bedrooms: filters.bedrooms || undefined,
  
          // location + pagination
          lat: userLocation?.coords?.lat,
          lng: userLocation?.coords?.lng,
          radius: 100,
          page: 1,
          limit: 50,
        },
      });
  
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
      minPrice: '',
      maxPrice: '',
      bedrooms: ''
    });
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

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    if (activeSort === 'featured') {
      return b.featured ? 1 : -1;
    } else if (activeSort === 'price-low') {
      return a.price - b.price;
    } else if (activeSort === 'price-high') {
      return b.price - a.price;
    }
    return 0;
  });

  const priceRanges = [
    { label: 'Under ₹50L', min: 0, max: 5000000 },
    { label: '₹50L - ₹1Cr', min: 5000000, max: 10000000 },
    { label: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000 },
    { label: '₹2Cr - ₹5Cr', min: 20000000, max: 50000000 },
    { label: 'Above ₹5Cr', min: 50000000, max: null }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-orange-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-6">
              <Award className="h-4 w-4 text-orange-300" />
              <span className="text-white font-medium">Premium Properties</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Explore Our
              <span className="block bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent mt-2">
                Exclusive Collection
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-teal-50 leading-relaxed">
              Discover luxury properties for sale across God's Own Country
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="mb-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">{properties.length}</div>
              <div className="text-teal-100 text-sm font-medium">Properties Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{properties.filter(p => p.featured).length}</div>
              <div className="text-teal-100 text-sm font-medium">Featured Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {new Set(properties.map(p => p.address.city)).size}
              </div>
              <div className="text-teal-100 text-sm font-medium">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-teal-100 text-sm font-medium">Verified Properties</div>
            </div>
          </div>
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all border border-gray-200"
          >
            <SlidersHorizontal className="h-5 w-5 text-teal-600" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:sticky lg:top-4 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-teal-600" />
                  <span>Filters</span>
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none bg-white"
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                {/* Price Range - Quick Select */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Price Range
                  </label>
                  <div className="space-y-2 mb-4">
                    {priceRanges.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleFilterChange('minPrice', range.min);
                          handleFilterChange('maxPrice', range.max || '');
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          filters.minPrice == range.min
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Price Range */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Custom Range</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none bg-white"
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

                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Search className="h-5 w-5" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Header */}
            <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <span className="text-gray-700 font-semibold">
                  <span className="text-teal-600 font-bold">{sortedProperties.length}</span> Properties
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600">Sort:</label>
                <select
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none bg-white"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-100">
                    <div className="bg-gray-300 h-64"></div>
                    <div className="p-6">
                      <div className="h-5 bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <div className="text-red-500 mb-6">
                  <X className="h-20 w-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{error}</h3>
                <button 
                  onClick={fetchProperties} 
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : sortedProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <div className="text-gray-300 mb-6">
                  <Home className="h-20 w-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No properties found</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button 
                  onClick={clearFilters} 
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProperties.map((property) => (
                  <Link
                    key={property._id}
                    to={`/property-details/${property._id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                  >
                    {/* Property Image */}
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].url || property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="h-14 w-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-14 w-14 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {property.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-4 py-2 rounded-full text-xs font-bold shadow-lg bg-orange-500 text-white">
                            Featured
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium line-clamp-1">
                            {property.address.city}, {property.address.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      <div className="mb-3">
                        <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
                          {property.propertyType}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-teal-600 transition-colors">
                        {property.title}
                      </h3>

                      {/* Features */}
                      {property.features && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
                          {property.features.bedrooms > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Bed className="h-4 w-4 text-teal-600" />
                              <span className="font-medium">{property.features.bedrooms}</span>
                            </div>
                          )}
                          {property.features.bathrooms > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Bath className="h-4 w-4 text-teal-600" />
                              <span className="font-medium">{property.features.bathrooms}</span>
                            </div>
                          )}
                          {property.features.area > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Maximize className="h-4 w-4 text-teal-600" />
                              <span className="font-medium">{property.features.area} sqft</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Price</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                            {formatPrice(property.price)}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-1 group-hover:shadow-lg transition-all">
                          View
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;