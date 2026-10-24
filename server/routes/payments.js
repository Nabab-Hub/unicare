const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Initialize payment (Stripe / Razorpay simulation)
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', paymentMethod, orderId, orderType } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Simulated payment gateway response
    let paymentResponse;

    switch (paymentMethod) {
      case 'upi':
        paymentResponse = {
          paymentId: 'UPI_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
          method: 'upi',
          status: 'created',
          amount,
          currency,
          upiLink: `upi://pay?pa=unicare@upi&pn=Unicare&am=${amount}&cu=${currency}&tn=Order_${orderId}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=unicare@upi&pn=Unicare&am=${amount}`
        };
        break;

      case 'card':
        paymentResponse = {
          paymentId: 'CARD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
          method: 'card',
          status: 'created',
          amount,
          currency,
          clientSecret: 'cs_test_' + Math.random().toString(36).substr(2, 24)
        };
        break;

      case 'paypal':
        paymentResponse = {
          paymentId: 'PP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
          method: 'paypal',
          status: 'created',
          amount,
          currency,
          approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=EC-${Math.random().toString(36).substr(2, 16)}`
        };
        break;

      case 'bank_transfer':
        paymentResponse = {
          paymentId: 'BT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
          method: 'bank_transfer',
          status: 'created',
          amount,
          currency,
          bankDetails: {
            accountName: 'Unicare Healthcare Pvt. Ltd.',
            accountNumber: 'XXXX XXXX XXXX 4567',
            ifsc: 'UNIC0001234',
            bankName: 'Unicare Bank',
            reference: 'UC' + Date.now()
          }
        };
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    res.json({ success: true, payment: paymentResponse });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment creation failed' });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { paymentId, method } = req.body;

    // In production, verify with actual payment gateway
    // For demo purposes, simulate successful verification
    res.json({
      success: true,
      verified: true,
      payment: {
        paymentId,
        method,
        status: 'completed',
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    // Return payment history from orders
    const Order = require('../models/Order');
    const Appointment = require('../models/Appointment');

    const orders = await Order.find({ patient: req.user._id, paymentStatus: { $ne: 'pending' } })
      .select('orderNumber orderType finalAmount paymentMethod paymentStatus paymentId createdAt')
      .sort({ createdAt: -1 });

    const appointments = await Appointment.find({ patient: req.user._id, paymentStatus: { $ne: 'pending' } })
      .select('consultationFee paymentMethod paymentStatus paymentId createdAt')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments: { orders, appointments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching payment history' });
  }
});

module.exports = router;
