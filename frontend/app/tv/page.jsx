'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import api from '@/lib/api';

const COUNTERS = [
  { id: 1, name: 'COUNTER 1', label: 'Cash', color: 'blue', services: ['Cash Deposit'] },
  { id: 2, name: 'COUNTER 2', label: 'Account & Inquiry', color: 'teal', services: ['Account Opening', 'General Inquiry', 'Document Submission'] },
  { id: 3, name: 'COUNTER 3', label: 'Loans & Cards', color: 'indigo', services: ['Loan Inquiry', 'Card Services'] },
];

const COUNTER_COLORS = {
  blue:   { bg: 'bg-brand-navy-light', border: 'border-blue-500', header: 'bg-brand-navy-light', text: 'text-blue-300' },
  teal:   { bg: 'bg-teal-800', border: 'border-teal-500', header: 'bg-teal-700', text: 'text-teal-300' },
  indigo: { bg: 'bg-indigo-800', border: 'border-indigo-500', header: 'bg-indigo-700', text: 'text-indigo-300' },
};

function getCounterForService(serviceName) {
  return COUNTERS.find(c => c.services.includes(serviceName)) || COUNTERS[0];
}

export default function TVDisplayPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch') || 'aaaaaa000000000000000001';

  const [counterData, setCounterData] = useState({
    1: { nowServing: null, upNext: [] },
    2: { nowServing: null, upNext: [] },
    3: { nowServing: null, upNext: [] },
  });

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

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    socket.on('connect', () => { socket.emit('join:branch', branchId); });
    socket.on('queue:updated', ({ queue }) => processQueue(queue || []));
    socket.on('token:called', () => fetchQueue());
    socket.on('token:booked', () => fetchQueue());
    socket.on('token:served', () => fetchQueue());
    return () => socket.disconnect();
  }, [branchId, fetchQueue]);

  return (
    <div className='min-h-screen bg-brand-navy flex flex-col overflow-hidden p-4 gap-4'>

      {/* 3 Counter Columns */}
      <div className='flex-1 grid grid-cols-3 gap-4'>
        {COUNTERS.map(counter => {
          const colors = COUNTER_COLORS[counter.color];
          const { nowServing, upNext } = counterData[counter.id];
          return (
            <div key={counter.id} className='flex flex-col rounded-2xl overflow-hidden border border-brand-navy-light'>

              {/* Counter Header */}
              <div className={`${colors.header} px-6 py-5 text-center`}>
                <p className='text-white font-black tracking-widest' style={{ fontSize: 'clamp(22px, 2.5vw, 36px)' }}>{counter.name}</p>
                <p className={`${colors.text} font-semibold mt-1`} style={{ fontSize: 'clamp(14px, 1.4vw, 20px)' }}>{counter.label}</p>
              </div>

              {/* NOW SERVING */}
              <div className='flex-1 flex flex-col items-center justify-center px-4 py-8 bg-brand-navy'>
                <p className={`${colors.text} uppercase tracking-widest mb-4 font-bold`} style={{ fontSize: 'clamp(14px, 1.3vw, 20px)' }}>Now Serving</p>
                {nowServing ? (
                  <>
                    <p className='font-black text-white leading-none mb-4 whitespace-nowrap' style={{ fontSize: 'clamp(60px, 8vw, 120px)' }}>
                      {nowServing.tokenNumber}
                    </p>
                    <div className={`${colors.bg} border-2 ${colors.border} px-6 py-2 rounded-xl`}>
                      <p className='text-white font-semibold text-center' style={{ fontSize: 'clamp(14px, 1.3vw, 20px)' }}>
                        Please proceed
                      </p>
                    </div>
                    {nowServing.status === 'PRIORITY' && (
                      <p className='text-purple-300 font-bold mt-3' style={{ fontSize: 'clamp(14px, 1.3vw, 18px)' }}>★ Priority</p>
                    )}
                  </>
                ) : (
                  <p className='font-black text-brand-navy-light leading-none' style={{ fontSize: 'clamp(50px, 7vw, 100px)' }}>
                    ---
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className='border-t border-brand-navy-light mx-4'></div>

              {/* UP NEXT */}
              <div className='px-4 py-5 bg-brand-navy'>
                <p className={`${colors.text} uppercase tracking-widest mb-3 text-center font-bold`} style={{ fontSize: 'clamp(12px, 1.1vw, 16px)' }}>Up Next</p>
                {upNext.length === 0 ? (
                  <p className='text-brand-navy-light text-center py-3' style={{ fontSize: 'clamp(14px, 1.2vw, 18px)' }}>No tokens waiting</p>
                ) : (
                  <div className='space-y-2'>
                    {upNext.slice(0, 3).map((token, index) => (
                      <div key={token._id}
                        className={`rounded-xl py-3 px-4 text-center ${index === 0 ? `${colors.bg} border-2 ${colors.border}` : 'bg-brand-navy-light'}`}>
                        <p className='font-black text-white whitespace-nowrap' style={{ fontSize: index === 0 ? 'clamp(28px, 3.5vw, 48px)' : 'clamp(22px, 2.8vw, 38px)' }}>
                          {token.tokenNumber}
                        </p>
                        {token.status === 'PRIORITY' && (
                          <p className='text-purple-300 font-semibold mt-1' style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>★ Priority</p>
                        )}
                      </div>
                    ))}
                    {upNext.length > 3 && (
                      <p className='text-blue-400 text-center mt-1 font-medium' style={{ fontSize: 'clamp(12px, 1vw, 16px)' }}>
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

    </div>
  );
}