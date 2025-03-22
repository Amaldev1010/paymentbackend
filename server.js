require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get('/', (req, res) => {
  res.send('Payment Backend is Running 🚀');
});

app.post('/create-payment-link', async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount.' });
  }

  try {
    const response = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      description: 'Test Payment',
      customer: {
        email: 'test@example.com',
        contact: '9999999999',
      },
      notify: { sms: true, email: true },
      callback_url: 'https://your-app-url.com/payment-success',
      callback_method: 'get',
    });

    res.json({ success: true, payment_link: response.short_url });
  } catch (error) {
    console.error("❌ Error creating Razorpay Payment Link:", error);
    res.status(500).json({ success: false, message: "Failed to create payment link.", error });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Payment Server running on port ${PORT}`);
});
