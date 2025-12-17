import { useState, useEffect, useRef } from 'react';
import { Home, MapPin, DollarSign, Bed, Bath, Maximize, Upload, X, Plus, ArrowLeft, Check, AlertCircle, Map, Building2, Ruler } from 'lucide-react';

// Mock API_BASE_URL - replace with your actual config
import API_BASE_URL from '../config';
const GOOGLE_MAPS_API_KEY = 'AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24';

const CreateProperty = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMapRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    listingType: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [76.2711, 9.9312] // Default: Thiruvananthapuram, Kerala
    },
    projectDetails: {
      builderName: '',
      projectName: '',
      category: 'standard'
    },
    features: {
      bedrooms: '',
      bathrooms: '',
      area: '',
      areaUnit: 'sqft', // For land: sqft, cent, acre, etc.
      parking: '',
      yearBuilt: '',
      landType: 'vacant' // For land: vacant, with_house, with_building
    },
    amenities: [],
    status: 'available'
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'];
  const listingTypes = ['sale', 'rent'];
  const projectCategories = ['premium', 'standard', 'luxury', 'affordable'];
  const areaUnits = ['sqft', 'cent', 'acre', 'hectare', 'sqm'];
  const landTypes = [
    { value: 'vacant', label: 'Vacant Land' },
    { value: 'with_house', label: 'Land with House' },
    { value: 'with_building', label: 'Land with Building' },
    { value: 'agricultural', label: 'Agricultural Land' }
  ];

  // Helper functions to determine what fields to show based on property type
  const showProjectDetails = () => {
    return ['apartment', 'condo'].includes(formData.propertyType);
  };

  const showBedroomsBathrooms = () => {
    return ['house', 'apartment', 'condo', 'townhouse'].includes(formData.propertyType);
  };

  const showYearBuilt = () => {
    return ['house', 'apartment', 'condo', 'townhouse', 'commercial'].includes(formData.propertyType);
  };

  // Load Google Maps Script
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    
    if (window.google && window.google.maps) {
      setMapLoaded(true);
    } else if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setError('Failed to load Google Maps. Please check your API key.');
      };
      document.head.appendChild(script);
    }
  }, []);

  // Initialize map when modal opens
  useEffect(() => {
    if (showMap && mapLoaded && mapRef.current && !googleMapRef.current) {
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
    
    return () => {
      if (!showMap && googleMapRef.current) {
        googleMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap, mapLoaded]);

  const initializeMap = () => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    const [lng, lat] = formData.location.coordinates;
    
    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
      });

      googleMapRef.current = map;

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      marker.addListener('dragend', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateLocation(lng, lat);
        reverseGeocode(lat, lng);
      });

      map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({ lat, lng });
        updateLocation(lng, lat);
        reverseGeocode(lat, lng);
      });

      const input = document.getElementById('map-search-input');
      if (input) {
        const searchBox = new window.google.maps.places.SearchBox(input);
        
        map.addListener('bounds_changed', () => {
          searchBox.setBounds(map.getBounds());
        });

        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          map.setCenter({ lat, lng });
          map.setZoom(15);
          marker.setPosition({ lat, lng });
          updateLocation(lng, lat);
          
          if (place.address_components) {
            updateAddressFromPlace(place);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please try again.');
    }
  };

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        updateAddressFromPlace(results[0]);
      }
    });
  };

  const updateAddressFromPlace = (place) => {
    const components = place.address_components || [];
    const addressData = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    };

    components.forEach(component => {
      const types = component.types;
      if (types.includes('street_number') || types.includes('route')) {
        addressData.street += component.long_name + ' ';
      }
      if (types.includes('locality')) {
        addressData.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        addressData.state = component.long_name;
      }
      if (types.includes('postal_code')) {
        addressData.zipCode = component.long_name;
      }
      if (types.includes('country')) {
        addressData.country = component.long_name;
      }
    });

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...addressData,
        street: addressData.street.trim() || prev.address.street
      }
    }));
  };

  const updateLocation = (lng, lat) => {
    setFormData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        updateLocation(lng, lat);
        reverseGeocode(lat, lng);
        
        setGettingLocation(false);
        setSuccess('Current location detected successfully!');
        setTimeout(() => setSuccess(''), 3000);

        if (googleMapRef.current && markerRef.current) {
          googleMapRef.current.setCenter({ lat, lng });
          googleMapRef.current.setZoom(15);
          markerRef.current.setPosition({ lat, lng });
        }
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Unable to get your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.title || !formData.price || !formData.propertyType || !formData.listingType) {
      setError('Please fill in all required fields (Title, Price, Property Type, Listing Type)');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('listingType', formData.listingType);
      formDataToSend.append('status', 'available');

      formDataToSend.append('address', JSON.stringify({
        street: formData.address.street || '',
        city: formData.address.city || '',
        state: formData.address.state || '',
        zipCode: formData.address.zipCode || '',
        country: formData.address.country || 'India'
      }));

      formDataToSend.append('location', JSON.stringify(formData.location));

      // Only add project details for apartments and condos
      if (showProjectDetails()) {
        formDataToSend.append('projectDetails', JSON.stringify({
          builderName: formData.projectDetails.builderName || '',
          projectName: formData.projectDetails.projectName || '',
          category: formData.projectDetails.category || 'standard'
        }));
      }

      formDataToSend.append('features', JSON.stringify({
        bedrooms: formData.features.bedrooms ? parseInt(formData.features.bedrooms) : 0,
        bathrooms: formData.features.bathrooms ? parseInt(formData.features.bathrooms) : 0,
        area: formData.features.area ? parseFloat(formData.features.area) : 0,
        areaUnit: formData.features.areaUnit || 'sqft',
        parking: formData.features.parking ? parseInt(formData.features.parking) : 0,
        yearBuilt: formData.features.yearBuilt ? parseInt(formData.features.yearBuilt) : new Date().getFullYear(),
        landType: formData.propertyType === 'land' ? formData.features.landType : undefined
      }));

      formDataToSend.append('amenities', JSON.stringify(formData.amenities));

      images.forEach((image) => {
        formDataToSend.append('images', image.file);
      });

      console.log("Uploading property...");

      const response = await fetch(`${API_BASE_URL}/api/properties`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create property');

      const result = await response.json();
      console.log('Property created successfully:', result);

      setSuccess('Property created successfully!');

      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          price: '',
          propertyType: '',
          listingType: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
          },
          location: {
            type: 'Point',
            coordinates: [76.2711, 9.9312]
          },
          projectDetails: {
            builderName: '',
            projectName: '',
            category: 'standard'
          },
          features: {
            bedrooms: '',
            bathrooms: '',
            area: '',
            areaUnit: 'sqft',
            parking: '',
            yearBuilt: '',
            landType: 'vacant'
          },
          amenities: [],
          status: 'available',
        });
        setImages([]);
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Error creating property:', err);
      setError(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
              List Your Property
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100">
              Fill in the details to list your property for sale or rent
            </p>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Select Property Location</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <input
                id="map-search-input"
                type="text"
                placeholder="Search for a location..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-96" />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600 mb-3">
                <p className="font-semibold mb-1">Selected Coordinates:</p>
                <p>Longitude: {formData.location.coordinates[0].toFixed(6)}</p>
                <p>Latitude: {formData.location.coordinates[1].toFixed(6)}</p>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold mb-1">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-green-800 font-semibold mb-1">Success</h3>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Home className="h-6 w-6 text-blue-600" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Modern 3BHK Villa in Downtown"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows="4"
                  placeholder="Describe your property..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  >
                    <option value="">Select Type</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Listing Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => handleChange('listingType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="5000000"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project Details - Only for Apartments and Condos */}
          {showProjectDetails() && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Project Details
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Builder Name
                    </label>
                    <input
                      type="text"
                      value={formData.projectDetails.builderName}
                      onChange={(e) => handleChange('projectDetails.builderName', e.target.value)}
                      placeholder="e.g., ABC Builders Pvt Ltd"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.projectDetails.projectName}
                      onChange={(e) => handleChange('projectDetails.projectName', e.target.value)}
                      placeholder="e.g., Green Valley Apartments"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.projectDetails.category}
                    onChange={(e) => handleChange('projectDetails.category', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  >
                    {projectCategories.map(cat => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Location with Map */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                Location
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {gettingLocation ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Getting...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Current
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <Map className="h-4 w-4" />
                  Open Map
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    placeholder="Thiruvananthapuram"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleChange('address.state', e.target.value)}
                    placeholder="Kerala"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleChange('address.zipCode', e.target.value)}
                    placeholder="695001"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => handleChange('address.country', e.target.value)}
                  placeholder="India"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold mb-1">Current Coordinates</p>
                <p className="text-sm text-blue-600">
                  Longitude: {formData.location.coordinates[0].toFixed(6)}, 
                  Latitude: {formData.location.coordinates[1].toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Features - Conditional based on property type */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Maximize className="h-6 w-6 text-blue-600" />
              Property Features
            </h2>

            <div className="space-y-4">
              {/* Land Type - Only for land */}
              {formData.propertyType === 'land' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Land Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.features.landType}
                    onChange={(e) => handleChange('features.landType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  >
                    {landTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Area with Unit Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-500" />
                    {formData.propertyType === 'land' ? 'Land Area' : 'Built-up Area'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.features.area}
                    onChange={(e) => handleChange('features.area', e.target.value)}
                    placeholder={formData.propertyType === 'land' ? '10' : '1500'}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.features.areaUnit}
                    onChange={(e) => handleChange('features.areaUnit', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  >
                    {areaUnits.map(unit => (
                      <option key={unit} value={unit}>
                        {unit === 'sqft' ? 'Square Feet (sq ft)' :
                         unit === 'sqm' ? 'Square Meters (sq m)' :
                         unit === 'cent' ? 'Cent' :
                         unit === 'acre' ? 'Acre' :
                         'Hectare'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bedrooms and Bathrooms - Only for house, apartment, condo, townhouse, OR land with house/building */}
              {(showBedroomsBathrooms() || 
                (formData.propertyType === 'land' && ['with_house', 'with_building'].includes(formData.features.landType))) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Bed className="h-4 w-4 text-gray-500" />
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={formData.features.bedrooms}
                      onChange={(e) => handleChange('features.bedrooms', e.target.value)}
                      placeholder="3"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Bath className="h-4 w-4 text-gray-500" />
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={formData.features.bathrooms}
                      onChange={(e) => handleChange('features.bathrooms', e.target.value)}
                      placeholder="2"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Parking - For all except vacant land */}
                {!(formData.propertyType === 'land' && formData.features.landType === 'vacant') && 
                 formData.propertyType !== 'land' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      value={formData.features.parking}
                      onChange={(e) => handleChange('features.parking', e.target.value)}
                      placeholder="2"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>
                )}

                {/* Year Built - For house, apartment, condo, townhouse, commercial, OR land with house/building */}
                {(showYearBuilt() || 
                  (formData.propertyType === 'land' && ['with_house', 'with_building'].includes(formData.features.landType))) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {formData.propertyType === 'land' ? 'Building Year' : 'Year Built / Completion Year'}
                    </label>
                    <input
                      type="number"
                      value={formData.features.yearBuilt}
                      onChange={(e) => handleChange('features.yearBuilt', e.target.value)}
                      placeholder="2020"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Property type specific hints */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {formData.propertyType === 'land' && formData.features.landType === 'vacant' && 
                  '💡 Vacant Land: Specify total area in cents/acres. Add details about boundaries, road access, and zoning.'}
                {formData.propertyType === 'land' && formData.features.landType === 'with_house' && 
                  '💡 Land with House: Include both land area and house details (bedrooms, bathrooms, year built).'}
                {formData.propertyType === 'land' && formData.features.landType === 'with_building' && 
                  '💡 Land with Building: Specify land area and building specifications.'}
                {formData.propertyType === 'land' && formData.features.landType === 'agricultural' && 
                  '💡 Agricultural Land: Mention soil type, water source, and crops if any.'}
                {formData.propertyType === 'house' && '💡 For houses: Include bedrooms, bathrooms, total area, and year built'}
                {formData.propertyType === 'apartment' && '💡 For apartments: Include builder name, project details, and unit specifications'}
                {formData.propertyType === 'condo' && '💡 For condos: Include builder name, project details, and unit specifications'}
                {formData.propertyType === 'townhouse' && '💡 For townhouses: Include bedrooms, bathrooms, and built year'}
                {formData.propertyType === 'commercial' && '💡 For commercial: Include total area, parking, and year built'}
                {!formData.propertyType && '👆 Select a property type above to see relevant fields'}
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                placeholder="Add amenity (e.g., Swimming Pool)"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="h-6 w-6 text-blue-600" />
              Property Images
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-all">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="text-gray-600 font-semibold">Click to upload images</span>
                <span className="text-sm text-gray-500">or drag and drop</span>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Creating Property...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Create Property
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;