import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Stethoscope, Pill, Building2, Truck, DollarSign, CheckCircle, Clock } from 'lucide-react';

export const Dashboard = () => {
  const { role } = useParams();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (role === 'authority') {
        const res = await API.get('/admin/dashboard');
        setStats(res.data.stats);
      }
      const ordersRes = await API.get('/orders/my');
      setMyOrders(ordersRes.data.orders);

      const apptRes = await API.get('/appointments/my-appointments');
      setMyAppointments(apptRes.data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading {role} dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">{role} Portal Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span> ({user?.email})</p>
        </div>
        <div className="bg-sky-50 text-sky-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          Role: {role}
        </div>
      </div>

      {role === 'authority' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Patients</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Doctors</p>
            <p className="text-3xl font-extrabold text-sky-600 mt-2">{stats.totalDoctors}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Orders & Bookings</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Appointments & Orders Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-sky-600" /> Recent Appointments
          </h3>
          {myAppointments.length === 0 ? (
            <p className="text-slate-500 text-sm">No appointments found.</p>
          ) : (
            <div className="space-y-3">
              {myAppointments.map(appt => (
                <div key={appt._id} className="bg-slate-50 p-4 rounded-lg border text-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">Dr. {appt.doctor?.name} ({appt.doctor?.doctorProfile?.specialization})</p>
                    <p className="text-xs text-slate-500">Date: {new Date(appt.appointmentDate).toLocaleDateString()} | {appt.timeSlot}</p>
                  </div>
                  <span className="text-xs bg-sky-100 text-sky-700 font-semibold px-2.5 py-1 rounded-full uppercase">{appt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <Pill className="h-5 w-5 mr-2 text-emerald-600" /> Recent Orders & Bookings
          </h3>
          {myOrders.length === 0 ? (
            <p className="text-slate-500 text-sm">No orders found.</p>
          ) : (
            <div className="space-y-3">
              {myOrders.map(order => (
                <div key={order._id} className="bg-slate-50 p-4 rounded-lg border text-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">Order #{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">Type: {order.orderType.toUpperCase()} | Total: ${order.finalAmount.toFixed(2)}</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full uppercase">{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
