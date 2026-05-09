// backend/utils/sendSms.js

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

async function sendSms(to, body) {
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio env not configured, skipping SMS send');
    return;
  }

  if (!to) {
    console.warn('No recipient phone number provided, skipping SMS send');
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      from: fromNumber,
      to,
      body
    });
  } catch (err) {
    console.error('Failed to send SMS:', err.message || err);
  }
}

module.exports = sendSms;