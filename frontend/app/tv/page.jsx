'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import api from '@/lib/api';

export default function TVDisplayPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch') || 'aaaaaa000000000000000001';

  const [time, setTime] = useState('');
  const [nowServing, setNowServing] = useState(null);
  const [upNext, setUpNext] = useState([]);
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

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    try {
      const response = await api.get(`/api/tokens/queue?branchId=${branchId}`);
      const tokens = response.data.tokens || [];
      const called = tokens.find(t => t.status === 'CALLED');
      const callable = tokens.filter(t => ['CALLABLE', 'PRIORITY'].includes(t.status));
      setNowServing(called || null);
      setUpNext(callable.slice(0, 4));
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
      const called = queue.find(t => t.status === 'CALLED');
      const callable = queue.filter(t => ['CALLABLE', 'PRIORITY'].includes(t.status));
      setNowServing(called || null);
      setUpNext(callable.slice(0, 4));
    });

    socket.on('token:called', ({ token }) => {
      setNowServing(token);
    });

    socket.on('token:booked', () => {
      fetchQueue();
    });

    socket.on('token:served', () => {
      fetchQueue();
    });

    return () => socket.disconnect();
  }, [branchId, fetchQueue]);

  return (
    <div className='min-h-screen bg-blue-900 flex flex-col overflow-hidden'>

      {/* Top bar */}
      <div className='flex items-center justify-between px-8 py-4 border-b border-blue-800'>
        <div className='flex items-center gap-3'>
          <span className='text-white font-bold text-2xl'>iQueue</span>
          <span className='text-blue-400 text-sm'>Smart Bank Queue</span>
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
            <div className='bg-blue-800 px-8 py-3 rounded-2xl'>
              <p className='text-blue-200 text-xl font-medium'>Please proceed to the counter</p>
            </div>
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

      {/* UP NEXT */}
      <div className='px-8 py-6'>
        <p className='text-blue-400 text-sm uppercase tracking-widest mb-4 text-center'>Up Next</p>
        {upNext.length === 0 ? (
          <p className='text-blue-700 text-center text-sm'>No tokens waiting</p>
        ) : (
          <div className='grid grid-cols-4 gap-4'>
            {upNext.map((token, index) => (
              <div key={token._id}
                className={`rounded-2xl p-4 text-center ${index === 0 ? 'bg-blue-700 border-2 border-blue-400' : 'bg-blue-800'}`}>
                <p className={`font-bold text-white ${index === 0 ? 'text-3xl' : 'text-2xl'}`}>
                  {token.tokenNumber}
                </p>
                {token.status === 'PRIORITY' && (
                  <p className='text-purple-300 text-xs mt-1'>Priority</p>
                )}
              </div>
            ))}
          </div>
        )}
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