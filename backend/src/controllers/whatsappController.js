import whatsappService from '../services/whatsappService.js';

// Verify webhook with Meta
export const verifyWebhook = (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed');
      return res.sendStatus(403);
    }
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return res.sendStatus(500);
  }
};

// Receive and process incoming messages
export const receiveMessage = async (req, res) => {
  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        if (value.messages && value.messages[0]) {
          const message = value.messages[0];
          const from = message.from;
          const messageBody = message.text?.body || '';
          const messageType = message.type;

          console.log(`📩 Message from ${from}: ${messageBody}`);

          if (messageType === 'text') {
            await whatsappService.handleTextMessage(from, messageBody);
          } else if (messageType === 'interactive') {
            await whatsappService.handleInteractiveMessage(from, message);
          }

          await whatsappService.markAsRead(message.id);
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.sendStatus(500);
  }
};
