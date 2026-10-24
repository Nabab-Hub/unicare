import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Truck, MapPin, Phone, ShieldAlert, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Ambulances = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [emergencyType, setEmergencyType] = useState('accident');
  const [patientCondition, setPatientCondition] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const res = await API.get('/ambulances');
      setAmbulances(res.data.ambulances);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAmbulance = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/ambulances/book', {
        ambulanceId: selectedAmbulance._id,
        pickupLocation: { address: pickupAddress, lat: 28.6139 + Math.random()*0.05, lng: 77.2090 + Math.random()*0.05 },
        emergencyType,
        patientCondition,
        paymentMethod
      });
      alert('Emergency Ambulance Dispatched Successfully!');
      setSelectedAmbulance(null);
      navigate(`/track/ambulance/${res.data.booking._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Truck className="h-8 w-8 mr-3 text-rose-600 animate-pulse" /> 24/7 Emergency Ambulance Services
          </h1>
          <p className="text-slate-500 text-sm mt-1">Instant ambulance dispatch with live Google Maps tracking and medical equipment</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading available ambulances...</div>
      ) : ambulances.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border shadow-sm">
          <p className="text-lg font-medium">No ambulances available currently</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ambulances.map((amb) => (
            <div key={amb._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full uppercase">{amb.vehicleType} Ambulance</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded">Available Now</span>
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-1">{amb.vehicleNumber}</h3>
                <p className="text-xs text-slate-500 mb-4">Driver: {amb.driver?.name || 'Authorized Driver'} ({amb.driver?.phone || '1800-999-888'})</p>

                <div className="space-y-1 mb-4">
                  <p className="text-xs font-semibold text-slate-700">Onboard Equipment:</p>
                  <div className="flex flex-wrap gap-1">
                    {amb.equipment?.map((eq, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{eq}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-slate-900">${amb.baseFare}</span>
                  <span className="text-xs text-slate-400"> base + ${amb.pricePerKm}/km</span>
                </div>
                <button
                  onClick={() => setSelectedAmbulance(amb)}
                  className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 font-semibold shadow flex items-center space-x-1"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Dispatch Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Modal */}
      {selectedAmbulance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <ShieldAlert className="h-6 w-6 text-rose-600 mr-2" /> Emergency Dispatch
              </h3>
              <button onClick={() => setSelectedAmbulance(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleBookAmbulance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Type</label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="accident">Accident / Trauma</option>
                  <option value="cardiac">Cardiac Emergency</option>
                  <option value="stroke">Stroke</option>
                  <option value="breathing">Severe Breathing Difficulty</option>
                  <option value="pregnancy">Pregnancy / Maternity</option>
                  <option value="other">Other Medical Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location Address</label>
                <input
                  type="text"
                  required
                  placeholder="Enter exact pickup address..."
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Condition Notes</label>
                <textarea
                  required
                  rows={2}
                  value={patientCondition}
                  onChange={(e) => setPatientCondition(e.target.value)}
                  placeholder="Describe patient condition..."
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="cod">Pay to Driver (COD)</option>
                </select>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg text-xs text-rose-800">
                ⚠️ Dispatching immediately initiates real-time Google Maps GPS tracking and alerts the nearest available paramedic team.
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 font-semibold shadow"
              >
                Dispatch Ambulance Immediately
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
