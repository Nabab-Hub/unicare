const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleNumber: { type: String, required: true, unique: true },
  vehicleType: {
    type: String,
    enum: ['basic', 'advanced', 'icu_mobile', 'neonatal', 'air'],
    required: true
  },
  driver: {
    name: String,
    phone: String,
    license: String
  },
  equipment: [String],
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  },
  isAvailable: { type: Boolean, default: true },
  pricePerKm: { type: Number, required: true },
  baseFare: { type: Number, required: true },
  serviceArea: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ambulanceBookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ambulance: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: {
    address: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    address: String,
    lat: Number,
    lng: Number
  },
  emergencyType: {
    type: String,
    enum: ['accident', 'cardiac', 'stroke', 'breathing', 'pregnancy', 'other'],
    default: 'other'
  },
  patientCondition: String,
  status: {
    type: String,
    enum: ['requested', 'accepted', 'en_route', 'arrived', 'transporting', 'completed', 'cancelled'],
    default: 'requested'
  },
  estimatedFare: Number,
  finalFare: Number,
  distance: Number,
  paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  paymentId: String,
  paymentMethod: { type: String, enum: ['upi', 'card', 'paypal', 'bank_transfer', 'cod'] },
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    message: String
  }],
  notes: String
}, { timestamps: true });

const Ambulance = mongoose.model('Ambulance', ambulanceSchema);
const AmbulanceBooking = mongoose.model('AmbulanceBooking', ambulanceBookingSchema);

module.exports = { Ambulance, AmbulanceBooking };
