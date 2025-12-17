import express from 'express';
import {
  createShowing,
  getShowings,
  getShowing,
  updateShowing,
  cancelShowing,
  addFeedback
} from '../controllers/showingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All showing routes require authentication
router.use(protect);

router.post('/', createShowing);
router.get('/', getShowings);
router.get('/:id', getShowing);
router.put('/:id', updateShowing);
router.delete('/:id', cancelShowing);
router.post('/:id/feedback', addFeedback);

export default router;