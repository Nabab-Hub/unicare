import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Stethoscope, Search, Star, Video, Calendar, MapPin, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [consultType, setConsultType] = useState('video');
  const [symptoms, setSymptoms] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/appointments/doctors?search=${search}&specialization=${specialization}`);
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/appointments', {
        doctorId: selectedDoctor._id,
        appointmentDate,
        timeSlot,
        type: consultType,
        symptoms,
        paymentMethod
      });
      alert('Appointment booked successfully!');
      setSelectedDoctor(null);
      if (consultType === 'video' && res.data.appointment.videoCallRoom) {
        navigate(`/video/${res.data.appointment.videoCallRoom}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const specializations = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'General Physician', 'Gynecologist'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Stethoscope className="h-8 w-8 mr-3 text-sky-600" /> Doctors & Video Consultations
          </h1>
          <p className="text-slate-500 text-sm mt-1">Consult with verified medical experts in-person or via secure HD video conference</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors or hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Specialization Filter */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-8">
        <button
          onClick={() => setSpecialization('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!specialization ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          All Specializations
        </button>
        {specializations.map((spec) => (
          <button
            key={spec}
            onClick={() => setSpecialization(spec)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${specialization === spec ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {spec}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border shadow-sm">
          <p className="text-lg font-medium">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{doc.name}</h3>
                    <p className="text-sm font-medium text-sky-600">{doc.doctorProfile?.specialization || 'General Physician'}</p>
                  </div>
                  <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                    <Star className="h-3.5 w-3.5 mr-1 fill-amber-400 text-amber-400" />
                    {doc.doctorProfile?.rating || '4.8'} ({doc.doctorProfile?.totalReviews || 12})
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-slate-400" /> {doc.doctorProfile?.hospital || 'City General Hospital'}</p>
                  <p className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-slate-400" /> {doc.doctorProfile?.experience || 5}+ Years Experience</p>
                  <p className="flex items-center font-semibold text-slate-800"><DollarSign className="h-4 w-4 mr-1 text-emerald-600" /> Consultation Fee: ${doc.doctorProfile?.consultationFee || 500}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoctor(doc)}
                className="w-full bg-sky-600 text-white py-2.5 rounded-lg hover:bg-sky-700 font-medium shadow-sm flex items-center justify-center space-x-2"
              >
                <Video className="h-4 w-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-slate-800">Book Appointment with {selectedDoctor.name}</h3>
              <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setConsultType('video')}
                    className={`py-2 px-4 rounded-lg font-medium text-sm border ${consultType === 'video' ? 'bg-sky-50 border-sky-600 text-sky-700' : 'border-slate-300 text-slate-600'}`}
                  >
                    Video Consultation
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultType('in_person')}
                    className={`py-2 px-4 rounded-lg font-medium text-sm border ${consultType === 'in_person' ? 'bg-sky-50 border-sky-600 text-sky-700' : 'border-slate-300 text-slate-600'}`}
                  >
                    In-Person Visit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                  <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                  <option value="04:00 PM">04:00 PM - 04:30 PM</option>
                  <option value="06:00 PM">06:00 PM - 06:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms / Reason for Visit</label>
                <textarea
                  required
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms..."
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

              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center font-bold">
                <span>Consultation Fee:</span>
                <span className="text-sky-600 text-lg">${selectedDoctor.doctorProfile?.consultationFee || 500}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 font-semibold shadow"
              >
                Confirm & Pay
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
