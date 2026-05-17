// backend/utils/sendSms.js

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// This helper sends an SMS to the given number.
// It is used for notifications like pass creation.
// If Twilio is not configured, we skip sending instead of crashing the app.
async function sendSms(to, body) {
  if (!to || !body) {
    console.warn('SMS skipped: phone number or message body is missing');
    return { success: false, message: 'Missing phone number or message body' };
  }

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('SMS skipped: Twilio environment variables are not configured');
    return { success: false, message: 'Twilio not configured' };
  }

  try {
    const client = twilio(accountSid, authToken);

    const response = await client.messages.create({
      from: fromNumber,
      to,
      body,
    });

    return {
      success: true,
      sid: response.sid,
      message: 'SMS sent successfully',
    };
  } catch (error) {
    console.error('Failed to send SMS:', error.message || error);

    return {
      success: false,
      message: error.message || 'SMS sending failed',
    };
  }
}

module.exports = sendSms;