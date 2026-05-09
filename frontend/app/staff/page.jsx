'use client';

import { useState } from 'react';

const DUMMY_TOKENS = [
  { id: 1, tokenNumber: 'CA-001', name: 'Nimali Fernando',     service: 'Cash Deposit',        status: 'CALLABLE', noShowRisk: 'NONE',   counter: 1 },
  { id: 2, tokenNumber: 'CA-002', name: 'Kamal Dissanayake',   service: 'Document Submission',  status: 'HELD',     noShowRisk: 'LOW',    counter: 1 },
  { id: 3, tokenNumber: 'CA-003', name: 'Priya Wijesinghe',    service: 'Cash Deposit',         status: 'CALLABLE', noShowRisk: 'NONE',   counter: 1 },
  { id: 4, tokenNumber: 'AC-001', name: 'Roshan Perera',       service: 'Account Opening',      status: 'CALLABLE', noShowRisk: 'NONE',   counter: 2 },
  { id: 5, tokenNumber: 'AC-002', name: 'Ashan Silva',         service: 'Card Services',        status: 'PRIORITY', noShowRisk: 'NONE',   counter: 2 },
  { id: 6, tokenNumber: 'AC-003', name: 'Dilshan Jayawardena', service: 'Account Opening',      status: 'CALLABLE', noShowRisk: 'MEDIUM', counter: 2 },
  { id: 7, tokenNumber: 'LI-001', name: 'Sanduni Rathnayake',  service: 'Loan Inquiry',         status: 'CALLED',   noShowRisk: 'HIGH',   counter: 3 },
  { id: 8, tokenNumber: 'LI-002', name: 'Chamara Fernando',    service: 'General Inquiry',      status: 'CALLABLE', noShowRisk: 'NONE',   counter: 3 },
  { id: 9, tokenNumber: 'LI-003', name: 'Malini Perera',       service: 'Loan Inquiry',         status: 'HELD',     noShowRisk: 'MEDIUM', counter: 3 },
];

const COUNTERS = [
  { id: 1, label: 'Counter 1', sublabel: 'Cash Services',        services: ['Cash Deposit', 'Document Submission'],  prefix: 'CA', color: 'blue'   },
  { id: 2, label: 'Counter 2', sublabel: 'Account Services',     services: ['Account Opening', 'Card Services'],     prefix: 'AC', color: 'teal'   },
  { id: 3, label: 'Counter 3', sublabel: 'Loans and Inquiry',    services: ['Loan Inquiry', 'General Inquiry'],       prefix: 'LI', color: 'indigo' },
];

const COUNTER_STYLE = {
  1: { tab: 'bg-blue-900 text-white',   badge: 'bg-blue-100 text-blue-800',   header: 'bg-blue-900' },
  2: { tab: 'bg-teal-700 text-white',   badge: 'bg-teal-100 text-teal-800',   header: 'bg-teal-700' },
  3: { tab: 'bg-indigo-700 text-white', badge: 'bg-indigo-100 text-indigo-800', header: 'bg-indigo-700' },
};

const COUNTER_INACTIVE = 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300';

const STATUS_BADGE = {
  CALLABLE: 'bg-green-100 text-green-800',
  HELD:     'bg-yellow-100 text-yellow-800',
  PRIORITY: 'bg-purple-100 text-purple-800',
  CALLED:   'bg-blue-100 text-blue-800 animate-pulse',
  SERVED:   'bg-gray-100 text-gray-600',
  NO_SHOW:  'bg-red-100 text-red-800',
};

const RISK_BADGE = {
  HIGH:   'bg-red-100 text-red-700 border border-red-300',
  MEDIUM: 'bg-orange-100 text-orange-700 border border-orange-300',
  LOW:    'bg-yellow-50 text-yellow-600 border border-yellow-200',
  NONE:   '',
};

export default function StaffPanelPage() {
  const [tokens, setTokens] = useState(DUMMY_TOKENS);
  const [activeCounter, setActiveCounter] = useState(1);
  const [calledToken, setCalledToken] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const getCounterTokens = (counterId) =>
    tokens.filter(t =>
      t.counter === counterId &&
      !['SERVED', 'NO_SHOW'].includes(t.status)
    );

  const handleCallNext = () => {
    const pool = getCounterTokens(activeCounter);
    const next =
      pool.find(t => t.status === 'PRIORITY') ||
      pool.find(t => t.status === 'CALLABLE');
    if (!next) {
      alert(`No callable tokens at Counter ${activeCounter}`);
      return;
    }
    setTokens(prev => prev.map(t =>
      t.id === next.id ? { ...t, status: 'CALLED' } : t
    ));
    setCalledToken(next.tokenNumber);
    setTimeout(() => setCalledToken(null), 3000);
  };

  const handleServed = (id) =>
    setTokens(prev => prev.map(t => t.id === id ? { ...t, status: 'SERVED' } : t));

  const handleNoShow = (id) =>
    setTokens(prev => prev.map(t => t.id === id ? { ...t, status: 'NO_SHOW' } : t));

  const handlePriority = (id) =>
    setTokens(prev => prev.map(t => t.id === id ? { ...t, status: 'PRIORITY' } : t));

  const activeStyle = COUNTER_STYLE[activeCounter];
  const currentCounter = COUNTERS.find(c => c.id === activeCounter);
  const counterTokens = getCounterTokens(activeCounter);
  const allActive = tokens.filter(t => !['SERVED', 'NO_SHOW'].includes(t.status));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className={`${activeStyle.header} text-white px-6 py-4 flex items-center justify-between transition-colors duration-300`}>
        <div>
          <h1 className="text-xl font-bold">iQueue</h1>
          <p className="text-white/70 text-sm">
            Staff Queue Panel — {currentCounter.label}: {currentCounter.sublabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Live</span>
          </div>
          <button
            onClick={handleCallNext}
            className="bg-white text-gray-800 px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
          >
            Call Next
          </button>
        </div>
      </div>

      {/* Called notification */}
      {calledToken && (
        <div className="bg-green-500 text-white text-center py-3 font-semibold text-lg">
          🔔 Now calling: {calledToken}
        </div>
      )}

      <div className="p-6">

        {/* Instructions */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-900 hover:bg-blue-100 transition"
          >
            <span>📋 How to use the Staff Panel — tap to {showInstructions ? 'hide' : 'view'}</span>
            <span>{showInstructions ? '▲' : '▼'}</span>
          </button>
          {showInstructions && (
            <div className="border border-blue-100 border-t-0 rounded-b-xl bg-blue-50 px-4 pb-4 pt-3 space-y-2">
              {[
                'Select your counter tab below — each counter has its own independent queue.',
                'Counter 1 handles Cash Deposit and Document Submission.',
                'Counter 2 handles Account Opening and Card Services.',
                'Counter 3 handles Loan Inquiry and General Inquiry.',
                'Click Call Next to call the next token in YOUR counter queue only.',
                'PRIORITY tokens are always called before CALLABLE tokens.',
                'Click Priority on any row to move that customer to the front of the queue.',
                'Click Served when the customer completes their service.',
                'Click No-Show if the customer does not appear within 5 minutes.',
                'The system automatically marks overdue CALLED tokens as NO-SHOW every 60 seconds.',
                'Risk badges show customers with a history of no-shows — HIGH means frequent no-show.',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-blue-800 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-xl font-bold text-blue-900">{allActive.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Queue</p>
          </div>
          {COUNTERS.map(c => {
            const count = getCounterTokens(c.id).length;
            return (
              <div key={c.id} className={`rounded-xl border p-3 text-center cursor-pointer transition ${activeCounter === c.id ? `${COUNTER_STYLE[c.id].badge} border-current` : 'bg-white border-gray-200 hover:border-gray-300'}`}
                onClick={() => setActiveCounter(c.id)}>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs mt-0.5">{c.label}</p>
              </div>
            );
          })}
        </div>

        {/* Counter tabs */}
        <div className="flex gap-2 mb-5">
          {COUNTERS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCounter(c.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition ${activeCounter === c.id ? COUNTER_STYLE[c.id].tab : COUNTER_INACTIVE}`}
            >
              <div>{c.label}</div>
              <div className="font-normal opacity-80">{c.sublabel}</div>
            </button>
          ))}
        </div>

        {/* Services handled badge */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-400">Handles:</span>
          {currentCounter.services.map(s => (
            <span key={s} className={`px-2 py-0.5 rounded-full text-xs font-medium ${activeStyle.badge}`}>
              {s}
            </span>
          ))}
        </div>

        {/* Token table */}
        {counterTokens.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-lg">No tokens in queue</p>
            <p className="text-gray-300 text-sm mt-1">
              {currentCounter.label} queue is empty
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Token</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Risk</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {counterTokens.map(token => (
                  <tr key={token.id} className={`hover:bg-gray-50 transition ${token.status === 'PRIORITY' ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-4">
                      <span className="font-bold text-blue-900">{token.tokenNumber}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{token.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">{token.service}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[token.status] || ''}`}>
                        {token.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {token.noShowRisk !== 'NONE' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[token.noShowRisk]}`}>
                          {token.noShowRisk}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {!['CALLED', 'PRIORITY'].includes(token.status) && (
                          <button
                            onClick={() => handlePriority(token.id)}
                            className="bg-purple-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                          >
                            Priority
                          </button>
                        )}
                        <button
                          onClick={() => handleServed(token.id)}
                          className="bg-green-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                        >
                          Served
                        </button>
                        <button
                          onClick={() => handleNoShow(token.id)}
                          className="bg-red-500 text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition"
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