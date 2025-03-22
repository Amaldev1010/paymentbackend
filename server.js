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

// Store transactions (Use DB in production)
let transactions = [];

app.get('/', (req, res) => {
  res.send('UPI Payment Backend is Running 🚀');
});

// Create Razorpay Order for UPI ID Payment
app.post('/create-upi-order', async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount.' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      payment_capture: 1, // Auto capture payment
    });

    res.json({ success: true, order_id: order.id });
  } catch (error) {
    console.error("❌ Error creating UPI order:", error);
    res.status(500).json({ success: false, message: "Failed to create UPI order.", error });
  }
});

// Store transaction
app.post('/store-transaction', (req, res) => {
  const { paymentId, amount, upiId } = req.body;
  const transaction = {
    id: paymentId || `upi_${Date.now()}`,
    amount: parseFloat(amount),
    upiId: upiId || 'N/A',
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
