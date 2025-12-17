import asyncHandler from 'express-async-handler';
import Showing from '../models/Showing.js';
import Property from '../models/Property.js';

// @desc    Create new showing
// @route   POST /api/showings
// @access  Private
export const createShowing = asyncHandler(async (req, res) => {
  const { property, scheduledDate, duration, notes } = req.body;

  // Check if property exists
  const propertyExists = await Property.findById(property);
  if (!propertyExists) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if property is available
  if (propertyExists.status !== 'available') {
    res.status(400);
    throw new Error('Property is not available for showing');
  }

  // Check for conflicting showings
  const requestedDate = new Date(scheduledDate);
  const oneHourBefore = new Date(requestedDate.getTime() - 60 * 60 * 1000);
  const oneHourAfter = new Date(requestedDate.getTime() + 60 * 60 * 1000);

  const conflictingShowing = await Showing.findOne({
    property,
    scheduledDate: {
      $gte: oneHourBefore,
      $lte: oneHourAfter
    },
    status: { $in: ['pending', 'confirmed'] }
  });

  if (conflictingShowing) {
    res.status(400);
    throw new Error('Time slot not available. Please choose another time.');
  }

  const showing = await Showing.create({
    property,
    buyer: req.user._id,
    agent: propertyExists.agent,
    scheduledDate,
    duration,
    notes
  });

  const populatedShowing = await Showing.findById(showing._id)
    .populate('property', 'title address price')
    .populate('buyer', 'name email phone')
    .populate('agent', 'name email phone');

  res.status(201).json(populatedShowing);
});

// @desc    Get all showings (filtered by user role)
// @route   GET /api/showings
// @access  Private
export const getShowings = asyncHandler(async (req, res) => {
  let query = {};

  // Filter based on user role
  if (req.user.role === 'buyer') {
    query.buyer = req.user._id;
  } else if (req.user.role === 'agent') {
    query.agent = req.user._id;
  } else if (req.user.role === 'seller') {
    // Get showings for properties owned by this seller
    const properties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = properties.map(p => p._id);
    query.property = { $in: propertyIds };
  }
  // Admin can see all showings (no filter)

  const showings = await Showing.find(query)
    .populate('property', 'title address price images')
    .populate('buyer', 'name email phone')
    .populate('agent', 'name email phone')
    .sort({ scheduledDate: -1 });

  res.json(showings);
});

// @desc    Get single showing
// @route   GET /api/showings/:id
// @access  Private
export const getShowing = asyncHandler(async (req, res) => {
  const showing = await Showing.findById(req.params.id)
    .populate('property', 'title address price images owner')
    .populate('buyer', 'name email phone')
    .populate('agent', 'name email phone');

  if (!showing) {
    res.status(404);
    throw new Error('Showing not found');
  }

  // Check authorization
  const isAuthorized = 
    showing.buyer._id.toString() === req.user._id.toString() ||
    showing.agent?._id.toString() === req.user._id.toString() ||
    showing.property.owner.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this showing');
  }

  res.json(showing);
});

// @desc    Update showing
// @route   PUT /api/showings/:id
// @access  Private
export const updateShowing = asyncHandler(async (req, res) => {
  const showing = await Showing.findById(req.params.id);

  if (!showing) {
    res.status(404);
    throw new Error('Showing not found');
  }

  // Only buyer, agent, or admin can update
  const isAuthorized = 
    showing.buyer.toString() === req.user._id.toString() ||
    showing.agent?.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to update this showing');
  }

  const { scheduledDate, duration, status, notes } = req.body;

  if (scheduledDate) showing.scheduledDate = scheduledDate;
  if (duration) showing.duration = duration;
  if (status) showing.status = status;
  if (notes) showing.notes = notes;

  await showing.save();

  const updatedShowing = await Showing.findById(showing._id)
    .populate('property', 'title address price')
    .populate('buyer', 'name email phone')
    .populate('agent', 'name email phone');

  res.json(updatedShowing);
});

// @desc    Cancel showing
// @route   DELETE /api/showings/:id
// @access  Private
export const cancelShowing = asyncHandler(async (req, res) => {
  const showing = await Showing.findById(req.params.id);

  if (!showing) {
    res.status(404);
    throw new Error('Showing not found');
  }

  // Only buyer or admin can cancel
  if (
    showing.buyer.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to cancel this showing');
  }

  showing.status = 'cancelled';
  await showing.save();

  res.json({ message: 'Showing cancelled successfully' });
});

// @desc    Add feedback to showing
// @route   POST /api/showings/:id/feedback
// @access  Private (buyer only)
export const addFeedback = asyncHandler(async (req, res) => {
  const showing = await Showing.findById(req.params.id);

  if (!showing) {
    res.status(404);
    throw new Error('Showing not found');
  }

  // Only the buyer can add feedback
  if (showing.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the buyer can add feedback');
  }

  // Only completed showings can have feedback
  if (showing.status !== 'completed') {
    res.status(400);
    throw new Error('Can only add feedback to completed showings');
  }

  const { rating, comment } = req.body;

  showing.feedback = {
    rating,
    comment
  };

  await showing.save();

  res.json(showing);
});
