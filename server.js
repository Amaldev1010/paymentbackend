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
        contact: '9633516378', // ✅ Updated with a valid number
      },
      notify: { sms: true, email: true },
      callback_url: 'https://your-app-url.com/payment-status', // ✅ Replace with your app URL
      callback_method: 'get',
    });

    res.json({ success: true, payment_link: response.short_url });
  } catch (error) {
    console.error("❌ Error creating Razorpay Payment Link:", error);
    res.status(500).json({ success: false, message: "Failed to create payment link.", error });
  }
});
