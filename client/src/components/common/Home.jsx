import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Stethoscope, TestTube, Building2, Truck, ShieldCheck, Zap, HeartPulse } from 'lucide-react';

export const Home = () => {
  const services = [
    {
      title: 'Online Medicines',
      description: 'Buy genuine medicines at cheaper prices than local markets with quick home delivery.',
      icon: <Pill className="h-8 w-8 text-sky-600" />,
      link: '/medicines',
      color: 'bg-sky-50 border-sky-100'
    },
    {
      title: 'Doctor Appointments & Video Call',
      description: 'Book online appointments with top doctors or consult instantly via HD video conference.',
      icon: <Stethoscope className="h-8 w-8 text-emerald-600" />,
      link: '/doctors',
      color: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Home Blood Sample Collection',
      description: 'Book blood tests from certified diagnostics in your region. Experts collect samples at home.',
      icon: <TestTube className="h-8 w-8 text-indigo-600" />,
      link: '/blood-tests',
      color: 'bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Hospital Bed Booking',
      description: 'Real-time availability and booking for general wards, ICU, and private hospital beds.',
      icon: <Building2 className="h-8 w-8 text-purple-600" />,
      link: '/beds',
      color: 'bg-purple-50 border-purple-100'
    },
    {
      title: 'Emergency Ambulance',
      description: 'Book basic or ICU ambulances instantly with live Google Maps tracking.',
      icon: <Truck className="h-8 w-8 text-rose-600" />,
      link: '/ambulances',
      color: 'bg-rose-50 border-rose-100'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white py-20 px-4 sm:px-6 lg:px-8 text-center rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 shadow-xl">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 bg-sky-500/30 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium">
            <HeartPulse className="h-4 w-4 text-rose-300 animate-pulse" />
            <span>Next-Generation Healthcare Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Your Complete Healthcare Partner — <span className="text-sky-200">Unicare</span>
          </h1>
          <p className="text-lg text-sky-100">
            Cheaper medicines, expert doctor video consultations, emergency ambulance dispatch, hospital bed booking, and certified home diagnostics — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/medicines"
              className="bg-white text-sky-700 px-6 py-3 rounded-xl font-semibold hover:bg-sky-50 shadow-lg transition-all"
            >
              Order Medicines (Cheaper Prices)
            </Link>
            <Link
              to="/doctors"
              className="bg-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-400 shadow-lg border border-sky-400 transition-all"
            >
              Consult a Doctor
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-800">Comprehensive Medical Services</h2>
          <p className="text-slate-500 mt-2">Access quality healthcare services instantly with transparent pricing and live tracking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <Link
              key={idx}
              to={service.link}
              className={`p-8 rounded-2xl border ${service.color} hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                <div className="mb-4 bg-white p-3 rounded-xl inline-block shadow-sm">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{service.title}</h3>
                <p className="text-slate-600 text-sm">{service.description}</p>
              </div>
              <div className="mt-6 flex items-center text-sm font-semibold text-sky-600">
                Explore service &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Choose Unicare */}
      <div className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Why Choose Unicare?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-sky-100 text-sky-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Up to 30% Cheaper Medicines</h3>
              <p className="text-slate-500 text-sm">Directly sourced from verified manufacturers and partner pharmacies at discounted prices.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Verified Expert Doctors</h3>
              <p className="text-slate-500 text-sm">Consult with certified specialists via secure HD video conferences and get digital prescriptions.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Real-Time Tracking & UPI Payments</h3>
              <p className="text-slate-500 text-sm">Live Google Maps tracking for orders & ambulances with secure payments via UPI, cards, and PayPal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
