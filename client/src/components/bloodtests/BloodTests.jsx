import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { TestTube, Search, Home, CheckCircle2 } from 'lucide-react';

export const BloodTests = () => {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [collectionDate, setCollectionDate] = useState('');
  const [collectionTimeSlot, setCollectionTimeSlot] = useState('08:00 AM - 10:00 AM');
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    fetchTests();
  }, [search, category]);

  const fetchTests = async () => {
    try {
      const res = await API.get(`/blood-tests?search=${search}&category=${category}`);
      setTests(res.data.tests);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectTest = (test) => {
    if (selectedTests.find(t => t._id === test._id)) {
      setSelectedTests(selectedTests.filter(t => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const totalPrice = selectedTests.reduce((sum, t) => sum + t.sellingPrice, 0);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await API.post('/blood-tests/book', {
        testIds: selectedTests.map(t => t._id),
        collectionDate,
        collectionTimeSlot,
        collectionAddress: address,
        paymentMethod
      });
      alert('Blood test booked successfully! Our expert will visit your home for sample collection.');
      setSelectedTests([]);
      setShowBooking(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const categories = ['routine', 'specialized', 'allergy', 'hormone', 'cancer', 'infection'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <TestTube className="h-8 w-8 mr-3 text-indigo-600" /> Diagnostic Blood Tests & Home Collection
          </h1>
          <p className="text-slate-500 text-sm mt-1">Book certified lab tests and expert home sample collection in your region</p>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search blood tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          {selectedTests.length > 0 && (
            <button
              onClick={() => setShowBooking(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold shadow flex items-center space-x-2 whitespace-nowrap"
            >
              <span>Book ({selectedTests.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-4 mb-8">
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!category ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          All Tests
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap ${category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => {
          const isSelected = selectedTests.find(t => t._id === test._id);
          return (
            <div key={test._id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between transition-all ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full uppercase">{test.category}</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded flex items-center">
                    <Home className="h-3 w-3 mr-1" /> Home Collection
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{test.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{test.description}</p>
                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <p><strong>Parameters:</strong> {test.parameters?.join(', ') || 'Standard panel'}</p>
                  <p><strong>Report Time:</strong> {test.reportTime || '24 Hours'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-xl font-bold text-slate-900">${test.sellingPrice.toFixed(2)}</span>
                  {test.mrp > test.sellingPrice && <span className="text-xs text-slate-400 line-through ml-2">${test.mrp.toFixed(2)}</span>}
                </div>
                <button
                  onClick={() => toggleSelectTest(test)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${isSelected ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {isSelected ? 'Selected' : 'Add to Booking'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-slate-800">Home Blood Sample Collection</h3>
              <button onClick={() => setShowBooking(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <div className="mb-4 bg-slate-50 p-3 rounded-lg">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Selected Tests ({selectedTests.length})</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedTests.map(t => (
                  <div key={t._id} className="flex justify-between text-sm">
                    <span>{t.name}</span>
                    <span className="font-semibold">${t.sellingPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Collection Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={collectionTimeSlot}
                    onChange={(e) => setCollectionTimeSlot(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM</option>
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Collection Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
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

              <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center font-bold">
                <span>Total Amount:</span>
                <span className="text-indigo-600 text-lg">${totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold shadow"
              >
                Confirm Booking & Expert Home Collection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
