const africastalking = require("africastalking");

const username = process.env.AFRICASTALKING_USERNAME;
const apiKey = process.env.AFRICASTALKING_API_KEY;

const AT = africastalking({
  apiKey,
  username,
});

const sms = AT.SMS;

const normalizeKenyanPhone = (phone) => {
  let p = String(phone).trim();

  if (p.startsWith("+254")) return p;
  if (p.startsWith("254")) return `+${p}`;

  if (p.startsWith("0")) {
    return "+254" + p.substring(1);
  }

  return p;
};

const sendSMS = async (phone, message) => {
  try {
    const formattedPhone = normalizeKenyanPhone(phone);

    console.log("Sending SMS to:", formattedPhone);

    const result = await sms.send({
      to: [formattedPhone],
      message,
    });

    console.log("SMS SUCCESS:", result);

    return result;
  } catch (error) {
    console.error(
      "SMS ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};

module.exports = sendSMS;

