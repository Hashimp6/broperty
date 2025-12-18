import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 2000
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['house', 'apartment', 'villa', 'land', 'commercial']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  address: {
    street: { 
      type: String, 
      required: false,
      default: ''
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  projectDetails: {
    builderName: {
      type: String,
      trim: true,
      maxlength: 200
    },
    projectName: {
      type: String,
      trim: true,
      maxlength: 200
    },
    category: {
      type: String,
      enum: ['premium', 'standard', 'luxury', 'affordable'],
      default: 'standard'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 &&
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  features: {
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: Number, required: true },
    areaUnit: { 
      type: String, 
      enum: ['sqft', 'cent', 'acre', 'hectare', 'sqm'],
      default: 'sqft'
    },
    parking: { type: Number, default: 0 },
    yearBuilt: { type: Number },
    landType: {
      type: String,
      enum: ['vacant', 'with_house', 'with_building', 'agricultural'],
      required: function() {
        return this.propertyType === 'land';
      }
    }
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: { type: String, required: true },
    publicId: { type: String },
    resourceType: { type: String, enum: ['image', 'video'], default: 'image' }
  }],
  status: {
    type: String,
    enum: ['available', 'pending', 'sold', 'rented'],
    default: 'available'
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create 2dsphere index for location-based queries
propertySchema.index({ location: '2dsphere' });

// Create text index for search functionality
propertySchema.index({ 
  title: 'text', 
  description: 'text',
  'address.city': 'text',
  'address.state': 'text'
});

const Property = mongoose.model('Property', propertySchema);

export default Property;