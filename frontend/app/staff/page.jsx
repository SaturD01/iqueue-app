'use client';

import { useState } from 'react';

const DUMMY_TOKENS = [
  { id: 1, tokenNumber: 'CF-001', name: 'Nimali Fernando', service: 'Cash Deposit', status: 'CALLABLE', noShowRisk: 'NONE' },
  { id: 2, tokenNumber: 'CF-002', name: 'Roshan Perera', service: 'Loan Inquiry', status: 'HELD', noShowRisk: 'HIGH' },
  { id: 3, tokenNumber: 'CF-003', name: 'Ashan Silva', service: 'Card Services', status: 'CALLABLE', noShowRisk: 'MEDIUM' },
  { id: 4, tokenNumber: 'CF-004', name: 'Dilshan Jayawardena', service: 'Account Opening', status: 'PRIORITY', noShowRisk: 'NONE' },
  { id: 5, tokenNumber: 'CF-005', name: 'Sanduni Rathnayake', service: 'General Inquiry', status: 'CALLED', noShowRisk: 'LOW' },
];

const STATUS_BADGE = {
  CALLABLE: 'bg-green-100 text-green-800',
  HELD: 'bg-yellow-100 text-yellow-800',
  PRIORITY: 'bg-purple-100 text-purple-800',
  CALLED: 'bg-blue-100 text-blue-800 animate-pulse',
  SERVED: 'bg-gray-100 text-gray-600',
  NO_SHOW: 'bg-red-100 text-red-800',
};

const RISK_BADGE = {
  HIGH: 'bg-red-100 text-red-700 border border-red-300',
  MEDIUM: 'bg-orange-100 text-orange-700 border border-orange-300',
  LOW: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  NONE: '',
};

export default function StaffPanelPage() {
  const [tokens, setTokens] = useState(DUMMY_TOKENS);
  const [calledToken, setCalledToken] = useState(null);

  const handleCallNext = () => {
    const next = tokens.find(t => t.status === 'PRIORITY' || t.status === 'CALLABLE');
    if (!next) { alert('No callable tokens in the queue'); return; }
    setTokens(prev => prev.map(t =>
      t.id === next.id ? { ...t, status: 'CALLED' } : t
    ));
    setCalledToken(next.tokenNumber);
    setTimeout(() => setCalledToken(null), 3000);
  };

  const handleServed = (id) => {
    setTokens(prev => prev.filter(t => t.id !== id));
  };

  const handleNoShow = (id) => {
    setTokens(prev => prev.filter(t => t.id !== id));
  };

  const activeTokens = tokens.filter(t => !['SERVED', 'NO_SHOW'].includes(t.status));

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
            className='bg-white text-blue-900 px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition'
          >
            Call Next
          </button>
        </div>
      </div>

      {/* Called notification */}
      {calledToken && (
        <div className='bg-green-500 text-white text-center py-3 font-semibold'>
          Now calling: {calledToken}
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
            <p className='text-2xl font-bold text-green-700'>{tokens.filter(t => t.status === 'CALLABLE').length}</p>
            <p className='text-xs text-gray-400 mt-1'>Callable</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
            <p className='text-2xl font-bold text-purple-700'>{tokens.filter(t => t.status === 'PRIORITY').length}</p>
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
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Customer</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Service</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Status</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Risk</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {activeTokens.map(token => (
                  <tr key={token.id} className='hover:bg-gray-50 transition'>
                    <td className='px-4 py-4'>
                      <span className='font-bold text-blue-900'>{token.tokenNumber}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <span className='text-sm text-gray-700'>{token.name}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <span className='text-sm text-gray-500'>{token.service}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[token.status] || ''}`}>
                        {token.status}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      {token.noShowRisk !== 'NONE' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[token.noShowRisk]}`}>
                          {token.noShowRisk}
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleServed(token.id)}
                          className='bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition'
                        >
                          Served
                        </button>
                        <button
                          onClick={() => handleNoShow(token.id)}
                          className='bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition'
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
