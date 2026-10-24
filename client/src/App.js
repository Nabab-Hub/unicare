import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Home } from './components/common/Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Medicines } from './components/medicines/Medicines';
import { Doctors } from './components/appointments/Doctors';
import { BloodTests } from './components/bloodtests/BloodTests';
import { Beds } from './components/ambulance/Beds';
import { Ambulances } from './components/ambulance/Ambulances';
import { VideoCall } from './components/video/VideoCall';
import { Tracking } from './components/tracking/Tracking';
import { Dashboard } from './components/dashboard/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/blood-tests" element={<BloodTests />} />
              <Route path="/beds" element={<Beds />} />
              <Route path="/ambulances" element={<Ambulances />} />
              <Route path="/video/:roomId" element={<VideoCall />} />
              <Route path="/track/ambulance/:id" element={<Tracking />} />
              <Route path="/dashboard/:role" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
