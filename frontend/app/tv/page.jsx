'use client';

import { useState, useEffect } from 'react';

const NOW_SERVING = { tokenNumber: 'CF-005', service: 'Cash Deposit' };

const UP_NEXT = [
  { tokenNumber: 'CF-006', service: 'Loan Inquiry' },
  { tokenNumber: 'CF-007', service: 'Card Services' },
  { tokenNumber: 'CF-008', service: 'Account Opening' },
  { tokenNumber: 'CF-009', service: 'General Inquiry' },
];

export default function TVDisplayPage() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='min-h-screen bg-blue-900 flex flex-col overflow-hidden'>

      {/* Top bar */}
      <div className='flex items-center justify-between px-8 py-4 border-b border-blue-800'>
        <div className='flex items-center gap-3'>
          <span className='text-white font-bold text-2xl'>iQueue</span>
          <span className='text-blue-400 text-sm'>Smart Bank Queue</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></span>
          <span className='text-blue-300 text-sm font-mono'>{time}</span>
        </div>
      </div>

      {/* NOW SERVING — top 60% */}
      <div className='flex-1 flex flex-col items-center justify-center px-8'>
        <p className='text-blue-400 text-lg uppercase tracking-widest mb-4'>Now Serving</p>
        <p
          className='font-black text-white leading-none mb-4'
          style={{ fontSize: 'clamp(80px, 18vw, 160px)' }}
        >
          {NOW_SERVING.tokenNumber}
        </p>
        <div className='bg-blue-800 px-8 py-3 rounded-2xl'>
          <p className='text-blue-200 text-xl font-medium'>{NOW_SERVING.service}</p>
        </div>
      </div>

      {/* Divider */}
      <div className='border-t border-blue-800 mx-8'></div>

      {/* UP NEXT — bottom 40% */}
      <div className='px-8 py-6'>
        <p className='text-blue-400 text-sm uppercase tracking-widest mb-4 text-center'>Up Next</p>
        <div className='grid grid-cols-4 gap-4'>
          {UP_NEXT.map((token, index) => (
            <div
              key={token.tokenNumber}
              className={`rounded-2xl p-4 text-center ${index === 0 ? 'bg-blue-700 border-2 border-blue-400' : 'bg-blue-800'}`}
            >
              <p className={`font-bold text-white ${index === 0 ? 'text-3xl' : 'text-2xl'}`}>
                {token.tokenNumber}
              </p>
              <p className='text-blue-300 text-xs mt-1'>{token.service}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className='px-8 py-3 text-center border-t border-blue-800'>
        <p className='text-blue-500 text-xs'>
          Please proceed to the counter when your token is called — iQueue Smart Bank Queue Management
        </p>
      </div>

    </div>
  );
}
