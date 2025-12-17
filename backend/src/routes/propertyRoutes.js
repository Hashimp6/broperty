import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes - require authentication
// Protected routes - require authentication
router.post(
    '/', 
    protect, 
    authorize('seller', 'agent', 'admin'), 
    upload.array('images', 10),  // Add this middleware
    createProperty
  );
router.put('/:id', protect, authorize('seller', 'agent', 'admin'), updateProperty);
router.delete('/:id', protect, authorize('seller', 'agent', 'admin'), deleteProperty);



export default router;