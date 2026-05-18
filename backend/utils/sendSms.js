const twilio = require('twilio');

const sendSms = async (to, body) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('Twilio config missing');
      return;
    }

    if (!to || !body) {
      console.log('Phone number or message missing');
      return;
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body,
    });
  } catch (error) {
    console.log('SMS not sent');
  }
};

module.exports = sendSms;