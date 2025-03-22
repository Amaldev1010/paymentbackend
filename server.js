require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simulated transaction history (use a database in production)
let transactions = [];

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount.' });
  }
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    res.json({ success: true, order_id: order.id });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Failed to create order.", error });
  }
});

// Store Transaction
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

// Get Transaction History
app.get('/transactions', (req, res) => {
  res.json({ success: true, transactions });
});

const PORT = process.env.PORT || 5001; // Different port to avoid conflict
app.listen(PORT, () => {
  console.log(`✅ Payment Server running on port ${PORT}`);
});