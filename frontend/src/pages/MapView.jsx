import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, MapPin, Home, Bed, Bath, Maximize, 
  List, Globe, Building2, ArrowLeft, Phone, MessageSquare,
  Navigation, Loader, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.29.67:8081';

// Distance in kilometers to search for nearby properties
const SEARCH_RADIUS_KM = 10;

const PropertyMapView = () => {
  const navigate = useNavigate();
  const [allProperties, setAllProperties] = useState([]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    fetchProperties();
    getUserLocation();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setLocationLoading(false);
        
        // Filter properties based on this location
        if (allProperties.length > 0) {
          filterNearbyProperties(allProperties, location);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to get your location. Please enable location services.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const filterNearbyProperties = (properties, location) => {
    if (!location) return;

    const propertiesWithDistance = properties.map(prop => {
      const coords = getPropertyCoordinates(prop);
      if (!coords) return null;
      
      const [lng, lat] = coords;
      const distance = calculateDistance(location.lat, location.lng, lat, lng);
      
      return {
        ...prop,
        distance: distance
      };
    }).filter(prop => prop !== null && prop.distance <= SEARCH_RADIUS_KM);

    // Sort by distance
    propertiesWithDistance.sort((a, b) => a.distance - b.distance);
    
    console.log(`Found ${propertiesWithDistance.length} properties within ${SEARCH_RADIUS_KM}km`);
    setNearbyProperties(propertiesWithDistance);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/properties`);
      
      const allProps = response.data.properties || response.data;
      
      // Filter properties with valid coordinates (excluding [0, 0])
      const propertiesWithCoords = allProps.filter(prop => {
        const coords = prop.location?.coordinates;
        if (!coords || !Array.isArray(coords) || coords.length !== 2) {
          return false;
        }
        const [lng, lat] = coords;
        return lat !== 0 && lng !== 0;
      });
      
      setAllProperties(propertiesWithCoords);
      
      // If user location is already available, filter immediately
      if (userLocation) {
        filterNearbyProperties(propertiesWithCoords, userLocation);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter nearby properties when user location changes
  useEffect(() => {
    if (userLocation && allProperties.length > 0) {
      filterNearbyProperties(allProperties, userLocation);
    }
  }, [userLocation, allProperties]);

  const getPropertyCoordinates = (property) => {
    if (property.location?.coordinates && Array.isArray(property.location.coordinates)) {
      return property.location.coordinates;
    }
    if (property.address?.location?.coordinates && Array.isArray(property.address.location.coordinates)) {
      return property.address.location.coordinates;
    }
    return null;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m away`;
    }
    return `${km.toFixed(1)}km away`;
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const getLeafletMapHtml = () => {
    if (!userLocation || nearbyProperties.length === 0) return '';
    
    const markers = nearbyProperties.map((p) => {
      const coord = getPropertyCoordinates(p);
      if (!coord) return '';
      const [lng, lat] = coord;
      const builderName = p.projectDetails?.builderName || '';
      const builderLogo = p.projectDetails?.builderLogo || p.projectDetails?.logo || '';
      const projectName = p.projectDetails?.projectName || p.title;
      
      // Create marker content - show logo if available, otherwise show builder name initial or house icon
      let markerContent = '';
      if (builderLogo) {
        markerContent = `<div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); overflow: hidden; background: white;"><img src="${builderLogo}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;background:#dc2626;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;\\'>${builderName.charAt(0).toUpperCase()}</div>';" /></div>`;
      } else if (builderName) {
        markerContent = `<div style="background: #dc2626; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; cursor: pointer;">${builderName.charAt(0).toUpperCase()}</div>`;
      } else {
        markerContent = `<div style="background: #dc2626; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></div>`;
      }
      
      return `
        L.marker([${lat}, ${lng}], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '${markerContent}',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          })
        })
        .addTo(map)
        .bindPopup(\`
          <div style="min-width: 240px;">
            ${builderLogo ? `<div style="text-align: center; margin-bottom: 8px;"><img src="${builderLogo}" alt="Builder Logo" style="max-width: 80px; max-height: 40px; object-fit: contain;" onerror="this.style.display='none';" /></div>` : ''}
            ${builderName ? `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px; border-radius: 6px; margin-bottom: 8px; text-align: center;"><p style="margin: 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Builder</p><p style="margin: 0; font-size: 14px; font-weight: bold;">${builderName}</p></div>` : ''}
            <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: bold; color: #1f2937;">${projectName}</h3>
            <p style="margin: 0 0 4px 0; font-size: 16px; color: #2563eb; font-weight: bold;">${formatPrice(p.price)}</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #059669; font-weight: 600;">📍 ${formatDistance(p.distance)}</p>
            <button onclick="window.viewProperty('${p._id}')" style="width: 100%; background: #2563eb; color: white; padding: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">View Details</button>
          </div>
        \`)
        .on('click', function() {
          window.selectProperty('${p._id}');
        });
      `;
    }).join('\n');

    const userMarker = `
      L.marker([${userLocation.lat}, ${userLocation.lng}], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative;"><div style="position: absolute; inset: 0; background: #2563eb; border-radius: 50%; animation: pulse 2s infinite;"></div></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      })
      .addTo(map)
      .bindPopup('<div style="text-align: center; font-weight: bold;">📍 You are here</div>');
    `;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100vw; height: 100vh; }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(2); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${userLocation.lat}, ${userLocation.lng}], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    ${userMarker}
    ${markers}

    // Draw circle showing search radius
    L.circle([${userLocation.lat}, ${userLocation.lng}], {
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      radius: ${SEARCH_RADIUS_KM * 1000}
    }).addTo(map);

    window.selectProperty = function(id) {
      window.parent.postMessage({ type: 'selectProperty', id: id }, '*');
    };

    window.viewProperty = function(id) {
      window.parent.postMessage({ type: 'viewProperty', id: id }, '*');
    };
  </script>
</body>
</html>
    `;
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'selectProperty') {
        const property = nearbyProperties.find(p => p._id === event.data.id);
        if (property) {
          setSelectedProperty(property);
        }
      } else if (event.data.type === 'viewProperty') {
        navigate(`/properties/${event.data.id}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [nearbyProperties, navigate]);

  if (loading || locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            {locationLoading ? 'Getting your location...' : 'Loading properties...'}
          </p>
          {!locationLoading && (
            <p className="text-sm text-gray-500 mt-2">{allProperties.length} properties found</p>
          )}
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Access Required</h2>
          <p className="text-gray-600 mb-4">{locationError}</p>
          <div className="space-y-2">
            <button
              onClick={getUserLocation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold"
            >
              View All Properties Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Navigation className="h-24 w-24 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Getting Your Location</h2>
          <p className="text-gray-600">Please allow location access to see nearby properties</p>
        </div>
      </div>
    );
  }

  if (nearbyProperties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <MapPin className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Nearby Properties</h2>
          <p className="text-gray-600 mb-4">
            No properties found within {SEARCH_RADIUS_KM}km of your location.
          </p>
          <div className="space-y-2">
            <button
              onClick={getUserLocation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Navigation className="h-5 w-5" />
              Refresh Location
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold"
            >
              View All Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Nearby Properties
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={getUserLocation}
            disabled={locationLoading}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-all text-sm"
            title="Refresh location"
          >
            {locationLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <span className="text-sm text-gray-600 hidden sm:block">
            {nearbyProperties.length} nearby
          </span>
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          >
            <List className="h-4 w-4" />
            All Properties
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 relative p-4">
  <div className="max-w-6xl mx-auto h-[70vh] bg-white rounded-xl shadow-lg overflow-hidden border">
    {userLocation && nearbyProperties.length > 0 && (
      <iframe
        srcDoc={getLeafletMapHtml()}
        className="w-full h-full border-0"
        title="Nearby Properties Map"
        allow="geolocation"
      />
    )}
  </div>
</div>


        {/* Property Details Sidebar */}
        {selectedProperty && (
          <div className="w-full md:w-96 bg-white shadow-xl overflow-y-auto border-l border-gray-200 absolute md:relative right-0 top-0 h-full z-20">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Property Details</h3>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4">
              {/* Property Image */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="mb-4 relative h-48 bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={selectedProperty.images[0].url || selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedProperty.featured && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                  {selectedProperty.distance !== undefined && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      📍 {formatDistance(selectedProperty.distance)}
                    </span>
                  )}
                </div>
              )}

              {/* Property Info */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded capitalize">
                      {selectedProperty.propertyType}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded capitalize">
                      For {selectedProperty.listingType}
                    </span>
                    {selectedProperty.projectDetails?.category && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded capitalize">
                        {selectedProperty.projectDetails.category}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedProperty.title}
                  </h4>
                  <div className="flex items-start text-gray-600 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>
                      {selectedProperty.address?.street && `${selectedProperty.address.street}, `}
                      {selectedProperty.address?.city}, {selectedProperty.address?.state}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedProperty.price)}
                    {selectedProperty.listingType === 'rent' && (
                      <span className="text-sm text-gray-500">/month</span>
                    )}
                  </p>
                </div>

                {/* Project Details */}
                {selectedProperty.projectDetails && (selectedProperty.projectDetails.builderName || selectedProperty.projectDetails.projectName || selectedProperty.projectDetails.builderLogo || selectedProperty.projectDetails.logo) && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    {(selectedProperty.projectDetails.builderLogo || selectedProperty.projectDetails.logo) && (
                      <div className="flex justify-center mb-3">
                        <img 
                          src={selectedProperty.projectDetails.builderLogo || selectedProperty.projectDetails.logo} 
                          alt="Builder Logo"
                          className="max-h-16 max-w-full object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    {selectedProperty.projectDetails.builderName && (
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-gray-600 font-medium">Builder:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {selectedProperty.projectDetails.builderName}
                        </span>
                      </div>
                    )}
                    {selectedProperty.projectDetails.projectName && (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-gray-600 font-medium">Project:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {selectedProperty.projectDetails.projectName}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Features */}
                {selectedProperty.features && (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProperty.features.bedrooms > 0 && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Bed className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{selectedProperty.features.bedrooms}</p>
                        <p className="text-xs text-gray-500">Beds</p>
                      </div>
                    )}
                    {selectedProperty.features.bathrooms > 0 && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Bath className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{selectedProperty.features.bathrooms}</p>
                        <p className="text-xs text-gray-500">Baths</p>
                      </div>
                    )}
                    {selectedProperty.features.area > 0 && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Maximize className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{selectedProperty.features.area}</p>
                        <p className="text-xs text-gray-500">Sq Ft</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {selectedProperty.description && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {selectedProperty.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  <button
                    onClick={() => navigate(`/property-details/${selectedProperty._id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Home className="h-5 w-5" />
                    View Full Details
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${selectedProperty.owner?.phone || ''}`}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                    <button
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Badges */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            <span className="text-blue-600">{nearbyProperties.length}</span> properties within {SEARCH_RADIUS_KM}km
          </p>
        </div>
        {userLocation && (
          <div className="bg-blue-600 px-4 py-2 rounded-full shadow-lg border border-blue-700">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Your location
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyMapView;