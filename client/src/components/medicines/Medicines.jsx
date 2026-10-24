import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Pill, Search, ShoppingCart, Tag, AlertCircle } from 'lucide-react';

export const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, [category, search]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/medicines?search=${search}&category=${category}`);
      setMedicines(res.data.medicines);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (med) => {
    const existing = cart.find(item => item.medicineId === med._id);
    if (existing) {
      setCart(cart.map(item => item.medicineId === med._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { medicineId: med._id, name: med.name, price: med.sellingPrice, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.medicineId === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/medicines/order', {
        items: cart,
        paymentMethod,
        deliveryAddress: address,
        notes
      });
      setOrderSuccess(res.data.order);
      setCart([]);
      setShowCheckout(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    }
  };

  const categories = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'supplement'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Pill className="h-8 w-8 mr-3 text-sky-600" /> Online Pharmacy Marketplace
          </h1>
          <p className="text-slate-500 text-sm mt-1">Buy 100% genuine medicines at up to 30% cheaper prices than local stores</p>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicines or generic names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            className="relative bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center space-x-2 shadow"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((a, c) => a + c.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold mb-1">Order Placed Successfully!</h3>
          <p className="text-sm">Order Number: <span className="font-mono font-semibold">{orderSuccess.orderNumber}</span></p>
          <p className="text-sm">Total Amount: ${orderSuccess.finalAmount.toFixed(2)} via {orderSuccess.paymentMethod.toUpperCase()}</p>
          <button onClick={() => setOrderSuccess(null)} className="mt-3 text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Close</button>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-8">
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!category ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          All Medicines
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap ${category === cat ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading medicines...</div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-2" />
          <p className="text-lg font-medium">No medicines found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {medicines.map((med) => (
            <div key={med._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-sky-100 text-sky-700 font-semibold px-2.5 py-0.5 rounded-full uppercase">{med.category}</span>
                  {med.discount > 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded flex items-center">
                      <Tag className="h-3 w-3 mr-1" /> {med.discount}% OFF
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{med.name}</h3>
                <p className="text-xs text-slate-500 mb-2">Generic: {med.genericName}</p>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2">{med.description || med.composition}</p>
              </div>
              <div>
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-xl font-bold text-slate-900">${med.sellingPrice.toFixed(2)}</span>
                  {med.mrp > med.sellingPrice && (
                    <span className="text-sm text-slate-400 line-through">${med.mrp.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(med)}
                  disabled={med.stock <= 0}
                  className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 text-sm font-medium shadow-sm transition-all disabled:opacity-50"
                >
                  {med.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Modal / Checkout Drawer */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-2 text-sky-600" /> Your Cart
                </h2>
                <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-slate-500 text-center py-12">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.medicineId} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.medicineId, -1)} className="w-7 h-7 bg-white border rounded font-bold text-slate-600 hover:bg-slate-100">-</button>
                        <span className="text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.medicineId, 1)} className="w-7 h-7 bg-white border rounded font-bold text-slate-600 hover:bg-slate-100">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-slate-800">Delivery Address</h3>
                  <input
                    type="text"
                    required
                    placeholder="Street Address"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
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

                  <h3 className="font-semibold text-slate-800 pt-2">Payment Method</h3>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>

                  <textarea
                    placeholder="Prescription notes or delivery instructions (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={2}
                  ></textarea>
                </form>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total Amount:</span>
                  <span className="text-sky-600">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 font-semibold shadow"
                >
                  Confirm & Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
