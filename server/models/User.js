const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'authority', 'employee', 'provider'],
    default: 'patient'
  },
  avatar: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Doctor-specific fields
  doctorProfile: {
    specialization: String,
    qualification: String,
    experience: Number,
    registrationNumber: String,
    hospital: String,
    consultationFee: Number,
    availableSlots: [{
      day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
      startTime: String,
      endTime: String
    }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAvailableForVideo: { type: Boolean, default: true }
  },

  // Provider-specific fields
  providerProfile: {
    businessName: String,
    businessType: { type: String, enum: ['pharmacy', 'diagnostic', 'hospital', 'ambulance'] },
    licenseNumber: String,
    gstNumber: String,
    serviceArea: [String]
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
