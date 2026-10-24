const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderType: {
    type: String,
    enum: ['medicine', 'blood_test', 'bed_booking', 'ambulance'],
    required: true
  },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.itemModel' },
    itemModel: { type: String, enum: ['Medicine', 'BloodTest'] },
    name: String,
    quantity: { type: Number, default: 1 },
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'paypal', 'bank_transfer', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    message: String
  }],
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prescriptionImage: String,
  notes: String,
  estimatedDelivery: Date
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'UC' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
