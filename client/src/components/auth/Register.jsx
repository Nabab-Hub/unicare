import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, Phone, User, Building, Stethoscope } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('patient');

  // Doctor specific
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [hospital, setHospital] = useState('');

  // Provider specific
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('pharmacy');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = { name, email, password, phone, role };
      if (role === 'doctor') {
        userData.doctorProfile = { specialization, consultationFee: Number(consultationFee), hospital };
      } else if (role === 'provider') {
        userData.providerProfile = { businessName, businessType };
      }

      await register(userData);
      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <div className="text-center mb-6">
          <Activity className="h-12 w-12 text-sky-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-slate-800">Create Unicare Account</h2>
          <p className="text-sm text-slate-500">Join our advanced healthcare network</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="provider">Provider (Pharmacy / Lab / Hospital / Ambulance)</option>
              <option value="employee">Employee / Delivery</option>
              <option value="authority">Authority / Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {role === 'doctor' && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">Doctor Professional Details</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="e.g. Cardiologist, Dermatologist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee ($)</label>
                <input
                  type="number"
                  required
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="City General Hospital"
                />
              </div>
            </div>
          )}

          {role === 'provider' && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">Provider Business Details</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="Apollo Pharmacy / City Diagnostics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="pharmacy">Pharmacy / Medicine Store</option>
                  <option value="diagnostic">Diagnostic Laboratory</option>
                  <option value="hospital">Hospital / Bed Provider</option>
                  <option value="ambulance">Ambulance Service</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2.5 rounded-lg hover:bg-sky-700 font-medium shadow transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-600 hover:underline font-medium">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
