const mongoose = require('mongoose');

const bloodTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['routine', 'specialized', 'allergy', 'hormone', 'genetic', 'cancer', 'infection', 'other'],
    required: true
  },
  parameters: [String],
  preparation: String,
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  sampleType: { type: String, enum: ['blood', 'urine', 'stool', 'saliva', 'other'], default: 'blood' },
  reportTime: String,
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isHomeCollection: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  serviceAreas: [String]
}, { timestamps: true });

const bloodTestBookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tests: [{
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodTest' },
    name: String,
    price: Number
  }],
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectionDate: { type: Date, required: true },
  collectionTimeSlot: String,
  collectionAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['booked', 'collector_assigned', 'sample_collected', 'processing', 'report_ready', 'cancelled'],
    default: 'booked'
  },
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  paymentId: String,
  paymentMethod: { type: String, enum: ['upi', 'card', 'paypal', 'bank_transfer'] },
  reportUrl: String,
  notes: String,
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    message: String
  }]
}, { timestamps: true });

const BloodTest = mongoose.model('BloodTest', bloodTestSchema);
const BloodTestBooking = mongoose.model('BloodTestBooking', bloodTestBookingSchema);

module.exports = { BloodTest, BloodTestBooking };
