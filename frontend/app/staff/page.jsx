'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const STATUS_BADGE = {
  CALLABLE: 'bg-green-100 text-green-800',
  HELD: 'bg-yellow-100 text-yellow-800',
  PRIORITY: 'bg-purple-100 text-purple-800',
  CALLED: 'bg-blue-100 text-blue-800 animate-pulse',
  SERVED: 'bg-gray-100 text-gray-600',
  NO_SHOW: 'bg-red-100 text-red-800',
};

export default function StaffPanelPage() {
  const router = useRouter();
  const [queue, setQueue] = useState([]);
  const [calledToken, setCalledToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [branchId, setBranchId] = useState('');

  // Auth guard — staff only
  useEffect(() => {
    const token = localStorage.getItem('iqueue_token');
    if (!token) { router.push('/login'); return; }
    const user = JSON.parse(localStorage.getItem('iqueue_user') || '{}');
    if (user.role !== 'staff') { router.push('/login'); return; }
    if (user.branchId) setBranchId(user.branchId);
  }, []);

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    if (!branchId) return;
    try {
      setFetchError('');
      const response = await api.get(`/api/tokens/queue?branchId=${branchId}`);
      setQueue(response.data.tokens || []);
    } catch (err) {
      setFetchError('Could not load queue. Please refresh.');
    }
  }, [branchId]);

  useEffect(() => {
    if (!branchId) return;
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue, branchId]);

  const handleCallNext = async () => {
    setLoading(true);
    setActionError('');
    try {
      const response = await api.post('/api/tokens/call-next', { branchId });
      setCalledToken(response.data.token);
      await fetchQueue();
    } catch (err) {
      setActionError(err.response?.data?.message || 'No tokens to call.');
    } finally {
      setLoading(false);
    }
  };

  const handleServed = async (tokenId) => {
    setLoading(true);
    setActionError('');
    try {
      await api.patch(`/api/tokens/${tokenId}/served`);
      setCalledToken(null);
      await fetchQueue();
    } catch (err) {
      setActionError('Could not mark as served. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNoShow = async (tokenId) => {
    setLoading(true);
    setActionError('');
    try {
      await api.patch(`/api/tokens/${tokenId}/no-show`);
      setCalledToken(null);
      await fetchQueue();
    } catch (err) {
      setActionError('Could not mark as no-show. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeTokens = queue.filter(t =>
    !['SERVED', 'NO_SHOW'].includes(t.status)
  );

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Header */}
      <div className='bg-blue-900 text-white px-6 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>iQueue</h1>
          <p className='text-blue-300 text-sm'>Staff Queue Panel</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 text-sm text-blue-200'>
            <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></span>
            <span>Live</span>
          </div>
          <button
            onClick={handleCallNext}
            disabled={loading}
            className='bg-white text-blue-900 px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition disabled:opacity-60'
          >
            {loading ? 'Loading...' : 'Call Next'}
          </button>
        </div>
      </div>

      {/* Called notification */}
      {calledToken && (
        <div className='bg-green-500 text-white text-center py-3 font-semibold'>
          Now calling: {calledToken.tokenNumber} — {calledToken.serviceName}
          <div className='flex justify-center gap-3 mt-2'>
            <button
              onClick={() => handleServed(calledToken._id)}
              disabled={loading}
              className='bg-white text-green-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-50 transition disabled:opacity-60'
            >
              Served
            </button>
            <button
              onClick={() => handleNoShow(calledToken._id)}
              disabled={loading}
              className='bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60'
            >
              No Show
            </button>
          </div>
        </div>
      )}

      {/* Errors */}
      {fetchError && (
        <div className='bg-red-50 border-b border-red-200 text-red-600 text-sm px-6 py-3'>
          {fetchError}
        </div>
      )}
      {actionError && (
        <div className='bg-orange-50 border-b border-orange-200 text-orange-600 text-sm px-6 py-3'>
          {actionError}
        </div>
      )}

      <div className='p-6'>

        {/* Stats bar */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
            <p className='text-2xl font-bold text-blue-900'>{activeTokens.length}</p>
            <p className='text-xs text-gray-400 mt-1'>In Queue</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
            <p className='text-2xl font-bold text-green-700'>
              {queue.filter(t => t.status === 'CALLABLE').length}
            </p>
            <p className='text-xs text-gray-400 mt-1'>Callable</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
            <p className='text-2xl font-bold text-purple-700'>
              {queue.filter(t => t.status === 'PRIORITY').length}
            </p>
            <p className='text-xs text-gray-400 mt-1'>Priority</p>
          </div>
        </div>

        {/* Token table */}
        {activeTokens.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <p className='text-gray-400 text-lg'>No tokens in queue</p>
            <p className='text-gray-300 text-sm mt-1'>All customers have been served</p>
          </div>
        ) : (
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Token</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Service</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Status</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {activeTokens.map(token => (
                  <tr key={token._id} className='hover:bg-gray-50 transition'>
                    <td className='px-4 py-4'>
                      <span className='font-bold text-blue-900'>{token.tokenNumber}</span>
                      {token.isWalkIn && (
                        <span className='ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full'>
                          Walk-in
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-4'>
                      <span className='text-sm text-gray-500'>{token.serviceName}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[token.status] || ''}`}>
                        {token.status}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleServed(token._id)}
                          disabled={loading}
                          className='bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-60'
                        >
                          Served
                        </button>
                        <button
                          onClick={() => handleNoShow(token._id)}
                          disabled={loading}
                          className='bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition disabled:opacity-60'
                        >
                          No-Show
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}