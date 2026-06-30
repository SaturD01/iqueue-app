'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const SERVICES = [
  { counter: 'Counter 1 — Cash', options: ['Cash Deposit'] },
  { counter: 'Counter 2 — Account & Inquiry', options: ['Account Opening', 'General Inquiry', 'Document Submission'] },
  { counter: 'Counter 3 — Loans & Cards', options: ['Loan Inquiry', 'Card Services'] },
];

export default function BookingPage() {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [branchError, setBranchError] = useState('');
  const [form, setForm] = useState({
    branch: '',
    service: '',
    arrivalType: 'now',
    arrivalTime: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);
  const [queueCount, setQueueCount] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('iqueue_token');
    if (!token) router.push('/login');
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/api/branches');
        setBranches(response.data.branches || response.data);
      } catch (err) {
        setBranchError('Could not load branches. Please refresh the page.');
      }
    };
    fetchBranches();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('iqueue_token');
    localStorage.removeItem('iqueue_user');
    router.push('/login');
  };
  const fetchQueueCount = async (branchId) => {
    if (!branchId) { setQueueCount(null); return; }
    try {
      const response = await api.get(`/api/tokens/queue?branchId=${branchId}`);
      setQueueCount(response.data.count || 0);
    } catch {
      setQueueCount(null);
    }
  };
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
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, '0');
    const day = String(future.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T15:00`;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.branch) newErrors.branch = 'Please select a branch';
    if (!form.service) newErrors.service = 'Please select a service type';
    if (form.arrivalType === 'later') {
      if (!form.arrivalTime) {
        newErrors.arrivalTime = 'Please select your arrival time';
      } else {
        const selected = new Date(form.arrivalTime);
        const hours = selected.getHours();
        const minutes = selected.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        if (totalMinutes < 8 * 60 + 30 || totalMinutes > 15 * 60) {
          newErrors.arrivalTime = 'Please select a time between 8:30 AM and 3:00 PM';
        }
      }
    }
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
    try {
      const body = { branchId: form.branch, serviceName: form.service };
      if (form.arrivalType === 'later' && form.arrivalTime) {
        body.arrivalTime = form.arrivalTime;
      }
      const response = await api.post('/api/tokens', body);
      setBookedToken(response.data.token.tokenNumber);
    } catch (err) {
      const message = err.response?.data?.message || 'Booking failed. Please try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (bookedToken) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>✓</span>
          </div>
          <p className='text-sm text-gray-400 uppercase tracking-widest mb-2'>Your Token</p>
          <p className='text-6xl font-bold text-brand-navy mb-2'>{bookedToken}</p>
          <p className='text-gray-500 text-sm mb-6'>{form.service}</p>
          {form.arrivalType === 'later' && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-sm text-yellow-700'>
              Your token is safely held until your arrival time.
              You will not be marked no-show while on your way.
            </div>
          )}
          <a href='/tracker' className='block w-full bg-brand-navy text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition mb-3'>
            Track My Queue Position
          </a>
          <button onClick={handleLogout} className='text-sm text-gray-400 hover:text-red-500 font-medium transition'>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>

        {/* Header with logout */}
        <div className='flex items-start justify-between mb-8'>
          <div className='flex-1 text-center'>
            <div className='inline-block bg-brand-navy text-white px-6 py-2 rounded-xl mb-3'>
              <h1 className='text-2xl font-bold'>iQueue</h1>
            </div>
            <p className='text-gray-400 text-sm'>Skip the queue. Bank smarter.</p>
          </div>
          <button
            onClick={handleLogout}
            className='text-sm text-gray-400 hover:text-red-500 font-medium transition ml-4'
          >
            Logout
          </button>
        </div>

        {/* Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='h-1.5 bg-brand-navy'></div>
          <div className='p-8'>
            <h2 className='text-xl font-bold text-gray-800 mb-1'>Book Your Token</h2>
            <p className='text-xs text-gray-400 mb-6'>Banking hours: 8:30 AM — 3:00 PM</p>

            <form onSubmit={handleSubmit} className='space-y-5'>

              {errors.submit && (
                <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl'>
                  {errors.submit}
                </div>
              )}

              {/* Branch */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Select Branch</label>
                {branchError && <p className='text-red-500 text-xs mb-2'>{branchError}</p>}
                <select
                  value={form.branch}
                  onChange={(e) => { setForm({ ...form, branch: e.target.value }); setErrors({ ...errors, branch: '' }); fetchQueueCount(e.target.value); }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.branch ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                >
                  <option value=''>Choose a branch...</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
                {errors.branch && <p className='text-red-500 text-xs mt-1'>{errors.branch}</p>}
                {queueCount !== null && (
                  <p className='text-xs text-blue-700 mt-2 font-medium'>
                    🟢 {queueCount} {queueCount === 1 ? 'customer' : 'customers'} currently waiting at this branch
                  </p>
                )}
              </div>

              {/* Service */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Service Type</label>
                <select
                  value={form.service}
                  onChange={(e) => { setForm({ ...form, service: e.target.value }); setErrors({ ...errors, service: '' }); }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.service ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                >
                  <option value=''>Choose a service...</option>
                  {SERVICES.map(group => (
                    <optgroup key={group.counter} label={group.counter}>
                      {group.options.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  ))}
                </select>
                {errors.service && <p className='text-red-500 text-xs mt-1'>{errors.service}</p>}
              </div>

              {/* Arrival Time Toggle */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Arrival Time</label>
                <div className='flex gap-2 mb-3'>
                  <button type='button'
                    onClick={() => setForm({ ...form, arrivalType: 'now', arrivalTime: '' })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${form.arrivalType === 'now' ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  >
                    Now
                  </button>
                  <button type='button'
                    onClick={() => setForm({ ...form, arrivalType: 'later' })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${form.arrivalType === 'later' ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  >
                    Later
                  </button>
                </div>
                {form.arrivalType === 'later' && (
                  <div>
                    <input
                      type='datetime-local'
                      value={form.arrivalTime}
                      min={getMinTime()}
                      max={getMaxTime()}
                      onChange={(e) => { setForm({ ...form, arrivalTime: e.target.value }); setErrors({ ...errors, arrivalTime: '' }); }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.arrivalTime ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                    />
                    {errors.arrivalTime && <p className='text-red-500 text-xs mt-1'>{errors.arrivalTime}</p>}
                    <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-3 text-sm text-yellow-700'>
                      No need to wait at the branch! Your token is safely held until your selected arrival time.
                      Simply arrive around your chosen time and track your position live on your phone.
                      Head to the counter only when you are nearly called.
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type='submit' disabled={loading}
                className='w-full bg-brand-navy text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2'
              >
                {loading && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
                {loading ? 'Booking your token...' : 'Book My Token'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
