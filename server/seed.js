const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const { BloodTest } = require('./models/BloodTest');
const { HospitalBed } = require('./models/HospitalBed');
const { Ambulance } = require('./models/Ambulance');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Medicine.deleteMany({}),
      BloodTest.deleteMany({}),
      HospitalBed.deleteMany({}),
      Ambulance.deleteMany({})
    ]);

    // Create Admin / Authority
    const authority = await User.create({
      name: 'Dr. Robert Admin',
      email: 'admin@unicare.health',
      password: 'password123',
      phone: '+19876543210',
      role: 'authority',
      isVerified: true
    });

    // Create Provider / Pharmacy
    const provider = await User.create({
      name: 'Apollo Pharmacy Partner',
      email: 'provider@unicare.health',
      password: 'password123',
      phone: '+19876543211',
      role: 'provider',
      providerProfile: {
        businessName: 'Apollo Health Store',
        businessType: 'pharmacy',
        licenseNumber: 'LIC123456',
        serviceArea: ['New York', 'Delhi', 'London']
      },
      isVerified: true
    });

    // Create Doctor
    const doctor = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@unicare.health',
      password: 'password123',
      phone: '+19876543212',
      role: 'doctor',
      doctorProfile: {
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD - Cardiology',
        experience: 12,
        hospital: 'City General Hospital',
        consultationFee: 450,
        rating: 4.9,
        totalReviews: 48
      },
      isVerified: true
    });

    // Create Patient
    const patient = await User.create({
      name: 'Alex Patient',
      email: 'patient@unicare.health',
      password: 'password123',
      phone: '+19876543213',
      role: 'patient',
      address: { street: '123 Health Ave', city: 'New York', state: 'NY', pincode: '10001' },
      isVerified: true
    });

    // Create Medicines (Cheaper prices)
    await Medicine.insertMany([
      {
        name: 'Paracetamol 650mg',
        genericName: 'Acetaminophen',
        manufacturer: 'GSK Pharma',
        category: 'tablet',
        description: 'Effective fever and pain reliever.',
        mrp: 5.00,
        sellingPrice: 2.50,
        discount: 50,
        stock: 500,
        provider: provider._id
      },
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        manufacturer: 'Sun Pharma',
        category: 'capsule',
        description: 'Broad-spectrum antibiotic for bacterial infections.',
        mrp: 15.00,
        sellingPrice: 9.99,
        discount: 33,
        stock: 300,
        provider: provider._id
      },
      {
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin Dihydrate',
        manufacturer: 'Pfizer',
        category: 'tablet',
        description: 'Antibiotic for respiratory and throat infections.',
        mrp: 20.00,
        sellingPrice: 12.50,
        discount: 37,
        stock: 250,
        provider: provider._id
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine Hydrochloride',
        manufacturer: 'Dr. Reddy Labs',
        category: 'tablet',
        description: 'Relief from allergy symptoms and runny nose.',
        mrp: 4.00,
        sellingPrice: 1.99,
        discount: 50,
        stock: 1000,
        provider: provider._id
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole Capsule',
        manufacturer: 'Cipla',
        category: 'capsule',
        description: 'Treatment for acid reflux and stomach ulcers.',
        mrp: 10.00,
        sellingPrice: 6.50,
        discount: 35,
        stock: 400,
        provider: provider._id
      },
      {
        name: 'Insulin Glargine Injection',
        genericName: 'Long-acting Insulin',
        manufacturer: 'Sanofi',
        category: 'injection',
        description: 'Blood sugar control for diabetes management.',
        mrp: 45.00,
        sellingPrice: 32.00,
        discount: 28,
        stock: 150,
        provider: provider._id
      }
    ]);

    // Create Blood Tests
    await BloodTest.insertMany([
      {
        name: 'Complete Blood Count (CBC)',
        description: 'Evaluates overall health and detects a wide range of disorders.',
        category: 'routine',
        parameters: ['RBC', 'WBC', 'Hemoglobin', 'Platelets'],
        mrp: 25.00,
        sellingPrice: 14.99,
        discount: 40,
        reportTime: '12 Hours',
        provider: provider._id,
        serviceAreas: ['New York', 'Delhi', 'London']
      },
      {
        name: 'Lipid Profile Test',
        description: 'Measures cholesterol and triglyceride levels for heart health.',
        category: 'routine',
        parameters: ['Total Cholesterol', 'HDL', 'LDL', 'Triglycerides'],
        mrp: 35.00,
        sellingPrice: 19.99,
        discount: 43,
        reportTime: '24 Hours',
        provider: provider._id,
        serviceAreas: ['New York', 'Delhi', 'London']
      },
      {
        name: 'Thyroid Function Test (TFT)',
        description: 'Assesses how well your thyroid gland is working.',
        category: 'hormone',
        parameters: ['T3', 'T4', 'TSH'],
        mrp: 40.00,
        sellingPrice: 24.99,
        discount: 37,
        reportTime: '24 Hours',
        provider: provider._id,
        serviceAreas: ['New York', 'Delhi', 'London']
      }
    ]);

    // Create Hospital Beds
    await HospitalBed.insertMany([
      {
        hospital: provider._id,
        hospitalName: 'City General Hospital',
        wardType: 'general',
        totalBeds: 50,
        availableBeds: 18,
        pricePerDay: 80,
        facilities: ['Oxygen Support', '24/7 Nursing', 'Meals Included'],
        floor: '2nd Floor'
      },
      {
        hospital: provider._id,
        hospitalName: 'City General Hospital',
        wardType: 'icu',
        totalBeds: 20,
        availableBeds: 4,
        pricePerDay: 350,
        facilities: ['Ventilator', 'Dedicated Intensivist', 'Continuous ECG Monitoring'],
        floor: 'Critical Care Wing'
      },
      {
        hospital: provider._id,
        hospitalName: 'Metro Healthcare Center',
        wardType: 'private',
        totalBeds: 30,
        availableBeds: 9,
        pricePerDay: 200,
        facilities: ['AC', 'Television', 'Attendant Bed', 'Attached Bathroom'],
        floor: 'VIP Block'
      }
    ]);

    // Create Ambulances
    await Ambulance.insertMany([
      {
        provider: provider._id,
        vehicleNumber: 'NY-01-AB-1234',
        vehicleType: 'icu_mobile',
        driver: { name: 'Michael Driver', phone: '+19876543299', license: 'DL98765' },
        equipment: ['Ventilator', 'Defibrillator', 'Oxygen Cylinder', 'Paramedic Staff'],
        pricePerKm: 3.5,
        baseFare: 50,
        serviceArea: ['New York']
      },
      {
        provider: provider._id,
        vehicleNumber: 'NY-01-AB-5678',
        vehicleType: 'basic',
        driver: { name: 'David Smith', phone: '+19876543298', license: 'DL12345' },
        equipment: ['First Aid', 'Oxygen Mask', 'Stretcher'],
        pricePerKm: 2.0,
        baseFare: 30,
        serviceArea: ['New York']
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
