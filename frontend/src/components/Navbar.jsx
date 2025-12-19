import { useState, useEffect, useRef } from 'react';
import { MapPin, Menu, X, Home, Building2, PlusCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const { userLocation, setUserLocation } = useUser();
  const [activeTab, setActiveTab] = useState('home');
  const debounceTimer = useRef(null);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24';
  useEffect(() => {
    // Get user's current location on mount
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

    // Debounce the search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
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
  

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
    setInputValue('');
    setSuggestions([]);
    setIsLocationOpen(false);
  };

  const navLinks = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'properties', path: '/properties', label: 'Properties', icon: Building2 },
    { id: 'create', path: '/create-property', label: 'List Property', icon: PlusCircle }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Building2 className="h-8 w-8" />
            <span>EstateHub</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.path}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 font-semibold transition-colors ${
                    activeTab === link.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Desktop Auth Buttons & Location */}
          <div className="hidden md:flex items-center gap-4">
            {/* Location Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
              >
                <MapPin className="h-5 w-5 text-blue-600" />
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
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20">
                    <h3 className="font-semibold text-gray-800 mb-3">Choose Location</h3>
                    
                    <button
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors mb-3"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Use Current Location</span>
                    </button>

                    <div className="border-t pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or search for a location:
                      </label>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Enter city name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                      {/* Suggestions Dropdown */}
                      {suggestions.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0"
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
                        <p className="text-xs text-gray-500 mt-2">
                          No results found
                        </p>
                      )}
                      
                      {inputValue.length < 2 && inputValue.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Type at least 2 characters
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <a
              href="/map"
              className="bg-blue-900 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Find in Maps
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
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
                  className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                  {userLocation.locationName}
                  </span>
                </button>

                {isLocationOpen && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Choose Location</h3>
                    
                    <button
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors mb-3"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Use Current Location</span>
                    </button>

                    <div className="border-t pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or search for a location:
                      </label>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Enter city name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                      {/* Mobile Suggestions */}
                      {suggestions.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0"
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
                  <a
                    key={link.id}
                    href={link.path}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab(link.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      activeTab === link.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </a>
                );
              })}
              <div className="border-t pt-4 mt-2 flex flex-col gap-3 px-4">
                <a
                  href="/map"
                  className="bg-blue-900 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors text-center"
                >
                  Find in Maps
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;