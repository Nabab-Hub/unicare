import React from 'react';
import { Activity, Heart, Shield, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-8 w-8 text-sky-400" />
              <span className="text-2xl font-bold text-white">Unicare</span>
            </div>
            <p className="text-sm text-slate-400">
              Your comprehensive healthcare partner. Affordable medicines, expert doctors, hospital beds, ambulance tracking, and home blood tests.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/medicines" className="hover:text-sky-400">Buy Medicines</a></li>
              <li><a href="/doctors" className="hover:text-sky-400">Book Doctor Appointment</a></li>
              <li><a href="/blood-tests" className="hover:text-sky-400">Home Blood Tests</a></li>
              <li><a href="/beds" className="hover:text-sky-400">Hospital Beds Booking</a></li>
              <li><a href="/ambulances" className="hover:text-sky-400">Emergency Ambulance</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/login?role=patient" className="hover:text-sky-400">Patient Portal</a></li>
              <li><a href="/login?role=doctor" className="hover:text-sky-400">Doctor Portal</a></li>
              <li><a href="/login?role=provider" className="hover:text-sky-400">Provider / Pharmacy Portal</a></li>
              <li><a href="/login?role=employee" className="hover:text-sky-400">Employee Portal</a></li>
              <li><a href="/login?role=authority" className="hover:text-sky-400">Authority / Admin Portal</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Emergency Contact</h3>
            <p className="text-sm text-slate-400 mb-2 flex items-center"><Phone className="h-4 w-4 mr-2 text-sky-400" /> 24/7 Helpline: 1800-UNICARE</p>
            <p className="text-sm text-slate-400 mb-2 flex items-center"><Mail className="h-4 w-4 mr-2 text-sky-400" /> support@unicare.health</p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Secure 256-bit Encrypted Platform</span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Unicare Healthcare Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
