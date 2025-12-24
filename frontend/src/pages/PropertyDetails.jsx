import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  MapPin, Bed, Bath, Maximize, Calendar, Home, Phone,
  Share2, Heart, ChevronLeft, ChevronRight, X, Check, Car,
  Wifi, Droplet, Zap, Wind, Trees, Shield, Building2, User,
  MessageSquare, ArrowLeft, ExternalLink, Star, Award
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! The property owner will contact you soon.');
    setShowContactForm(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const shareOnWhatsApp = async () => {
    if (!property) return;
    
    const pageUrl = window.location.href;
    
    // Create a detailed, attractive message
    let message = `🏡 *${property.title}*\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Property Type and Status
    message += `📋 *Property Details:*\n`;
    message += `• Type: ${property.propertyType}\n`;
    message += `• For: ${property.listingType === 'sale' ? 'Sale' : 'Rent'}\n`;
    if (property.status) {
      message += `• Status: ${property.status}\n`;
    }
    message += `\n`;
    
    // Features
    if (property.features) {
      message += `✨ *Features:*\n`;
      if (property.features.bedrooms > 0) {
        message += `• 🛏️ ${property.features.bedrooms} Bedroom${property.features.bedrooms > 1 ? 's' : ''}\n`;
      }
      if (property.features.bathrooms > 0) {
        message += `• 🚿 ${property.features.bathrooms} Bathroom${property.features.bathrooms > 1 ? 's' : ''}\n`;
      }
      if (property.features.area > 0) {
        message += `• 📐 ${property.features.area.toLocaleString()} sq ft\n`;
      }
      if (property.features.yearBuilt) {
        message += `• 📅 Built in ${property.features.yearBuilt}\n`;
      }
      message += `\n`;
    }
    
    // Amenities (first 6)
    if (property.amenities && property.amenities.length > 0) {
      message += `🎯 *Amenities:*\n`;
      const displayAmenities = property.amenities.slice(0, 6);
      displayAmenities.forEach(amenity => {
        message += `• ${amenity}\n`;
      });
      if (property.amenities.length > 6) {
        message += `• +${property.amenities.length - 6} more...\n`;
      }
      message += `\n`;
    }
    
    // Project Details
    if (property.projectDetails && (property.projectDetails.builderName || property.projectDetails.projectName)) {
      message += `🏗️ *Project Info:*\n`;
      if (property.projectDetails.builderName) {
        message += `• Builder: ${property.projectDetails.builderName}\n`;
      }
      if (property.projectDetails.projectName) {
        message += `• Project: ${property.projectDetails.projectName}\n`;
      }
      message += `\n`;
    }
    
    // Location
    message += `📍 *Location:*\n`;
    if (property.address.street) {
      message += `${property.address.street}, `;
    }
    message += `${property.address.city}, ${property.address.state}`;
    if (property.address.zipCode) {
      message += ` - ${property.address.zipCode}`;
    }
    message += `\n\n`;
    
    // Price - highlighted
    message += `💰 *Price:*\n`;
    message += `*${formatPrice(property.price)}*`;
    if (property.listingType === 'rent') {
      message += ` /month`;
    }
    message += `\n\n`;
    
    // Call to action
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `🔗 *View Full Details:*\n${pageUrl}\n\n`;
    
    if (property.owner?.phone) {
      message += `📞 *Contact:* ${property.owner.phone}\n`;
    }
    
    message += `\n✨ Don't miss this opportunity!`;
    
    // Try to share with image on mobile devices
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share && property.images && property.images.length > 0) {
      try {
        const imageUrl = property.images[0].url || property.images[0];
        
        // Try to fetch and share the image
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "property.jpg", { type: blob.type });
          
          await navigator.share({
            title: property.title,
            text: message,
            files: [file],
          });
          return;
        } catch (err) {
          console.warn("Image share failed, sharing text only", err);
        }
      } catch (err) {
        console.warn("Share API failed", err);
      }
    }
    
    // Fallback to WhatsApp URL
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const getCoordinates = () => {
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

  const getMapLinkUrl = () => {
    const coords = getCoordinates();
    if (!coords || coords.length < 2) return null;
    const [lng, lat] = coords;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <X className="h-12 w-12 text-red-600" />
          </div>
          <p className="text-red-600 text-2xl font-bold mb-4">{error || 'Property not found'}</p>
          <button 
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Properties
          </button>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Premium Header with Gradient */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-teal-100 font-semibold transition-colors group"
            >
              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="hidden sm:inline">Back to Properties</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-xl ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'} transition-all`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={shareOnWhatsApp}
                className="p-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
                title="Share on WhatsApp"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* Featured Badge */}
          {property.featured && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                <Star className="h-5 w-5 fill-current" />
                Featured Property
              </div>
            </div>
          )}

          {/* Main Image Grid */}
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {property.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setShowImageModal(true);
                  }}
                  className={`relative rounded-xl overflow-hidden cursor-pointer group ${
                    index === 0 ? 'col-span-2 md:col-span-2 md:row-span-2 h-64 md:h-full' : 'h-32 md:h-48'
                  }`}
                >
                  <img
                    src={image.url || image}
                    alt={`${property.title} - ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                  
                  {/* "View All" overlay on last image if more than 4 images */}
                  {index === 3 && property.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-3xl font-bold mb-1">+{property.images.length - 4}</div>
                        <div className="text-sm font-semibold">More Photos</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
              <Home className="h-20 w-20 text-gray-400" />
            </div>
          )}

          {/* Property Title and Info */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <span className="text-gray-600 font-semibold">{property.address?.city}, {property.address?.state}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                {formatPrice(property.price)}
              </div>
              {property.listingType === 'rent' && (
                <span className="text-lg text-gray-500 font-semibold">/month</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Property Header Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-4 flex-wrap">
                    <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full capitalize">
                      {property.propertyType}
                    </span>
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full capitalize">
                      For {property.listingType}
                    </span>
                    <span className="flex items-center gap-2 bg-green-100 text-green-700 text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      {property.status || 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features Grid */}
              {property.features && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 border-t border-gray-200">
                  {property.features.bedrooms > 0 && (
                    <div className="text-center group">
                      <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                        <Bed className="h-6 w-6 md:h-8 md:w-8 text-teal-600" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{property.features.bedrooms}</p>
                      <p className="text-xs md:text-sm text-gray-500 font-medium">Bedrooms</p>
                    </div>
                  )}
                  {property.features.bathrooms > 0 && (
                    <div className="text-center group">
                      <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                        <Bath className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{property.features.bathrooms}</p>
                      <p className="text-xs md:text-sm text-gray-500 font-medium">Bathrooms</p>
                    </div>
                  )}
                  {property.features.area > 0 && (
                    <div className="text-center group">
                      <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                        <Maximize className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{property.features.area}</p>
                      <p className="text-xs md:text-sm text-gray-500 font-medium">Sq Ft</p>
                    </div>
                  )}
                  {property.features.yearBuilt && (
                    <div className="text-center group">
                      <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                        <Calendar className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{property.features.yearBuilt}</p>
                      <p className="text-xs md:text-sm text-gray-500 font-medium">Year Built</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2.5 md:p-3 rounded-xl">
                  <Home className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                About This Property
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Project Details */}
            {property.projectDetails && (property.projectDetails.builderName || property.projectDetails.projectName) && (
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 md:p-3 rounded-xl">
                    <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  Project Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {property.projectDetails.builderName && (
                    <div className="bg-white rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 md:p-4 rounded-xl flex-shrink-0">
                          <Building2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Builder Name</p>
                          <p className="text-lg md:text-xl font-bold text-gray-900 truncate">{property.projectDetails.builderName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {property.projectDetails.projectName && (
                    <div className="bg-white rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 md:p-4 rounded-xl flex-shrink-0">
                          <Home className="h-6 w-6 md:h-7 md:w-7 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-teal-600 font-bold uppercase tracking-wide mb-1">Project Name</p>
                          <p className="text-lg md:text-xl font-bold text-gray-900 truncate">{property.projectDetails.projectName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 md:p-3 rounded-xl">
                    <Check className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {property.amenities.map((amenity, index) => {
                    const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                    return (
                      <div key={index} className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-teal-50 hover:to-teal-100 transition-all group">
                        <div className="bg-white p-2 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                          <Icon className="h-4 w-4 md:h-5 md:w-5 text-teal-600" />
                        </div>
                        <span className="text-gray-700 font-semibold capitalize text-sm md:text-base truncate">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Map */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 md:p-3 rounded-xl">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <span className="hidden sm:inline">Location</span>
                </h2>
                {getMapLinkUrl() && (
                  <a
                    href={getMapLinkUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-xs md:text-sm"
                  >
                    <span className="hidden sm:inline">Open in Maps</span>
                    <span className="sm:hidden">Maps</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              {(() => {
                const coords = getCoordinates();
                
                if (!coords || coords.length < 2) {
                  return (
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-64 md:h-96 rounded-xl flex items-center justify-center">
                      <div className="text-center text-gray-500 px-4">
                        <MapPin className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2" />
                        <p className="font-semibold text-sm md:text-base">Location information unavailable</p>
                      </div>
                    </div>
                  );
                }

                const [lng, lat] = coords;
                
                return (
                  <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden border-4 border-gray-200">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}&layer=mapnik&marker=${lat},${lng}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Property Location Map"
                    ></iframe>
                  </div>
                );
              })()}
              
              <div className="mt-4 md:mt-6 p-4 md:p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-100">
                <p className="text-gray-700 font-semibold flex items-start gap-3 text-base md:text-lg">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {property.address?.street && `${property.address.street}, `}
                    {property.address?.city}, {property.address?.state}
                    {property.address?.zipCode && ` - ${property.address.zipCode}`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-2xl p-6 md:p-8 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Contact Owner</h3>
                
                {property.owner && (
                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 p-4 md:p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                    <div className="bg-white p-3 md:p-4 rounded-full flex-shrink-0">
                      <User className="h-6 w-6 md:h-7 md:w-7 text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-base md:text-lg truncate">{property.owner.name || 'Property Owner'}</p>
                      <p className="text-xs md:text-sm text-teal-100 flex items-center gap-1">
                        <Check className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span>Verified Owner</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-white hover:bg-gray-100 text-teal-700 py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm md:text-base"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Send Message
                  </button>
                  <a
                    href={`tel:${property.owner?.phone || ''}`}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all block text-center shadow-lg hover:shadow-xl hover:scale-105 text-sm md:text-base"
                  >
                    <Phone className="h-5 w-5" />
                    Call Now
                  </a>
                  <button
                    onClick={shareOnWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm md:text-base"
                  >
                    <Share2 className="h-5 w-5" />
                    Share on WhatsApp
                  </button>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Property Details</h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between py-3 md:py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-semibold text-sm md:text-base">Property ID</span>
                    <span className="font-bold text-gray-900 text-sm md:text-base">#{property._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-3 md:py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-semibold text-sm md:text-base">Type</span>
                    <span className="font-bold text-gray-900 capitalize text-sm md:text-base">{property.propertyType}</span>
                  </div>
                  <div className="flex justify-between py-3 md:py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-semibold text-sm md:text-base">Status</span>
                    <span className="font-bold text-green-600 capitalize flex items-center gap-2 text-sm md:text-base">
                      <span className="w-2.5 h-2.5 bg-green-600 rounded-full"></span>
                      {property.status || 'Available'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 md:py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-semibold text-sm md:text-base">Listed For</span>
                    <span className="font-bold text-gray-900 capitalize text-sm md:text-base">{property.listingType}</span>
                  </div>
                  {property.features?.yearBuilt && (
                    <div className="flex justify-between py-3 md:py-4 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold text-sm md:text-base">Year Built</span>
                      <span className="font-bold text-gray-900 text-sm md:text-base">{property.features.yearBuilt}</span>
                    </div>
                  )}
                  {property.features?.area && (
                    <div className="flex justify-between py-3 md:py-4">
                      <span className="text-gray-600 font-semibold text-sm md:text-base">Total Area</span>
                      <span className="font-bold text-gray-900 text-sm md:text-base">{property.features.area.toLocaleString()} sqft</span>
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Send Message</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="I'm interested in this property..."
                  rows="4"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && property.images && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all z-10"
          >
            <X className="h-6 w-6" />
          </button>
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all z-10"
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