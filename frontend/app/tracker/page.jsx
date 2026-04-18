/**
 * @file tracker/page.jsx
 * @description Live Queue Tracker page with status demo buttons
 *              and 5-minute countdown timer for CALLED status.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 * @updated 2026-04-18
 */

'use client';

import { useEffect, useState } from 'react';

const DUMMY_TOKEN = {
  tokenNumber: 'CF-007',
  status: 'CALLABLE',
  position: 3,
  estimatedWaitMinutes: 12,
  nowServing: 'CF-004',
  branchName: 'Colombo Fort Branch',
  serviceName: 'Cash Deposit',
};

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
    sub: 'Please visit the branch to book a new token.',
  },
  PRIORITY: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    badge: 'bg-purple-100 text-purple-800',
    pulse: true,
    message: 'You have been issued a priority token.',
    sub: 'Please proceed to the counter immediately.',
  },
};

const DEMO_STATUSES = ['HELD', 'CALLABLE', 'CALLED', 'SERVED', 'NO_SHOW', 'PRIORITY'];

const COUNTDOWN_SECONDS = 5 * 60; // 5 minutes

export default function TrackerPage() {
  const [token, setToken] = useState(DUMMY_TOKEN);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  const config = STATUS_CONFIG[token.status] || STATUS_CONFIG.CALLABLE;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for CALLED status
  useEffect(() => {
    if (token.status !== 'CALLED') {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [token.status, countdown]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleStatusChange = (status) => {
    setToken(prev => ({ ...prev, status }));
    setCountdown(COUNTDOWN_SECONDS);
    setRated(false);
    setRating(0);
  };

  const handleRating = (score) => {
    setRating(score);
    setRated(true);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">iQueue</h1>
          <p className="text-gray-400 text-sm mt-1">Live Queue Tracker</p>
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
        {!['SERVED', 'NO_SHOW'].includes(token.status) && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-900">#{token.position}</p>
              <p className="text-xs text-gray-400 mt-1">Position</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-900">{token.estimatedWaitMinutes}</p>
              <p className="text-xs text-gray-400 mt-1">Est. mins</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-lg font-bold text-blue-900">{token.nowServing}</p>
              <p className="text-xs text-gray-400 mt-1">Now serving</p>
            </div>
          </div>
        )}

        {/* Branch and service info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Branch</span>
            <span className="text-sm font-medium text-gray-800">{token.branchName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Service</span>
            <span className="text-sm font-medium text-gray-800">{token.serviceName}</span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>Live updates active</span>
        </div>

        {/* Star rating — shown after SERVED */}
        {token.status === 'SERVED' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center mb-4">
            <p className="font-semibold text-gray-800 mb-1">How was your experience?</p>
            <p className="text-xs text-gray-400 mb-4">Tap a star to rate your visit</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
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

        {/* Demo status buttons — for viva demonstration */}
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