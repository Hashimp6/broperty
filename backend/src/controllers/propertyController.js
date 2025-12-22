import asyncHandler from 'express-async-handler';
import Property from '../models/Property.js';
import { uploadToCloudinary} from '../config/cloudinary.js';


export const getProperties = asyncHandler(async (req, res) => {
  const {
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    city,
    state,
    status,
    lat,
    lng,
    radius = 10, // km
    page = 1,
    limit = 10,
  } = req.query;

  const filters = {};

  if (propertyType) filters.propertyType = propertyType;
  if (listingType) filters.listingType = listingType;
  if (status) filters.status = status;
  if (city) filters["address.city"] = new RegExp(city, "i");
  if (state) filters["address.state"] = new RegExp(state, "i");
  if (bedrooms) filters["features.bedrooms"] = { $gte: Number(bedrooms) };
  if (bathrooms) filters["features.bathrooms"] = { $gte: Number(bathrooms) };

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  let properties = [];
  let total = 0;

  // 🔥 IF LOCATION PROVIDED → SORT BY NEARBY FIRST
  if (lat && lng) {
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance", // meters
          maxDistance: Number(radius) * 1000,
          spherical: true,
          query: filters,
        },
      },
      { $sort: { distance: 1, createdAt: -1 } }, // nearest first
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    properties = await Property.aggregate(pipeline);

    total = await Property.countDocuments(filters);
  } 
  // 🔁 NO LOCATION → NORMAL LISTING
  else {
    properties = await Property.find(filters)
      .populate("owner", "name email phone")
      .populate("agent", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    total = await Property.countDocuments(filters);
  }

  res.json({
    properties,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('agent', 'name email phone');

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  res.json(property);
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (seller, agent, admin)
export const createProperty = asyncHandler(async (req, res) => {
  console.log("=== CREATE PROPERTY START ===");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
  console.log("req.user:", req.user);
  
  try {
    // Parse JSON fields if they come as strings
    const address = typeof req.body.address === 'string' 
      ? JSON.parse(req.body.address) 
      : req.body.address;
    console.log("Parsed address:", address);
      
    const features = typeof req.body.features === 'string' 
      ? JSON.parse(req.body.features) 
      : req.body.features;
    console.log("Parsed features:", features);
      
    const amenities = typeof req.body.amenities === 'string' 
      ? JSON.parse(req.body.amenities) 
      : req.body.amenities;
    console.log("Parsed amenities:", amenities);

    // Parse location data
    const location = typeof req.body.location === 'string'
      ? JSON.parse(req.body.location)
      : req.body.location;
    console.log("Parsed location:", location);

    // Parse project details - NEW
    const projectDetails = typeof req.body.projectDetails === 'string'
      ? JSON.parse(req.body.projectDetails)
      : req.body.projectDetails;
    console.log("Parsed projectDetails:", projectDetails);

    // Validate location coordinates
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      throw new Error('Invalid location coordinates. Must provide [longitude, latitude]');
    }

    // Ensure coordinates are numbers
    const coordinates = [
      parseFloat(location.coordinates[0]),
      parseFloat(location.coordinates[1])
    ];

    if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      throw new Error('Location coordinates must be valid numbers');
    }

    // Validate longitude and latitude ranges
    if (coordinates[0] < -180 || coordinates[0] > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    if (coordinates[1] < -90 || coordinates[1] > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    const propertyData = {
      title: req.body.title,
      description: req.body.description,
      propertyType: req.body.propertyType,
      price: parseFloat(req.body.price),
      listingType: req.body.listingType,
      status: req.body.status || 'available',
      address,
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      features,
      amenities,
      owner: req.user._id
    };

    // Add project details if provided - NEW
    if (projectDetails && (projectDetails.builderName || projectDetails.projectName || projectDetails.category)) {
      propertyData.projectDetails = {
        builderName: projectDetails.builderName || '',
        projectName: projectDetails.projectName || '',
        category: projectDetails.category || 'standard'
      };
    }

    console.log("Property data before images:", propertyData);

    // If user is an agent, set them as the agent
    if (req.user.role === 'agent') {
      propertyData.agent = req.user._id;
    }
  
    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      console.log("Uploading images to Cloudinary...");
      
      // Dynamic import - loads after dotenv
      const { uploadToCloudinary } = await import('../config/cloudinary.js');
      
      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await uploadToCloudinary(file.path);
          
          // Delete local file after successful upload
          const fs = await import('fs');
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          
          return result;
        } catch (uploadError) {
          console.error('Error uploading file:', file.originalname, uploadError);
          // Delete local file even if upload fails
          const fs = await import('fs');
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw uploadError;
        }
      });
      
      const uploadResults = await Promise.all(uploadPromises);
  
      propertyData.images = uploadResults.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type
      }));
      
      console.log("Images uploaded successfully:", propertyData.images);
    }
  
    console.log("Creating property in database...");
    const property = await Property.create(propertyData);
    
    console.log("Property created successfully:", property._id);
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error("ERROR in createProperty:", error);
    
    // Clean up local files if property creation fails
    if (req.files && req.files.length > 0) {
      const fs = await import('fs');
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', file.path, cleanupError);
          }
        }
      });
    }
    
    throw error;
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (owner or agent)
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if user is owner or agent
  if (
    property.owner.toString() !== req.user._id.toString() &&
    property.agent?.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this property');
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedProperty);
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (owner or admin)
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if user is owner or admin
  if (
    property.owner.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this property');
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({ message: 'Property deleted successfully' });
});

// @desc    Upload property images (simplified without Cloudinary)
// @route   POST /api/properties/:id/images
// @access  Private (owner or agent)
export const uploadPropertyImages = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check authorization
  if (
    property.owner.toString() !== req.user._id.toString() &&
    property.agent?.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to upload images for this property');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one image');
  }

  // Upload to Cloudinary
  const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
  const uploadResults = await Promise.all(uploadPromises);

  // Add images/videos to property
  const newImages = uploadResults.map(result => ({
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type // 'image' or 'video'
  }));

  property.images.push(...newImages);
  await property.save();

  res.json({
    message: 'Media uploaded successfully',
    images: newImages
  });
});