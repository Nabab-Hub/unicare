const mongoose = require('mongoose');

const hospitalBedSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalName: { type: String, required: true },
  wardType: {
    type: String,
    enum: ['general', 'semi_private', 'private', 'icu', 'nicu', 'picu', 'maternity', 'emergency'],
    required: true
  },
  totalBeds: { type: Number, required: true },
  availableBeds: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  facilities: [String],
  floor: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const bedBookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalBed', required: true },
  hospitalName: String,
  wardType: String,
  admissionDate: { type: Date, required: true },
  dischargeDate: Date,
  estimatedDays: Number,
  pricePerDay: Number,
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'admitted', 'discharged', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'partial', 'refunded'], default: 'pending' },
  paymentId: String,
  paymentMethod: { type: String, enum: ['upi', 'card', 'paypal', 'bank_transfer'] },
  patientCondition: String,
  doctorAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

const HospitalBed = mongoose.model('HospitalBed', hospitalBedSchema);
const BedBooking = mongoose.model('BedBooking', bedBookingSchema);

module.exports = { HospitalBed, BedBooking };
