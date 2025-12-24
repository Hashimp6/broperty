import axios from 'axios';
import Property from '../models/Property.js';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

// Handle text messages
const handleTextMessage = async (from, messageText) => {
  try {
    const response = await processPropertyQuery(messageText);
    await sendTextMessage(from, response);
  } catch (error) {
    console.error('Error handling text message:', error);
    await sendTextMessage(from, 'Sorry, I encountered an error. Please try again later.');
  }
};

// Handle interactive button responses
const handleInteractiveMessage = async (from, message) => {
  try {
    const buttonReply = message.interactive?.button_reply?.id;

    if (buttonReply === 'view_properties') {
      const properties = await Property.find().limit(5);
      const response = formatPropertyList(properties);
      await sendTextMessage(from, response);
    } else if (buttonReply === 'contact_agent') {
      await sendTextMessage(
        from,
        '📞 Our agent will contact you shortly!\nOr call us at: +91-XXXXXXXXXX'
      );
    }
  } catch (error) {
    console.error('Error handling interactive message:', error);
  }
};

// Process property queries
async function processPropertyQuery(query) {
  const lowerQuery = query.toLowerCase().trim();

  if (/^(hello|hi|hey|namaste)/.test(lowerQuery)) {
    return `👋 Hello! Welcome to *Real Estate Properties*!

Try:
• "2BHK apartments"
• "Properties under 50 lakhs"
• "Villas in Bangalore"

Type *menu* to see all options.`;
  }

  if (lowerQuery.includes('menu')) {
    return `📋 *Main Menu*

1️⃣ Search by type
2️⃣ Search by budget
3️⃣ Search by location
4️⃣ Commercial properties
5️⃣ Talk to agent`;
  }

  if (/\d+\s*bhk/.test(lowerQuery)) {
    const bedrooms = parseInt(lowerQuery.match(/(\d+)\s*bhk/)[1]);
    const properties = await Property.find({ bedrooms }).limit(5);
    return formatPropertyList(properties, `${bedrooms} BHK Properties`);
  }

  if (/villa|house|bungalow|independent/.test(lowerQuery)) {
    const properties = await Property.find({
      propertyType: { $in: ['villa', 'house', 'independent'] }
    }).limit(5);
    return formatPropertyList(properties, 'Villas & Houses');
  }

  return `🏠 I can help you find properties!
Try:
• "2BHK apartments"
• "Villas in Bangalore"
• "Properties under 50 lakhs"`;
}

// Format property list
function formatPropertyList(properties, title = 'Properties') {
  if (!properties.length) {
    return '😕 No properties found.';
  }

  let msg = `🏠 *${title}*\n\n`;

  properties.forEach((p, i) => {
    msg += `*${i + 1}. ${p.title || 'Property'}*
📍 ${p.location || p.city}
💰 ₹${formatPrice(p.price)}
\n`;
  });

  return msg;
}

// Format Indian price
function formatPrice(price) {
  if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `${(price / 100000).toFixed(2)} Lakhs`;
  return price.toLocaleString('en-IN');
}

// Send text message
const sendTextMessage = async (to, message) => {
    try {
      const response = await axios.post(
        WHATSAPP_API_URL,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual', // Best practice to include
          to: to,
          type: 'text',
          text: { 
            preview_url: true, // This enables link previews (very useful for real estate!)
            body: message 
          }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ WhatsApp API Error:', error.response?.data || error.message);
      throw error; // Let the controller handle the final error response
    }
  };

// Mark message as read
const markAsRead = async (messageId) => {
  await axios.post(
    WHATSAPP_API_URL,
    {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

// ✅ DEFAULT EXPORT
export default {
  handleTextMessage,
  handleInteractiveMessage,
  sendTextMessage,
  markAsRead
};
