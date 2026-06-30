/**
 * @file admin/page.jsx
 * @description Admin Panel — user management with role and branch assignment
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-05-28
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const ROLES = ['customer', 'staff', 'manager', 'admin'];

const ROLE_BADGE = {
  customer:  'bg-blue-100 text-blue-800',
  staff:     'bg-green-100 text-green-800',
  manager:   'bg-purple-100 text-purple-800',
  admin:     'bg-red-100 text-red-800',
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', branchId: '' });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Auth guard — admin only
  useEffect(() => {
    const token = localStorage.getItem('iqueue_token');
    if (!token) { router.push('/login'); return; }
    const user = JSON.parse(localStorage.getItem('iqueue_user') || '{}');
    if (user.role !== 'admin') { router.push('/login'); }
  }, []);

  // Fetch branches for the branch selector
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/api/branches');
        setBranches(res.data.branches || res.data);
      } catch {
        // branches optional — fail silently
      }
    };
    fetchBranches();
  }, []);

  // Fetch users
  const fetchUsers = async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const url = searchTerm
        ? `/api/admin/users?search=${encodeURIComponent(searchTerm)}`
        : '/api/admin/users';
      const res = await api.get(url);
      setUsers(res.data.users);
    } catch (err) {
      setError('Could not load users. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      role: user.role,
      branchId: user.branchId?._id || '',
    });
    setSaveSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess('');
    try {
      const body = { role: editForm.role };
      if (editForm.branchId) body.branchId = editForm.branchId;
      await api.patch(`/api/admin/users/${editingUser._id}`, body);
      setSaveSuccess('User updated successfully.');
      await fetchUsers(search);
      setTimeout(() => {
        setEditingUser(null);
        setSaveSuccess('');
      }, 1200);
    } catch (err) {
      setSaveSuccess('Failed to update. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Header */}
      <div className='bg-brand-navy px-6 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-white'>iQueue Admin Panel</h1>
          <p className='text-blue-300 text-xs mt-0.5'>User Management</p>
        </div>
        <span className='bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
          ADMIN
        </span>
      </div>

      <div className='max-w-5xl mx-auto px-4 py-8'>

        {/* Search bar */}
        <div className='mb-6'>
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search by name or email...'
            className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition bg-white'
          />
        </div>

        {/* Error */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4'>
            {error}
          </div>
        )}

        {/* Stats bar */}
        <div className='grid grid-cols-4 gap-3 mb-6'>
          {ROLES.map(role => (
            <div key={role} className='bg-white rounded-xl border border-gray-200 p-4 text-center'>
              <p className='text-2xl font-bold text-brand-navy'>
                {users.filter(u => u.role === role).length}
              </p>
              <p className='text-xs text-gray-400 mt-1 capitalize'>{role}s</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : (
          <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <p className='font-semibold text-gray-800'>All Users</p>
              <p className='text-sm text-gray-400'>{users.length} total</p>
            </div>

            {users.length === 0 ? (
              <p className='text-center text-gray-400 text-sm py-12'>No users found.</p>
            ) : (
              <div className='divide-y divide-gray-100'>
                {users.map(user => (
                  <div key={user._id} className='px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0'>
                          <span className='text-white text-sm font-bold'>
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className='min-w-0'>
                          <p className='font-medium text-gray-800 truncate'>{user.name}</p>
                          <p className='text-xs text-gray-400 truncate'>{user.email}</p>
                          {user.branchId && (
                            <p className='text-xs text-gray-400'>{user.branchId.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 ml-4'>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ROLE_BADGE[user.role]}`}>
                        {user.role}
                      </span>
                      <button
                        onClick={() => openEdit(user)}
                        className='text-xs font-semibold text-blue-700 hover:text-brand-navy border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition'
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingUser && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center px-4 z-50'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-1'>Edit User</h2>
            <p className='text-sm text-gray-400 mb-6'>{editingUser.name} — {editingUser.email}</p>

            {/* Role selector */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Role</label>
              <select
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Branch selector */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Branch Assignment</label>
              <select
                value={editForm.branchId}
                onChange={e => setEditForm({ ...editForm, branchId: e.target.value })}
                className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'
              >
                <option value=''>No branch assigned</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Save result */}
            {saveSuccess && (
              <p className={`text-sm mb-4 font-medium ${saveSuccess.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                {saveSuccess}
              </p>
            )}

            {/* Buttons */}
            <div className='flex gap-3'>
              <button
                onClick={() => setEditingUser(null)}
                className='flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition'
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className='flex-1 py-3 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-teal transition disabled:opacity-60 flex items-center justify-center gap-2'
              >
                {saving && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


