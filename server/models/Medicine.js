const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  manufacturer: { type: String, required: true },
  category: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'supplement', 'other'],
    required: true
  },
  description: String,
  composition: String,
  dosage: String,
  sideEffects: String,
  prescriptionRequired: { type: Boolean, default: false },
  images: [String],
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  tags: [String],
  expiryDate: Date
}, { timestamps: true });

medicineSchema.index({ name: 'text', genericName: 'text', tags: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
