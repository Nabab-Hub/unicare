import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import { MapPin, Navigation, Truck, CheckCircle2, Clock, Phone } from 'lucide-react';

export const Tracking = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000); // Poll for live update
    return () => clearInterval(interval);
  }, [id]);

  const fetchTracking = async () => {
    try {
      const res = await API.get(`/ambulances/bookings/my`);
      const found = res.data.bookings.find(b => b._id === id);
      if (found) setBooking(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading live tracking...</div>;
  if (!booking) return <div className="text-center py-20 text-slate-500">Tracking record not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <Navigation className="h-7 w-7 text-rose-600 mr-3 animate-spin" /> Live GPS Tracking & Ambulance Dispatch
            </h1>
            <p className="text-sm text-slate-500">Real-time location sync via Google Maps integration</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-sm font-bold uppercase">
            Status: {booking.status}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Simulation Box */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl h-[450px] relative overflow-hidden flex items-center justify-center shadow-inner border border-slate-800">
            {/* Simulated Google Map grid background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

            <div className="text-center z-10 space-y-3">
              <div className="inline-block bg-rose-600 text-white p-4 rounded-full shadow-2xl animate-bounce">
                <Truck className="h-10 w-10" />
              </div>
              <p className="text-white font-bold text-lg">Ambulance En Route</p>
              <p className="text-xs text-sky-400 font-mono">GPS Coordinates: 28.6139° N, 77.2090° E</p>
              <div className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 inline-block">
                Estimated Arrival: <span className="font-bold text-emerald-400">4 Minutes</span>
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Ambulance Details</h3>
              <p className="text-sm font-semibold text-rose-600 mb-1">{booking.ambulance?.vehicleNumber} ({booking.ambulance?.vehicleType})</p>
              <p className="text-xs text-slate-600 mb-1">Driver: {booking.ambulance?.driver?.name || 'Authorized Driver'}</p>
              <p className="text-xs text-slate-600 flex items-center"><Phone className="h-3 w-3 mr-1 text-slate-400" /> {booking.ambulance?.driver?.phone || '1800-999-888'}</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Pickup & Destination</h3>
              <p className="text-xs text-slate-600 mb-2"><strong>Pickup:</strong> {booking.pickupLocation?.address}</p>
              <p className="text-xs text-slate-600"><strong>Emergency Type:</strong> {booking.emergencyType.toUpperCase()}</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Fare Summary</h3>
              <div className="flex justify-between text-sm font-bold text-slate-800">
                <span>Estimated Fare:</span>
                <span className="text-rose-600">${booking.estimatedFare}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Payment Method: {booking.paymentMethod.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
