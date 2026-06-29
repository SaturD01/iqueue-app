'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import api from '@/lib/api';

const COUNTERS = [
  { id: 1, name: 'Counter 1', label: 'Cash', services: ['Cash Deposit'] },
  { id: 2, name: 'Counter 2', label: 'Account & Inquiry', services: ['Account Opening', 'General Inquiry', 'Document Submission'] },
  { id: 3, name: 'Counter 3', label: 'Loans & Cards', services: ['Loan Inquiry', 'Card Services'] },
];

function getCounterForService(serviceName) {
  return COUNTERS.find(c => c.services.includes(serviceName)) || COUNTERS[0];
}

export default function TVDisplayPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch') || 'aaaaaa000000000000000001';

  const [time, setTime] = useState('');
  const [nowServing, setNowServing] = useState(null);
  const [counterQueues, setCounterQueues] = useState({ 1: [], 2: [], 3: [] });
  const [connected, setConnected] = useState(false);

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const processQueue = (tokens) => {
    const called = tokens.find(t => t.status === 'CALLED');
    const callable = tokens.filter(t => ['CALLABLE', 'PRIORITY'].includes(t.status));
    setNowServing(called || null);

    const grouped = { 1: [], 2: [], 3: [] };
    callable.forEach(token => {
      const counter = getCounterForService(token.serviceName);
      if (grouped[counter.id]) {
        grouped[counter.id].push(token);
      }
    });
    setCounterQueues(grouped);
  };

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    try {
      const response = await api.get(`/api/tokens/queue?branchId=${branchId}`);
      processQueue(response.data.tokens || []);
    } catch (err) {
      console.error('TV fetch error:', err.message);
    }
  }, [branchId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Socket.io
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join:branch', branchId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('queue:updated', ({ queue }) => {
      processQueue(queue || []);
    });

    socket.on('token:called', ({ token }) => {
      setNowServing(token);
    });

    socket.on('token:booked', () => fetchQueue());
    socket.on('token:served', () => fetchQueue());

    return () => socket.disconnect();
  }, [branchId, fetchQueue]);

  const nowServingCounter = nowServing
    ? getCounterForService(nowServing.serviceName)
    : null;

  return (
    <div className='min-h-screen bg-blue-900 flex flex-col overflow-hidden'>

      {/* Top bar */}
      <div className='flex items-center justify-between px-8 py-4 border-b border-blue-800'>
        <div className='flex items-center gap-3'>
          <span className='text-white font-bold text-2xl'>iQueue</span>
          <span className='text-blue-400 text-sm'>Smart Bank Queue Management</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
          <span className='text-blue-300 text-sm font-mono'>{time}</span>
        </div>
      </div>

      {/* NOW SERVING */}
      <div className='flex-1 flex flex-col items-center justify-center px-8'>
        <p className='text-blue-400 text-lg uppercase tracking-widest mb-4'>Now Serving</p>
        {nowServing ? (
          <>
            <p className='font-black text-white leading-none mb-4'
               style={{ fontSize: 'clamp(80px, 18vw, 160px)' }}>
              {nowServing.tokenNumber}
            </p>
            <div className='bg-blue-800 px-8 py-3 rounded-2xl mb-3'>
              <p className='text-blue-200 text-xl font-medium'>Please proceed to the counter</p>
            </div>
            {nowServingCounter && (
              <div className='bg-blue-700 px-6 py-2 rounded-xl'>
                <p className='text-white text-lg font-bold'>
                  {nowServingCounter.name} — {nowServingCounter.label}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <p className='font-black text-blue-700 leading-none mb-4'
               style={{ fontSize: 'clamp(40px, 10vw, 80px)' }}>
              ---
            </p>
            <div className='bg-blue-800 px-8 py-3 rounded-2xl'>
              <p className='text-blue-400 text-xl font-medium'>Waiting for next customer</p>
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className='border-t border-blue-800 mx-8'></div>

      {/* UP NEXT — 3 counter columns */}
      <div className='px-8 py-6'>
        <p className='text-blue-400 text-sm uppercase tracking-widest mb-4 text-center'>Up Next</p>
        <div className='grid grid-cols-3 gap-6'>
          {COUNTERS.map(counter => (
            <div key={counter.id} className='bg-blue-800 rounded-2xl p-4'>
              <div className='text-center mb-3 pb-3 border-b border-blue-700'>
                <p className='text-white font-bold text-sm'>{counter.name}</p>
                <p className='text-blue-400 text-xs'>{counter.label}</p>
              </div>
              {counterQueues[counter.id].length === 0 ? (
                <p className='text-blue-600 text-center text-sm py-4'>— Clear —</p>
              ) : (
                <div className='space-y-2'>
                  {counterQueues[counter.id].slice(0, 3).map((token, index) => (
                    <div key={token._id}
                      className={`rounded-xl p-3 text-center ${index === 0 ? 'bg-blue-600 border border-blue-400' : 'bg-blue-700'}`}>
                      <p className={`font-bold text-white ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
                        {token.tokenNumber}
                      </p>
                      {token.status === 'PRIORITY' && (
                        <p className='text-purple-300 text-xs mt-1'>★ Priority</p>
                      )}
                    </div>
                  ))}
                  {counterQueues[counter.id].length > 3 && (
                    <p className='text-blue-500 text-xs text-center mt-1'>
                      +{counterQueues[counter.id].length - 3} more waiting
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className='px-8 py-3 text-center border-t border-blue-800'>
        <p className='text-blue-500 text-xs'>
          Please proceed to the correct counter when your token is called — iQueue Smart Bank Queue Management
        </p>
      </div>
    </div>
  );
}