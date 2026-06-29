/**
 * @file tracker/page.jsx
 * @description Live Queue Tracker page with real-time status updates,
 *              5-minute countdown timer for CALLED status, cancel token,
 *              and star rating after SERVED.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 * @updated 2026-06-29
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
const COUNTERS = [
  { id: 1, name: 'Counter 1', label: 'Cash', services: ['Cash Deposit'] },
  { id: 2, name: 'Counter 2', label: 'Account & Inquiry', services: ['Account Opening', 'General Inquiry', 'Document Submission'] },
  { id: 3, name: 'Counter 3', label: 'Loans & Cards', services: ['Loan Inquiry', 'Card Services'] },
];

function getCounterForService(serviceName) {
  return COUNTERS.find(c => c.services.includes(serviceName)) || COUNTERS[0];
}

const STATUS_CONFIG = {
  HELD: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800',
    pulse: false,
    message: 'Your token is safely held until your arrival time.',
    sub: 'You will not be marked no-show while on your way.',
  },
  CALLABLE: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    badge: 'bg-blue-100 text-blue-800',
    pulse: false,
    message: 'You are in the queue.',
    sub: 'Head to the branch when your position reaches 1.',
  },
  CALLED: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    badge: 'bg-green-100 text-green-800',
    pulse: true,
    message: 'It is your turn — go to the counter now!',
    sub: 'You have 5 minutes to appear or you will be marked no-show.',
  },
  SERVED: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    badge: 'bg-gray-100 text-gray-600',
    pulse: false,
    message: 'You have been served. Thank you for banking with us!',
    sub: 'Please rate your experience below.',
  },
  NO_SHOW: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    badge: 'bg-red-100 text-red-800',
    pulse: false,
    message: 'You were marked as no-show.',
    sub: 'You may book a new token at any time.',
  },
  PRIORITY: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    badge: 'bg-purple-100 text-purple-800',
    pulse: true,
    message: 'You have been issued a priority token.',
    sub: 'Please proceed to the counter immediately.',
  },
  CANCELLED: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    badge: 'bg-gray-100 text-gray-500',
    pulse: false,
    message: 'Your token has been cancelled.',
    sub: 'You may book a new token at any time.',
  },
};

const DEMO_STATUSES = ['HELD', 'CALLABLE', 'CALLED', 'SERVED', 'NO_SHOW', 'PRIORITY', 'CANCELLED'];
const COUNTDOWN_SECONDS = 5 * 60;
const CANCELLABLE_STATUSES = ['CALLABLE', 'HELD', 'PRIORITY'];
const TERMINAL_STATUSES = ['SERVED', 'NO_SHOW', 'CANCELLED'];

export default function TrackerPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [position, setPosition] = useState(null);
  const [nowServing, setNowServing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const config = STATUS_CONFIG[token?.status] || STATUS_CONFIG.CALLABLE;

  const fetchToken = useCallback(async () => {
    const jwt = localStorage.getItem('iqueue_token');
    if (!jwt) {
      router.push('/login');
      return;
    }
    try {
      setError('');
      const response = await api.get('/api/tokens/my');
      setToken(response.data.token);
      setPosition(response.data.position);
      setNowServing(response.data.nowServing);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No active token found. Please book a token first.');
      } else {
        setError('Could not load your token. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    const jwt = localStorage.getItem('iqueue_token');
    if (!jwt) return;

    const { io } = require('socket.io-client');
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    const user = JSON.parse(localStorage.getItem('iqueue_user') || '{}');
    if (user.branchId) {
      socket.emit('join:branch', user.branchId);
    } else if (token?.branchId?._id) {
      socket.emit('join:branch', token.branchId._id);
    }

    socket.on('token:called', ({ token: calledToken }) => {
      if (token && calledToken._id === token._id) fetchToken();
    });

    socket.on('token:served', ({ token: servedToken }) => {
      if (token && servedToken._id === token._id) fetchToken();
    });

    socket.on('token:booked', () => fetchToken());
    socket.on('queue:updated', () => fetchToken());

    return () => socket.disconnect();
  }, [token, fetchToken]);

  useEffect(() => {
    if (token?.status !== 'CALLED') {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [token?.status, countdown]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('iqueue_token');
    localStorage.removeItem('iqueue_user');
    router.push('/login');
  };

  const handleCancelToken = async () => {
    if (!token) return;
    setCancelError('');
    setCancelling(true);
    try {
      await api.patch(`/api/tokens/${token._id}/cancel`);
      await fetchToken();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Could not cancel token. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRating = async (score) => {
    setRating(score);
    try {
      await api.post('/api/ratings', {
        tokenId: token._id,
        branchId: token.branchId._id || token.branchId,
        score,
      });
      setRated(true);
    } catch {
      setRated(true);
    }
  };

  const handleStatusChange = (status) => {
    setToken(prev => ({ ...prev, status }));
    setCountdown(COUNTDOWN_SECONDS);
    setRated(false);
    setRating(0);
    setCancelError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your queue position...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md text-center">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <a href="/booking" className="block w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition mb-3">
            Book a Token
          </a>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 font-medium transition">
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">

        {/* Header with logout */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">iQueue</h1>
            <p className="text-gray-400 text-sm mt-1">Live Queue Tracker</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 font-medium transition"
          >
            Logout
          </button>
        </div>

        {/* Token number card */}
        <div className={`rounded-2xl border-2 p-6 mb-4 text-center ${config.bg} ${config.border}`}>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Your Token</p>
          <p className="text-7xl font-bold text-blue-900 mb-3">{token.tokenNumber}</p>
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${config.badge}`}>
            {config.pulse && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
            {token.status}
          </span>
        </div>

        {/* CALLED countdown timer */}
        {token.status === 'CALLED' && (
          <div className={`rounded-2xl border-2 p-4 mb-4 text-center ${countdown <= 60 ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'}`}>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Time Remaining</p>
            <p className={`text-5xl font-bold font-mono ${countdown <= 60 ? 'text-red-600' : 'text-green-700'}`}>
              {formatCountdown(countdown)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {countdown <= 60 ? 'Hurry! Almost out of time.' : 'Please proceed to the counter now.'}
            </p>
          </div>
        )}

        {/* Status message */}
        <div className={`rounded-2xl border-2 p-4 mb-4 ${config.bg} ${config.border}`}>
          <p className="font-semibold text-gray-800">{config.message}</p>
          <p className="text-sm text-gray-500 mt-1">{config.sub}</p>
        </div>

        {/* Queue stats */}
        {!TERMINAL_STATUSES.includes(token.status) && token.status !== 'CALLED' && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-900">#{position}</p>
              <p className="text-xs text-gray-400 mt-1">Position</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-900">{position ? (position - 1) * 5 : 0}</p>
              <p className="text-xs text-gray-400 mt-1">Est. mins</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-lg font-bold text-blue-900">{nowServing || '--'}</p>
              <p className="text-xs text-gray-400 mt-1">Now serving</p>
            </div>
          </div>
        )}

        {/* Branch and service info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Branch</span>
            <span className="text-sm font-medium text-gray-800">{token.branchId?.name || '--'}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Service</span>
            <span className="text-sm font-medium text-gray-800">{token.serviceName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Counter</span>
            <span className="text-sm font-medium text-blue-900">
              {getCounterForService(token.serviceName).name} — {getCounterForService(token.serviceName).label}
            </span>
          </div>
        </div>

        {/* Cancel token button */}
        {CANCELLABLE_STATUSES.includes(token.status) && (
          <div className="mb-4">
            {cancelError && (
              <p className="text-red-500 text-sm text-center mb-2">{cancelError}</p>
            )}
            <button
              onClick={handleCancelToken}
              disabled={cancelling}
              className="w-full py-3 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 hover:border-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Token'}
            </button>
          </div>
        )}

        {/* Book new token CTA */}
        {TERMINAL_STATUSES.includes(token.status) && (
          <div className="mb-4">
            <a
              href="/booking"
              className="block w-full py-3 rounded-xl bg-blue-900 text-white font-semibold text-center hover:bg-blue-800 transition"
            >
              Book a New Token
            </a>
          </div>
        )}

        {/* Live indicator */}
        {!TERMINAL_STATUSES.includes(token.status) && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Live updates active</span>
          </div>
        )}

        {/* Star rating */}
        {token.status === 'SERVED' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center mb-4">
            <p className="font-semibold text-gray-800 mb-1">How was your experience?</p>
            <p className="text-xs text-gray-400 mb-4">Tap a star to rate your visit</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  disabled={rated}
                  className={`text-4xl transition-transform hover:scale-110 disabled:cursor-default ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            {rated && (
              <p className="text-sm text-green-600 font-medium mt-3">
                Thank you for your feedback!
              </p>
            )}
          </div>
        )}

        {/* Demo status buttons */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 text-center">
            Demo — Switch Status
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_STATUSES.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`text-xs font-semibold py-2 px-2 rounded-lg border-2 transition-all ${
                  token.status === status
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
