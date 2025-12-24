import { useState, useEffect, useRef } from 'react';
import { MapPin, Menu, X, Home, Building2, PlusCircle, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ProfileModal from '../pages/UserProfile';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const { userLocation, setUserLocation } = useUser();
  const [activeTab, setActiveTab] = useState('home');
  const debounceTimer = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Set active tab based on current path
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') {
      setActiveTab('home');
    } else if (path === '/properties') {
      setActiveTab('properties');
    } else if (path === '/create-property') {
      setActiveTab('create');
    } else if (path === '/map') {
      setActiveTab('map');
    }
  }, [location.pathname]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation({
        locationName: "Location unavailable",
        coords: null,
        source: null,
      });
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
  
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
  
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Current Location";
  
          setUserLocation({
            locationName: city,
            coords: { lat, lng },
            source: "gps",
          });
        } catch {
          setUserLocation({
            locationName: "Current Location",
            coords: { lat, lng },
            source: "gps",
          });
        }
      },
      () => {
        setUserLocation({
          locationName: "Location unavailable",
          coords: null,
          source: null,
        });
      }
    );
  };

  const searchLocations = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchLocations(value);
    }, 200);
  };

  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
  
    const locationName =
      suggestion.address.city ||
      suggestion.address.town ||
      suggestion.address.village ||
      suggestion.address.state ||
      suggestion.display_name;
  
    setUserLocation({
      locationName,
      coords: { lat, lng },
      source: "manual",
    });
  
    setInputValue("");
    setSuggestions([]);
    setIsLocationOpen(false);
  };
  
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userRole = storedUser?.role;
  
  const handleUseCurrentLocation = () => {
    getCurrentLocation();
    setInputValue('');
    setSuggestions([]);
    setIsLocationOpen(false);
  };

  const navLinks = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'properties', path: '/properties', label: 'Properties', icon: Building2 },
    ...(userRole === 'agent'
      ? [{ id: 'create', path: '/create-property', label: 'List Property', icon: PlusCircle }]
      : [])
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="EstateHub Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`flex items-center gap-2 font-semibold transition-all ${
                    activeTab === link.id
                      ? 'text-teal-600'
                      : 'text-gray-600 hover:text-teal-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons & Location */}
          <div className="hidden md:flex items-center gap-4">
            {/* Location Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-teal-500 transition-all hover:shadow-md"
              >
                <MapPin className="h-5 w-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                  {userLocation.locationName}
                </span>
              </button>

              {/* Location Dropdown */}
              {isLocationOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => {
                      setIsLocationOpen(false);
                      setInputValue('');
                      setSuggestions([]);
                    }}
                  ></div>
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-20">
                    <h3 className="font-bold text-gray-800 mb-3">Choose Location</h3>
                    
                    <button
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all mb-3 font-semibold"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Use Current Location</span>
                    </button>

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Or search for a location:
                      </label>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Enter city name..."
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                      
                      {suggestions.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-xl max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-teal-50 transition-colors border-b last:border-b-0"
                            >
                              <div className="font-medium text-sm text-gray-800">
                                {suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.display_name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {inputValue.length >= 2 && suggestions.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2">No results found</p>
                      )}
                      
                      {inputValue.length < 2 && inputValue.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">Type at least 2 characters</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              to="/map"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              Find in Maps
            </Link>
            
            <button
              onClick={() => setIsProfileOpen(true)}
              className="relative group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-all duration-300 hover:scale-110 ring-2 ring-white hover:ring-teal-200">
                {storedUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-teal-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {/* Mobile Location Selector */}
              <div className="px-4">
                <button
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-teal-500 transition-all"
                >
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {userLocation.locationName}
                  </span>
                </button>

                {isLocationOpen && (
                  <div className="mt-2 bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-800 mb-3">Choose Location</h3>
                    
                    <button
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all mb-3 font-semibold"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Use Current Location</span>
                    </button>

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Or search for a location:
                      </label>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Enter city name..."
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      
                      {suggestions.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-teal-50 transition-colors border-b last:border-b-0"
                            >
                              <div className="font-medium text-sm text-gray-800">
                                {suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.display_name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
                      activeTab === link.id
                        ? 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              
              <div className="border-t pt-4 mt-2 flex flex-col gap-3 px-4">
                <Link
                  to="/map"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold text-center transition-all shadow-md"
                >
                  Find in Maps
                </Link>
                
                <button
                  onClick={() => {
                    setIsProfileOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-teal-500 transition-all"
                >
                  <User className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;