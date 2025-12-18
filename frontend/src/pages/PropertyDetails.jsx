import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  MapPin, Bed, Bath, Maximize, Calendar, Home, Phone, Mail, 
  Share2, Heart, ChevronLeft, ChevronRight, X, Check, Car,
  Wifi, Droplet, Zap, Wind, Trees, Shield, Building2, User,
  MessageSquare, ArrowLeft, ExternalLink
} from 'lucide-react';
import axios from 'axios';

import API_BASE_URL from '../config';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
      setProperty(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details');
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

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! The property owner will contact you soon.');
    setShowContactForm(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const shareOnWhatsApp = async () => {
    if (!property) return;
  
    const pageUrl = window.location.href;
  
    const textMessage = `🏠 ${property.title}
📍 ${property.address.city}
💰 ${formatPrice(property.price)}

View full details:
${pageUrl}`;
  
    if (
      isMobile() &&
      navigator.share &&
      property.images &&
      property.images.length > 0
    ) {
      try {
        const imageUrl = property.images[0].url || property.images[0];
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "property.jpg", { type: blob.type });
  
        await navigator.share({
          title: property.title,
          text: textMessage,
          files: [file],
        });
  
        return;
      } catch (err) {
        console.warn("Image share failed, using link instead", err);
      }
    }
  
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Get map URL with coordinates - FIXED for Google Maps Embed
  // Get coordinates - check multiple possible locations in data structure
  const getCoordinates = () => {
    // Check various possible locations for coordinates
    if (property?.address?.location?.coordinates && Array.isArray(property.address.location.coordinates)) {
      return property.address.location.coordinates;
    }
    if (property?.location?.coordinates && Array.isArray(property.location.coordinates)) {
      return property.location.coordinates;
    }
    if (property?.coordinates && Array.isArray(property.coordinates)) {
      return property.coordinates;
    }
    return null;
  };

  const getMapUrl = () => {
    const coords = getCoordinates();
    if (!coords || coords.length < 2) return null;
    const [lng, lat] = coords;
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const getMapLinkUrl = () => {
    const coords = getCoordinates();
    if (!coords || coords.length < 2) return null;
    const [lng, lat] = coords;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Property not found'}</p>
          <Link to="/properties" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const amenityIcons = {
    parking: Car,
    wifi: Wifi,
    water: Droplet,
    electricity: Zap,
    ac: Wind,
    garden: Trees,
    security: Shield,
    elevator: Building2,
    gym: Building2
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:scale-110 transition-all`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={shareOnWhatsApp}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                title="Share on WhatsApp"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery - IMPROVED */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* Main Image Container with Aspect Ratio */}
          <div className="relative w-full bg-gray-00 rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex].url || property.images[currentImageIndex]}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-contain cursor-pointer bg-gray-100"
                  onClick={() => setShowImageModal(true)}
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all z-10"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all z-10"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="h-32 w-32 text-gray-600" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {property.images && property.images.length > 1 && (
            <div className="mt-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                      currentImageIndex === index 
                        ? 'ring-4 ring-blue-600 scale-105' 
                        : 'ring-2 ring-gray-200 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={image.url || image}
                      alt={`${property.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {currentImageIndex === index && (
                      <div className="absolute inset-0 bg-blue-600/20"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full capitalize">
                      {property.propertyType}
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full capitalize">
                      For {property.listingType}
                    </span>
                    {property.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">
                      {property.address.street && `${property.address.street}, `}
                      {property.address.city}, {property.address.state}
                      {property.address.zipCode && ` - ${property.address.zipCode}`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </div>
                  {property.listingType === 'rent' && (
                    <span className="text-sm text-gray-500">/month</span>
                  )}
                </div>
              </div>

              {/* Key Features */}
              {property.features && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                  {property.features.bedrooms > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Bed className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{property.features.bedrooms}</p>
                        <p className="text-sm text-gray-500">Bedrooms</p>
                      </div>
                    </div>
                  )}
                  {property.features.bathrooms > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Bath className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{property.features.bathrooms}</p>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                      </div>
                    </div>
                  )}
                  {property.features.area > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Maximize className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{property.features.area}</p>
                        <p className="text-sm text-gray-500">Sq Ft</p>
                      </div>
                    </div>
                  )}
                  {property.features.yearBuilt && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{property.features.yearBuilt}</p>
                        <p className="text-sm text-gray-500">Year Built</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="h-6 w-6 text-blue-600" />
                About This Property
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Project Details - NEW SECTION */}
            {property.projectDetails && (property.projectDetails.builderName || property.projectDetails.projectName || property.projectDetails.category) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  Project Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {property.projectDetails.builderName && (
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Builder Name</p>
                        <p className="text-lg font-bold text-gray-900">{property.projectDetails.builderName}</p>
                      </div>
                    </div>
                  )}
                  {property.projectDetails.projectName && (
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="bg-green-600 p-3 rounded-lg">
                        <Home className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Project Name</p>
                        <p className="text-lg font-bold text-gray-900">{property.projectDetails.projectName}</p>
                      </div>
                    </div>
                  )}
                
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Check className="h-6 w-6 text-blue-600" />
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => {
                    const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700 capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Map - OPENSTREETMAP WITH CUSTOM MARKER */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Location
                </h2>
                {getMapLinkUrl() && (
                  <a
                    href={getMapLinkUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              {(() => {
                const coords = getCoordinates();
                
                // Debug logging
                console.log('Property data:', property);
                console.log('Coordinates found:', coords);
                
                if (!coords || coords.length < 2) {
                  return (
                    <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-semibold">Location information unavailable</p>
                        <p className="text-sm mt-1">{property.address?.city}, {property.address?.state}</p>
                        <p className="text-xs mt-2 text-red-500">Debug: No coordinates found in property data</p>
                      </div>
                    </div>
                  );
                }

                const [lng, lat] = coords;
                const zoom = 15;
                
                // Get builder/project name for marker - UPDATED PATH
                const builderName = property.projectDetails?.builderName;
                const projectName = property.projectDetails?.projectName;
                const displayName = builderName || property.owner?.name || property.title;
                
                return (
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <div className="relative w-full h-full">
                      {/* Actual Interactive Map using iframe */}
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}&layer=mapnik&marker=${lat},${lng}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Property Location Map"
                      ></iframe>
                      
                      {/* Custom Marker Overlay with Builder/Project Name */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative" style={{ marginTop: '-60px' }}>
                          {/* Info Card Above Pin */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-auto">
                            <div className="bg-white rounded-lg shadow-xl px-4 py-3 min-w-max border-2 border-blue-500">
                              <div className="text-center">
                                {builderName && (
                                  <>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Builder</p>
                                    <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                                      {builderName}
                                    </p>
                                  </>
                                )}
                                {projectName && (
                                  <p className="text-xs text-blue-600 font-semibold mt-1">
                                    {projectName}
                                  </p>
                                )}
                                {!builderName && !projectName && (
                                  <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                                    {displayName}
                                  </p>
                                )}
                                {property.propertyType && (
                                  <p className="text-xs text-gray-600 font-medium capitalize mt-1">
                                    {property.propertyType} • For {property.listingType}
                                  </p>
                                )}
                              </div>
                              {/* Arrow pointing down */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"></div>
                                <div className="w-0 h-0 border-l-7 border-r-7 border-t-7 border-l-transparent border-r-transparent border-t-white absolute -top-px left-1/2 -translate-x-1/2"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Custom Marker Pin */}
                          <div className="relative">
                            {/* Pulsing Outer Ring */}
                            <div className="absolute inset-0 w-14 h-14 -left-1 -top-1">
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
                            </div>
                            
                            {/* Main Pin */}
                            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                              <Building2 className="h-6 w-6 text-white" />
                            </div>
                            
                            {/* Pin Shadow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/40 rounded-full blur-md"></div>
                            
                            {/* Pin Stem */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-blue-700 to-transparent"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-gray-700 font-medium flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {property.address?.street && `${property.address.street}, `}
                    {property.address?.city}, {property.address?.state}
                    {property.address?.zipCode && ` - ${property.address.zipCode}`}
                  </span>
                </p>
                {(() => {
                  const coords = getCoordinates();
                  if (coords && coords.length >= 2) {
                    return (
                      <p className="text-sm text-gray-500 mt-2 ml-7">
                        Coordinates: {coords[1].toFixed(6)}, {coords[0].toFixed(6)}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Property Owner</h3>
                
                {property.owner && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="bg-blue-600 p-3 rounded-full">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{property.owner.name || 'Property Owner'}</p>
                      <p className="text-sm text-blue-600">✓ Verified Owner</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Send Message
                  </button>
                  <a
                    href={`tel:${property.owner?.phone || ''}`}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all block text-center shadow-sm hover:shadow-md"
                  >
                    <Phone className="h-5 w-5" />
                    Call Now
                  </a>
                 
                  <button
                    onClick={shareOnWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <Share2 className="h-5 w-5" />
                    Share on WhatsApp
                  </button>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Property ID</span>
                    <span className="font-semibold text-gray-900">#{property._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Type</span>
                    <span className="font-semibold text-gray-900 capitalize">{property.propertyType}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className="font-semibold text-green-600 capitalize flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      {property.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Listed For</span>
                    <span className="font-semibold text-gray-900 capitalize">{property.listingType}</span>
                  </div>
                  {property.features?.yearBuilt && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Year Built</span>
                      <span className="font-semibold text-gray-900">{property.features.yearBuilt}</span>
                    </div>
                  )}
                  {property.features?.area && (
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600 font-medium">Total Area</span>
                      <span className="font-semibold text-gray-900">{property.features.area.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Send Message</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="I'm interested in this property..."
                  rows="4"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal - IMPROVED */}
      {showImageModal && property.images && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={property.images[currentImageIndex].url || property.images[currentImageIndex]}
            alt={property.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full font-semibold">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;