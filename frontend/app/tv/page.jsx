'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import api from '@/lib/api';

const COUNTERS = [
  { id: 1, name: 'Counter 1', label: 'Cash', color: 'blue', services: ['Cash Deposit'] },
  { id: 2, name: 'Counter 2', label: 'Account & Inquiry', color: 'teal', services: ['Account Opening', 'General Inquiry', 'Document Submission'] },
  { id: 3, name: 'Counter 3', label: 'Loans & Cards', color: 'indigo', services: ['Loan Inquiry', 'Card Services'] },
];

const COUNTER_COLORS = {
  blue:   { bg: 'bg-brand-navy-light',   border: 'border-blue-500',   header: 'bg-brand-navy-light',   text: 'text-blue-300' },
  teal:   { bg: 'bg-teal-800',   border: 'border-teal-500',   header: 'bg-teal-700',   text: 'text-teal-300' },
  indigo: { bg: 'bg-indigo-800', border: 'border-indigo-500', header: 'bg-indigo-700', text: 'text-indigo-300' },
};

function getCounterForService(serviceName) {
  return COUNTERS.find(c => c.services.includes(serviceName)) || COUNTERS[0];
}

export default function TVDisplayPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch') || 'aaaaaa000000000000000001';

  const [time, setTime] = useState('');
  const [counterData, setCounterData] = useState({
    1: { nowServing: null, upNext: [] },
    2: { nowServing: null, upNext: [] },
    3: { nowServing: null, upNext: [] },
  });
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
    const data = {
      1: { nowServing: null, upNext: [] },
      2: { nowServing: null, upNext: [] },
      3: { nowServing: null, upNext: [] },
    };

    tokens.forEach(token => {
      const counter = getCounterForService(token.serviceName);
      if (token.status === 'CALLED') {
        data[counter.id].nowServing = token;
      } else if (['CALLABLE', 'PRIORITY'].includes(token.status)) {
        data[counter.id].upNext.push(token);
      }
    });

    setCounterData(data);
  };

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

    socket.on('queue:updated', ({ queue }) => processQueue(queue || []));
    socket.on('token:called', () => fetchQueue());
    socket.on('token:booked', () => fetchQueue());
    socket.on('token:served', () => fetchQueue());

    return () => socket.disconnect();
  }, [branchId, fetchQueue]);

  return (
    <div className='min-h-screen bg-brand-navy flex flex-col overflow-hidden'>

      {/* Top bar */}
      <div className='flex items-center justify-between px-8 py-4 border-b border-brand-navy-light'>
        <div className='flex items-center gap-3'>
          <span className='text-white font-bold text-2xl'>iQueue</span>
          <span className='text-blue-400 text-sm'>Smart Bank Queue Management</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
          <span className='text-blue-300 text-sm font-mono'>{time}</span>
        </div>
      </div>

      {/* 3 Counter Columns */}
      <div className='flex-1 grid grid-cols-3 gap-0 divide-x divide-brand-navy-light'>
        {COUNTERS.map(counter => {
          const colors = COUNTER_COLORS[counter.color];
          const { nowServing, upNext } = counterData[counter.id];
          return (
            <div key={counter.id} className='flex flex-col'>

              {/* Counter Header */}
              <div className={`${colors.header} px-6 py-4 text-center border-b border-brand-navy-light`}>
                <p className='text-white font-bold text-lg'>{counter.name}</p>
                <p className={`${colors.text} text-sm`}>{counter.label}</p>
              </div>

              {/* NOW SERVING */}
              <div className='flex-1 flex flex-col items-center justify-center px-6 py-8'>
                <p className={`${colors.text} text-xs uppercase tracking-widest mb-3`}>Now Serving</p>
                {nowServing ? (
                  <>
                    <p className='font-black text-white leading-none mb-3'
                       style={{ fontSize: 'clamp(60px, 10vw, 120px)' }}>
                      {nowServing.tokenNumber}
                    </p>
                    <div className={`${colors.bg} border ${colors.border} px-6 py-2 rounded-2xl`}>
                      <p className='text-white text-sm font-medium text-center'>
                        Please proceed to {counter.name}
                      </p>
                    </div>
                    {nowServing.status === 'PRIORITY' && (
                      <p className='text-purple-300 text-xs mt-2 font-semibold'>★ Priority</p>
                    )}
                  </>
                ) : (
                  <p className='font-black text-brand-navy-light leading-none'
                     style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}>
                    ---
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className='border-t border-brand-navy-light mx-6'></div>

              {/* UP NEXT */}
              <div className='px-6 py-4'>
                <p className={`${colors.text} text-xs uppercase tracking-widest mb-3 text-center`}>Up Next</p>
                {upNext.length === 0 ? (
                  <p className='text-brand-navy-light text-center text-sm py-2'>No tokens waiting</p>
                ) : (
                  <div className='space-y-2'>
                    {upNext.slice(0, 3).map((token, index) => (
                      <div key={token._id}
                        className={`rounded-xl p-3 text-center ${index === 0 ? `${colors.bg} border ${colors.border}` : 'bg-brand-navy-light'}`}>
                        <p className={`font-bold text-white ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
                          {token.tokenNumber}
                        </p>
                        {token.status === 'PRIORITY' && (
                          <p className='text-purple-300 text-xs mt-1'>★ Priority</p>
                        )}
                      </div>
                    ))}
                    {upNext.length > 3 && (
                      <p className='text-blue-500 text-xs text-center mt-1'>
                        +{upNext.length - 3} more waiting
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className='px-8 py-3 text-center border-t border-brand-navy-light'>
        <p className='text-blue-500 text-xs'>
          Please proceed to your assigned counter when your token is called — iQueue Smart Bank Queue Management
        </p>
      </div>
    </div>
  );
}
