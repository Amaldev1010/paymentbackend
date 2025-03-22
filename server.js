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

// Store transactions locally (use a database in production)
let transactions = [];

app.get('/', (req, res) => {
  res.send('Payment Backend is Running 🚀');
});

// Create UPI Payment Link
app.post('/create-payment-link', async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount.' });
  }

  try {
    const response = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      description: 'UPI Payment',
      customer: {
        email: 'test@example.com',
        contact: '9633516378', // ✅ Valid number
      },
      notify: { sms: true, email: true },
      callback_url: 'https://your-app-url.com/payment-status',
      callback_method: 'get',
      options: {
        payment_methods: {
          upi: true, // ✅ UPI only
        }
      }
    });

    res.json({ success: true, payment_link: response.short_url });
  } catch (error) {
    console.error("❌ Error creating UPI Payment Link:", error);
    res.status(500).json({ success: false, message: "Failed to create UPI payment link.", error });
  }
});

// Store transaction
app.post('/store-transaction', (req, res) => {
  const { paymentId, amount } = req.body;
  const transaction = {
    id: paymentId || `txn_${Date.now()}`,
    amount: parseFloat(amount),
    date: new Date().toISOString(),
    status: 'Completed',
  };
  transactions.push(transaction);
  res.json({ success: true, transactions });
});

// Get transaction history
app.get('/transactions', (req, res) => {
  res.json({ success: true, transactions });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Payment Server running on port ${PORT}`);
});
