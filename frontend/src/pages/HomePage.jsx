import { Link } from 'react-router-dom';
import { Search, Home, MapPin, TrendingUp, Shield, Star, ChevronRight, Bed, Bath, Maximize, Award, Users, Building2, Clock, Phone, ArrowRight, Check, X } from 'lucide-react';
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
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { userLocation } = useUser();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch properties from API
  useEffect(() => {
    if (userLocation?.coords?.lat && userLocation?.coords?.lng) {
      fetchProperties();
    }
  }, [userLocation]);

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
            limit: 20,
          },
        }
      );
  
      const allProperties = response.data.properties || [];
      setProperties(allProperties);
      
      // Filter featured properties for homepage (limit to 6)
      const featured = allProperties.filter(p => p.featured).slice(0, 6);
      setFeaturedProperties(featured);
      
      setError("");
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setIsSearchActive(true);
    // Navigate to properties page with search params
    const params = new URLSearchParams();
    if (searchQuery.location) params.append('location', searchQuery.location);
    if (searchQuery.propertyType) params.append('type', searchQuery.propertyType);
    if (searchQuery.priceRange) params.append('price', searchQuery.priceRange);
    
    window.location.href = `/properties?${params.toString()}`;
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

  const stats = [
    { label: "Properties Listed", value: `${properties.length}+`, icon: Building2 },
    { label: "Happy Customers", value: "1,800+", icon: Users },
    { label: "Years Experience", value: "15+", icon: Award },
    { label: "Expert Agents", value: "50+", icon: Star }
  ];

  const categories = [
    { name: "Luxury Villas", count: properties.filter(p => p.propertyType === 'Villa').length, image: "🏰", color: "from-purple-500 to-pink-500", type: "Villa" },
    { name: "Modern Apartments", count: properties.filter(p => p.propertyType === 'apartment').length, image: "🏢", color: "from-blue-500 to-cyan-500", type: "apartment" },
    { name: "Heritage Homes", count: properties.filter(p => p.propertyType === 'house').length, image: "🏛️", color: "from-amber-500 to-orange-500", type: "house" },
    { name: "Commercial", count: properties.filter(p => p.propertyType === 'commercial').length, image: "🏪", color: "from-green-500 to-emerald-500", type: "commercial" }
  ];

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "AI-powered search to find your perfect property in seconds",
      color: "bg-teal-100 text-teal-600"
    },
    {
      icon: Shield,
      title: "100% Verified",
      description: "Every property verified by legal experts and quality team",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Best Value",
      description: "Competitive pricing with exclusive deals and flexible terms",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Clock,
      title: "Quick Process",
      description: "Streamlined documentation and fastest property closure",
      color: "bg-blue-100 text-blue-600"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Villa Owner",
      image: "👨‍💼",
      text: "Found my dream home within 2 weeks. The team was professional and helpful throughout.",
      rating: 5
    },
    {
      name: "Priya Menon",
      role: "First-time Buyer",
      image: "👩‍💼",
      text: "Excellent service! They made the entire process smooth and stress-free for me.",
      rating: 5
    },
    {
      name: "Anand Nair",
      role: "Investor",
      image: "👨‍💻",
      text: "Best real estate platform in Kerala. Great properties and transparent dealings.",
      rating: 5
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-teal-800/90 to-orange-900/95 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80" 
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-8">
              <Award className="h-4 w-4 text-orange-300" />
              <span className="text-white font-medium">Kerala's  Premium Real Estate Platform</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Discover Your
              <span className="block bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent mt-2">
                Dream Paradise
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-teal-50 max-w-2xl mx-auto leading-relaxed">
              Premium properties handpicked for the discerning few. Experience luxury living in God's Own Country.
            </p>

            {/* Glass-morphism Search Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full px-5 py-4 rounded-xl bg-white/90 backdrop-blur border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 placeholder-gray-500 font-medium"
                    value={searchQuery.location}
                    onChange={(e) => setSearchQuery({...searchQuery, location: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <select 
                    className="w-full px-5 py-4 rounded-xl bg-white/90 backdrop-blur border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 font-medium"
                    value={searchQuery.propertyType}
                    onChange={(e) => setSearchQuery({...searchQuery, propertyType: e.target.value})}
                  >
                    <option value="">Property Type</option>
                    <option value="Villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <select 
                    className="w-full px-5 py-4 rounded-xl bg-white/90 backdrop-blur border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 font-medium"
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
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 mt-6 text-white/90 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>{properties.length}+ Properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>100% Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Trusted by 1,800+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="py-16 bg-gradient-to-r from-teal-700 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-8 w-8 text-orange-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-teal-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Featured Properties */}
      <div className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-6 py-2 mb-4 font-semibold">
              <Star className="h-4 w-4" />
              Premium Collection
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked luxury properties that define elegance and comfort
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button 
                onClick={fetchProperties}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No featured properties available</p>
              <p className="text-gray-500 mb-6">Check back soon for new listings</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {featuredProperties.map((property, idx) => (
                  <div 
                    key={property._id} 
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="relative h-72 overflow-hidden bg-gray-200">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-20 w-20 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        Featured
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium">{property.address?.city}, {property.address?.state}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-3">
                        <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
                          {property.propertyType}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1">
                        {property.title}
                      </h3>
                      
                      {property.features && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
                          {property.features.bedrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4 text-teal-600" />
                              <span className="font-medium">{property.features.bedrooms}</span>
                            </div>
                          )}
                          {property.features.bathrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bath className="h-4 w-4 text-teal-600" />
                              <span className="font-medium">{property.features.bathrooms}</span>
                            </div>
                          )}
                          {property.features.area > 0 && (
                            <div className="flex items-center gap-1">
                              <Maximize className="h-4 w-4 text-teal-600" />
                              <span className="font-medium">{property.features.area} sqft</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Starting from</div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                            {formatPrice(property.price)}
                          </div>
                        </div>
                        <Link 
                          to={`/property-details/${property._id}`}
                          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                        >
                          View
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link 
                  to="/properties"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Explore All {properties.length}+ Properties
                  <ChevronRight className="h-6 w-6" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find the perfect property type for your needs</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <Link
                key={idx}
                to={`/properties?type=${category.type}`}
                className={`group cursor-pointer relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${category.color} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{category.image}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-white/90 font-medium">{category.count} Properties</p>
                <ArrowRight className="absolute bottom-6 right-6 h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">Experience the difference of premium service</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      {/* <div className="py-24 bg-gradient-to-br from-teal-700 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">What Our Clients Say</h2>
            <p className="text-xl text-teal-100">Real stories from real people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-teal-200 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Find Your Dream Home?</h2>
            <p className="text-2xl text-orange-100 mb-10">
              Join thousands of happy homeowners who found their perfect property with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/properties"
                className="bg-white text-orange-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <Search className="h-6 w-6" />
                Browse Properties
              </Link>
              <button className="bg-teal-700 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-teal-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2">
                <Phone className="h-6 w-6" />
                Talk to Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;