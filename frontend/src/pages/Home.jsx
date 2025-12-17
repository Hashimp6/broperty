import { Link } from 'react-router-dom';
import { Search, Home as HomeIcon, MapPin, TrendingUp, Shield, Star, Users, Building2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  });

  const featuredProperties = [
    {
      id: 1,
      title: "Luxury Villa with Ocean View",
      location: "Kovalam, Kerala",
      price: "₹8,50,00,000",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      beds: 4,
      baths: 3,
      area: "3500 sq ft"
    },
    {
      id: 2,
      title: "Modern Apartment in City Center",
      location: "Thiruvananthapuram",
      price: "₹65,00,000",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      beds: 3,
      baths: 2,
      area: "1800 sq ft"
    },
    {
      id: 3,
      title: "Spacious Family Home",
      location: "Kochi, Kerala",
      price: "₹1,20,00,000",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      beds: 5,
      baths: 4,
      area: "4200 sq ft"
    }
  ];

  const stats = [
    { icon: Building2, value: "5000+", label: "Properties Listed" },
    { icon: Users, value: "10,000+", label: "Happy Customers" },
    { icon: Star, value: "4.8/5", label: "Average Rating" },
    { icon: MapPin, value: "50+", label: "Cities Covered" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
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
              <span className="block text-primary-200 mt-2">In Paradise</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100">
              Discover perfect properties from thousands of verified listings across Kerala
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
                    value={searchQuery.location}
                    onChange={(e) => setSearchQuery({...searchQuery, location: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
                    value={searchQuery.propertyType}
                    onChange={(e) => setSearchQuery({...searchQuery, propertyType: e.target.value})}
                  >
                    <option value="">Property Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
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
                  <Link
                    to="/properties"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-xl text-gray-600">Handpicked properties just for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b">
                    <span>{property.beds} Beds</span>
                    <span>{property.baths} Baths</span>
                    <span>{property.area}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">{property.price}</span>
                    <Link
                      to={`/properties/${property.id}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/properties" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              View All Properties
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-600 transition-all">
                <Search className="h-10 w-10 text-primary-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced filters to find exactly what you're looking for with ease
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-600 transition-all">
                <Shield className="h-10 w-10 text-primary-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Listings</h3>
              <p className="text-gray-600 leading-relaxed">
                All properties verified by our team for authenticity and quality
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-600 transition-all">
                <TrendingUp className="h-10 w-10 text-primary-600 group-hover:text-white transition-all" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Best Deals</h3>
              <p className="text-gray-600 leading-relaxed">
                Competitive pricing and exclusive deals on premium properties
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of happy homeowners who found their dream property with us
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg">
              Get Started Free
            </Link>
            <Link to="/properties" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-600 transition-all">
              Browse Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Real stories from real customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Homeowner",
                text: "Found my dream home within a week! The platform is so easy to use and the listings are genuine.",
                rating: 5
              },
              {
                name: "Rajesh Kumar",
                role: "Property Investor",
                text: "Best real estate platform in Kerala. Great properties, transparent pricing, and excellent support.",
                rating: 5
              },
              {
                name: "Anjali Menon",
                role: "First-time Buyer",
                text: "The team helped me through every step. Made buying my first home stress-free and exciting!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;