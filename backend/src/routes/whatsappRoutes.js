import express from 'express';
import { verifyWebhook, receiveMessage } from '../controllers/whatsappController.js';

const router = express.Router();

// Webhook verification endpoint (GET)
router.get('/webhook', verifyWebhook);

// Webhook to receive messages (POST)
router.post('/webhook', receiveMessage);

export default router;
