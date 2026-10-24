import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Building2, Search, Bed, ShieldAlert, Check } from 'lucide-react';

export const Beds = () => {
  const [beds, setBeds] = useState([]);
  const [wardType, setWardType] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState(null);
  const [admissionDate, setAdmissionDate] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(3);
  const [patientCondition, setPatientCondition] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    fetchBeds();
  }, [wardType]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/beds?wardType=${wardType}`);
      setBeds(res.data.beds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookBed = async (e) => {
    e.preventDefault();
    try {
      await API.post('/beds/book', {
        bedId: selectedBed._id,
        admissionDate,
        estimatedDays: Number(estimatedDays),
        patientCondition,
        paymentMethod
      });
      alert('Hospital bed booked successfully!');
      setSelectedBed(null);
      fetchBeds();
    } catch (err) {
      alert(err.response?.data?.message || 'Bed booking failed');
    }
  };

  const wards = ['general', 'semi_private', 'private', 'icu', 'nicu', 'picu', 'emergency'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Building2 className="h-8 w-8 mr-3 text-purple-600" /> Hospital Beds Booking & Availability
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time bed availability and instant admission booking across hospitals</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-4 mb-8">
        <button
          onClick={() => setWardType('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!wardType ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          All Wards
        </button>
        {wards.map((w) => (
          <button
            key={w}
            onClick={() => setWardType(w)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap ${wardType === w ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {w.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading hospital beds...</div>
      ) : beds.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border shadow-sm">
          <p className="text-lg font-medium">No beds available currently</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beds.map((bed) => (
            <div key={bed._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-0.5 rounded-full uppercase">{bed.wardType.replace('_', ' ')}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${bed.availableBeds > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {bed.availableBeds} Beds Available
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{bed.hospitalName}</h3>
                <p className="text-xs text-slate-500 mb-4">Floor: {bed.floor || 'Main Block'}</p>

                <div className="space-y-1 mb-4">
                  <p className="text-xs font-semibold text-slate-700">Facilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {bed.facilities?.map((f, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-slate-900">${bed.pricePerDay}</span>
                  <span className="text-xs text-slate-400"> / day</span>
                </div>
                <button
                  onClick={() => setSelectedBed(bed)}
                  disabled={bed.availableBeds <= 0}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold shadow disabled:opacity-50"
                >
                  Book Bed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedBed && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-slate-800">Book Bed at {selectedBed.hospitalName}</h3>
              <button onClick={() => setSelectedBed(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleBookBed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward Type</label>
                <input type="text" disabled value={selectedBed.wardType.replace('_', ' ').toUpperCase()} className="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Days</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Condition / Notes</label>
                <textarea
                  required
                  rows={2}
                  value={patientCondition}
                  onChange={(e) => setPatientCondition(e.target.value)}
                  placeholder="Reason for admission..."
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
                </select>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg flex justify-between items-center font-bold">
                <span>Total Amount ({estimatedDays} days):</span>
                <span className="text-purple-600 text-lg">${selectedBed.pricePerDay * estimatedDays}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold shadow"
              >
                Confirm Bed Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
