'use client';

import { useState } from 'react';
import Link from 'next/link';

const BRANCHES = [
  'Colombo Fort Branch',
  'Kandy Branch',
  'Galle Branch',
];

const SERVICES = [
  'Cash Deposit',
  'Account Opening',
  'Card Services',
  'Loan Inquiry',
  'Document Submission',
  'General Inquiry',
];

export default function BookingPage() {
  const [form, setForm] = useState({
    branch: '',
    service: '',
    arrivalType: 'now',
    arrivalTime: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const getMinTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const bankOpen = new Date();
    bankOpen.setHours(8, 30, 0, 0);
    const earliest = now > bankOpen ? now : bankOpen;
    const year = earliest.getFullYear();
    const month = String(earliest.getMonth() + 1).padStart(2, '0');
    const day = String(earliest.getDate()).padStart(2, '0');
    const hours = String(earliest.getHours()).padStart(2, '0');
    const minutes = String(earliest.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMaxTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T15:00`;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.branch) newErrors.branch = 'Please select a branch';
    if (!form.service) newErrors.service = 'Please select a service type';
    if (form.arrivalType === 'later' && !form.arrivalTime)
      newErrors.arrivalTime = 'Please select your arrival time';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBookedToken('CF-001');
    }, 1500);
  };

  if (bookedToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Your Token</p>
          <p className="text-6xl font-bold text-blue-900 mb-2">{bookedToken}</p>
          <p className="text-gray-500 text-sm mb-2">{form.branch}</p>
          <p className="text-gray-500 text-sm mb-6">{form.service}</p>
          {form.arrivalType === 'later' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-sm text-yellow-700">
              Your token is safely held until your arrival time.
              You will not be marked no-show while on your way.
            </div>
          )}
          <Link
            href="/tracker"
            className="block w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition text-center"
          >
            Track My Queue Position
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-900 text-white px-6 py-2 rounded-xl mb-3">
            <h1 className="text-2xl font-bold">iQueue</h1>
          </div>
          <p className="text-gray-400 text-sm">Skip the queue. Bank smarter.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-1.5 bg-blue-900"></div>
          <div className="p-8">

            <h2 className="text-xl font-bold text-gray-800 mb-1">Book Your Token</h2>
            <p className="text-xs text-gray-400 mb-4">Banking hours: 8:30 AM — 3:00 PM</p>

            {/* Collapsible instructions */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-900 hover:bg-blue-100 transition"
              >
                <span>📋 How to book — tap to {showInstructions ? 'hide' : 'view'}</span>
                <span>{showInstructions ? '▲' : '▼'}</span>
              </button>
              {showInstructions && (
                <div className="border border-blue-100 border-t-0 rounded-b-xl bg-blue-50 px-4 pb-4 pt-3 space-y-2">
                  {[
                    'Select your nearest branch from the dropdown.',
                    'Choose the service type you need.',
                    'Select Now if you are heading to the branch immediately.',
                    'Select Later if you plan to arrive within banking hours (8:30 AM — 3:00 PM). Your token will be safely held.',
                    'You will receive a token number after booking.',
                    'Track your position on the tracker page.',
                    'You must arrive within 5 minutes of being called or your token will be marked no-show.',
                    'Only one active token is allowed per customer at a time.',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-blue-800 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                <select
                  value={form.branch}
                  onChange={(e) => { setForm({ ...form, branch: e.target.value }); setErrors({ ...errors, branch: '' }); }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.branch ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                >
                  <option value="">Choose a branch...</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select
                  value={form.service}
                  onChange={(e) => { setForm({ ...form, service: e.target.value }); setErrors({ ...errors, service: '' }); }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.service ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                >
                  <option value="">Choose a service...</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
              </div>

              {/* Arrival Time Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                <div className="flex gap-2 mb-3">
                  <button type="button"
                    onClick={() => setForm({ ...form, arrivalType: 'now', arrivalTime: '' })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${form.arrivalType === 'now' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  >
                    Now
                  </button>
                  <button type="button"
                    onClick={() => setForm({ ...form, arrivalType: 'later' })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${form.arrivalType === 'later' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  >
                    Later
                  </button>
                </div>

                {form.arrivalType === 'later' && (
                  <div>
                    <input
                      type="datetime-local"
                      value={form.arrivalTime}
                      min={getMinTime()}
                      max={getMaxTime()}
                      onChange={(e) => { setForm({ ...form, arrivalTime: e.target.value }); setErrors({ ...errors, arrivalTime: '' }); }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.arrivalTime ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                    />
                    {errors.arrivalTime && <p className="text-red-500 text-xs mt-1">{errors.arrivalTime}</p>}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-3 text-sm text-yellow-700">
                      Your token is safely held until your arrival time.
                      You will not be marked no-show while on your way.
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                {loading ? 'Booking your token...' : 'Book My Token'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}