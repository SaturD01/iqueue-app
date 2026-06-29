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

const PRIORITY_REASONS = ['Elderly', 'Disability', 'VIP', 'Pregnant', 'Other'];

const SERVICES = [
  'Cash Deposit', 'Account Opening', 'Card Services',
  'Loan Inquiry', 'Document Submission', 'General Inquiry',
];

export default function StaffPanelPage() {
  const router = useRouter();
  const [queue, setQueue] = useState([]);
  const [calledToken, setCalledToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branchName, setBranchName] = useState('');

  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    walkInName: '', serviceName: '', walkInEmail: '',
    isPriority: false, priorityReason: '',
  });
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  const [printSlip, setPrintSlip] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('iqueue_token');
    if (!token) { router.push('/login'); return; }
    const user = JSON.parse(localStorage.getItem('iqueue_user') || '{}');
    if (user.role !== 'staff') { router.push('/login'); return; }
    if (user.branchId) {
      setBranchId(user.branchId);
      setBranchName(user.branchName || 'Colombo Fort Branch');
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!branchId) return;
    try {
      setFetchError('');
      const response = await api.get(`/api/tokens/queue?branchId=${branchId}`);
      const tokens = response.data.tokens || [];
      setQueue(tokens);
      setCalledToken(prev => {
        if (!prev) return null;
        const stillActive = tokens.find(t => t._id === prev._id && t.status === 'CALLED');
        return stillActive || null;
      });
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
    setLoading(true); setActionError('');
    try {
      const response = await api.post('/api/tokens/call-next', { branchId });
      setCalledToken(response.data.token);
      await fetchQueue();
    } catch (err) {
      setActionError(err.response?.data?.message || 'No tokens to call.');
    } finally { setLoading(false); }
  };

  const handleServed = async (tokenId) => {
    setLoading(true); setActionError('');
    try {
      await api.patch(`/api/tokens/${tokenId}/served`);
      setCalledToken(null);
      await fetchQueue();
    } catch (err) {
      setActionError('Could not mark as served.');
    } finally { setLoading(false); }
  };

  const handleNoShow = async (tokenId) => {
    setLoading(true); setActionError('');
    try {
      await api.patch(`/api/tokens/${tokenId}/no-show`);
      setCalledToken(null);
      await fetchQueue();
    } catch (err) {
      setActionError('Could not mark as no-show.');
    } finally { setLoading(false); }
  };

  const handleWalkInSubmit = async () => {
    if (!walkInForm.walkInName || !walkInForm.serviceName) {
      setWalkInError('Customer name and service are required.');
      return;
    }
    setWalkInLoading(true); setWalkInError('');
    try {
      const body = {
        branchId,
        walkInName: walkInForm.walkInName,
        serviceName: walkInForm.serviceName,
        isPriority: walkInForm.isPriority,
        priorityReason: walkInForm.isPriority ? walkInForm.priorityReason : undefined,
      };
      if (walkInForm.walkInEmail) body.walkInEmail = walkInForm.walkInEmail;
      const response = await api.post('/api/tokens/walkin', body);
      setPrintSlip(response.data.token);
      setShowWalkIn(false);
      setWalkInForm({ walkInName: '', serviceName: '', walkInEmail: '', isPriority: false, priorityReason: '' });
      await fetchQueue();
    } catch (err) {
      setWalkInError(err.response?.data?.message || 'Walk-in booking failed.');
    } finally { setWalkInLoading(false); }
  };

  const handlePrint = () => window.print();

  const activeTokens = queue.filter(t => !['SERVED', 'NO_SHOW'].includes(t.status));

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Print CSS — hides everything except slip on print */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-slip, #print-slip * { visibility: visible !important; }
          #print-slip {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 40px !important;
          }
        }
      `}</style>

      {/* Print slip — hidden on screen, shown on print */}
      {printSlip && (
        <div id='print-slip' style={{ display: 'none' }}>
          <div style={{
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            padding: '40px 32px',
            border: '3px solid #1e3a5f',
            borderRadius: '16px',
            maxWidth: '340px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            {/* Logo */}
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#1e3a5f', letterSpacing: '-1px' }}>iQueue</span>
            </div>
            <p style={{ color: '#888', fontSize: '11px', margin: '0 0 6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Smart Bank Queue Management
            </p>
            <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 24px' }}>
              {branchName}
            </p>

            {/* Divider */}
            <div style={{ borderTop: '1px dashed #ddd', margin: '0 0 24px' }}></div>

            {/* Token number */}
            <p style={{ color: '#555', fontSize: '12px', margin: '0 0 4px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Your Token Number
            </p>
            <p style={{ color: '#1e3a5f', fontSize: '88px', fontWeight: '900', margin: '0 0 4px', fontFamily: 'monospace', lineHeight: 1 }}>
              {printSlip.tokenNumber}
            </p>

            {/* Priority badge */}
            {printSlip.priorityReason && (
              <div style={{
                display: 'inline-block',
                background: '#f3e8ff',
                color: '#6b21a8',
                fontSize: '12px',
                fontWeight: '700',
                padding: '4px 14px',
                borderRadius: '99px',
                margin: '8px 0 0',
                letterSpacing: '0.5px',
              }}>
                ★ PRIORITY — {printSlip.priorityReason.toUpperCase()}
              </div>
            )}

            {/* Service */}
            <p style={{ color: '#444', fontSize: '14px', margin: '16px 0 0', fontWeight: '600' }}>
              {printSlip.serviceName}
            </p>

            {/* Customer name */}
            {printSlip.walkInName && (
              <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0' }}>
                {printSlip.walkInName}
              </p>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px dashed #ddd', margin: '20px 0' }}></div>

            {/* Instructions */}
            <p style={{ color: '#333', fontSize: '12px', margin: '0 0 6px', lineHeight: '1.6' }}>
              Please watch the display screen.<br />
              Proceed to the counter when your number is called.
            </p>
            <p style={{ color: '#e74c3c', fontSize: '12px', fontWeight: '600', margin: '0 0 16px' }}>
              You have 5 minutes to reach the counter when called.
            </p>

            {/* Date/time */}
            <p style={{ color: '#bbb', fontSize: '10px', margin: '0', letterSpacing: '0.5px' }}>
              {new Date().toLocaleString('en-LK', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='bg-blue-900 text-white px-6 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>iQueue</h1>
          <p className='text-blue-300 text-sm'>Staff Queue Panel</p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => { setShowWalkIn(true); setPrintSlip(null); }}
            className='bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition'
          >
            + Walk-in
          </button>
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
            <button onClick={() => handleServed(calledToken._id)} disabled={loading}
              className='bg-white text-green-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-50 transition disabled:opacity-60'>
              Served
            </button>
            <button onClick={() => handleNoShow(calledToken._id)} disabled={loading}
              className='bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60'>
              No Show
            </button>
          </div>
        </div>
      )}

      {/* Print slip success banner */}
      {printSlip && (
        <div className='bg-orange-50 border-b border-orange-200 px-6 py-3 flex items-center justify-between'>
          <div>
            <p className='text-orange-800 font-semibold text-sm'>Walk-in token booked: {printSlip.tokenNumber}</p>
            <p className='text-orange-600 text-xs'>
              {printSlip.walkInEmail ? 'Confirmation email sent to customer.' : 'Print the slip and hand it to the customer.'}
            </p>
          </div>
          <div className='flex gap-2'>
            <button onClick={handlePrint}
              className='bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition'>
              Print Slip
            </button>
            <button onClick={() => setPrintSlip(null)}
              className='bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition'>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {fetchError && <div className='bg-red-50 border-b border-red-200 text-red-600 text-sm px-6 py-3'>{fetchError}</div>}
      {actionError && <div className='bg-orange-50 border-b border-orange-200 text-orange-600 text-sm px-6 py-3'>{actionError}</div>}

      <div className='p-6'>
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
            <p className='text-2xl font-bold text-blue-900'>{activeTokens.length}</p>
            <p className='text-xs text-gray-400 mt-1'>In Queue</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
            <p className='text-2xl font-bold text-green-700'>{queue.filter(t => t.status === 'CALLABLE').length}</p>
            <p className='text-xs text-gray-400 mt-1'>Callable</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
            <p className='text-2xl font-bold text-purple-700'>{queue.filter(t => t.status === 'PRIORITY').length}</p>
            <p className='text-xs text-gray-400 mt-1'>Priority</p>
          </div>
        </div>

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
                      {token.isWalkIn && <span className='ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full'>Walk-in</span>}
                    </td>
                    <td className='px-4 py-4'><span className='text-sm text-gray-500'>{token.serviceName}</span></td>
                    <td className='px-4 py-4'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[token.status] || ''}`}>{token.status}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex gap-2'>
                        <button onClick={() => handleServed(token._id)} disabled={loading}
                          className='bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-60'>
                          Served
                        </button>
                        <button onClick={() => handleNoShow(token._id)} disabled={loading}
                          className='bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition disabled:opacity-60'>
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

      {/* Walk-in Modal */}
      {showWalkIn && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center px-4 z-50'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-1'>Walk-in Customer</h2>
            <p className='text-sm text-gray-400 mb-6'>Book a token for a customer who walked in</p>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Customer Name *</label>
                <input type='text' value={walkInForm.walkInName}
                  onChange={e => setWalkInForm({...walkInForm, walkInName: e.target.value})}
                  placeholder='e.g. Somawathie Perera'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Service Type *</label>
                <select value={walkInForm.serviceName}
                  onChange={e => setWalkInForm({...walkInForm, serviceName: e.target.value})}
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'
                >
                  <option value=''>Choose a service...</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Customer Email <span className='text-gray-400 font-normal'>(optional — for confirmation email)</span>
                </label>
                <input type='email' value={walkInForm.walkInEmail}
                  onChange={e => setWalkInForm({...walkInForm, walkInEmail: e.target.value})}
                  placeholder='customer@gmail.com'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Priority Token</label>
                <div className='flex gap-2 mb-3'>
                  <button type='button'
                    onClick={() => setWalkInForm({...walkInForm, isPriority: false, priorityReason: ''})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${!walkInForm.isPriority ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200'}`}>
                    Normal
                  </button>
                  <button type='button'
                    onClick={() => setWalkInForm({...walkInForm, isPriority: true})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${walkInForm.isPriority ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-600 border-gray-200'}`}>
                    Priority
                  </button>
                </div>
                {walkInForm.isPriority && (
                  <select value={walkInForm.priorityReason}
                    onChange={e => setWalkInForm({...walkInForm, priorityReason: e.target.value})}
                    className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 transition'
                  >
                    <option value=''>Select reason...</option>
                    {PRIORITY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </div>
            </div>

            {walkInError && <p className='text-red-500 text-sm mt-4'>{walkInError}</p>}

            <div className='flex gap-3 mt-6'>
              <button onClick={() => { setShowWalkIn(false); setWalkInError(''); }}
                className='flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition'>
                Cancel
              </button>
              <button onClick={handleWalkInSubmit} disabled={walkInLoading}
                className='flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2'>
                {walkInLoading && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
                {walkInLoading ? 'Booking...' : 'Book Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}