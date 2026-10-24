import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Pill, Stethoscope, TestTube, Building2, Truck, User, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-sky-600" />
              <span className="text-2xl font-bold text-slate-800">Unicare</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-6">
              <Link to="/medicines" className="text-slate-600 hover:text-sky-600 font-medium flex items-center space-x-1">
                <Pill className="h-4 w-4 mr-1" /> Medicines
              </Link>
              <Link to="/doctors" className="text-slate-600 hover:text-sky-600 font-medium flex items-center space-x-1">
                <Stethoscope className="h-4 w-4 mr-1" /> Doctors
              </Link>
              <Link to="/blood-tests" className="text-slate-600 hover:text-sky-600 font-medium flex items-center space-x-1">
                <TestTube className="h-4 w-4 mr-1" /> Lab Tests
              </Link>
              <Link to="/beds" className="text-slate-600 hover:text-sky-600 font-medium flex items-center space-x-1">
                <Building2 className="h-4 w-4 mr-1" /> Hospital Beds
              </Link>
              <Link to="/ambulances" className="text-slate-600 hover:text-sky-600 font-medium flex items-center space-x-1">
                <Truck className="h-4 w-4 mr-1" /> Ambulance
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={`/dashboard/${user.role}`} className="flex items-center space-x-2 bg-sky-50 px-3 py-2 rounded-lg text-sky-700 hover:bg-sky-100 font-medium">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                  <span className="text-xs bg-sky-200 px-2 py-0.5 rounded uppercase">{user.role}</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-600 hover:text-sky-600 font-medium px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 font-medium shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
