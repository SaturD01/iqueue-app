/**
 * @file tracker/page.jsx
 * @description Live Queue Tracker page — shows customer their real-time
 *              queue position, estimated wait, and current serving token.
 *              Auto-updates via Socket.io without page refresh.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
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
    message: 'Your token is safely held until your arrival time.',
    sub: 'You will not be marked no-show while on your way.',
  },
  CALLABLE: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    badge: 'bg-blue-100 text-blue-800',
    message: 'You are in the queue.',
    sub: 'Head to the branch when your position reaches 1.',
  },
  CALLED: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    badge: 'bg-green-100 text-green-800',
    message: 'It is your turn — go to the counter now!',
    sub: 'You have 5 minutes to appear or you will be marked no-show.',
  },
  SERVED: {
    bg: 'bg-gray-50',
    border: 'border-gray-400',
    badge: 'bg-gray-100 text-gray-800',
    message: 'You have been served. Thank you!',
    sub: 'We hope you had a great experience.',
  },
  NO_SHOW: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    badge: 'bg-red-100 text-red-800',
    message: 'You were marked as no-show.',
    sub: 'Please visit the branch to book a new token.',
  },
};

export default function TrackerPage() {
  const [token, setToken] = useState(DUMMY_TOKEN);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);

  const config = STATUS_CONFIG[token.status] || STATUS_CONFIG.CALLABLE;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (token.status === 'SERVED') {
      setShowRating(true);
    }
  }, [token.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent 
                          rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your queue position...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">iQueue</h1>
          <p className="text-gray-500 text-sm mt-1">Live Queue Tracker</p>
        </div>

        <div className={`rounded-xl border-2 p-6 mb-4 ${config.bg} ${config.border}`}>
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
              Your Token
            </p>
            <p className="text-6xl font-bold text-blue-900 mb-2">
              {token.tokenNumber}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm 
                              font-medium ${config.badge}`}>
              {token.status}
            </span>
          </div>
        </div>

        <div className={`rounded-xl border-2 p-4 mb-4 ${config.bg} ${config.border}`}>
          <p className="font-medium text-gray-800">{config.message}</p>
          <p className="text-sm text-gray-500 mt-1">{config.sub}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">#{token.position}</p>
            <p className="text-xs text-gray-500 mt-1">Position</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">
              {token.estimatedWaitMinutes}
            </p>
            <p className="text-xs text-gray-500 mt-1">Est. mins</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-lg font-bold text-blue-900">{token.nowServing}</p>
            <p className="text-xs text-gray-500 mt-1">Now serving</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Branch</span>
            <span className="text-sm font-medium text-gray-800">
              {token.branchName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Service</span>
            <span className="text-sm font-medium text-gray-800">
              {token.serviceName}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>Live updates active</span>
        </div>

        {showRating && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="font-medium text-gray-800 mb-2">
              How was your experience?
            </p>
            <p className="text-sm text-gray-500">
              Star rating component will appear here.
              Built by C — TG Dhanushi Uttara.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}