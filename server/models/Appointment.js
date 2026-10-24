const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  type: {
    type: String,
    enum: ['in_person', 'video'],
    default: 'in_person'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  symptoms: String,
  diagnosis: String,
  prescription: String,
  notes: String,
  consultationFee: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  paymentMethod: { type: String, enum: ['upi', 'card', 'paypal', 'bank_transfer'] },
  videoCallRoom: String,
  rating: { type: Number, min: 1, max: 5 },
  review: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
