import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Receipt, 
  Search, 
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';

export const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'bookings', 'users'

  // Booking status filter in admin
  const [bookingFilter, setBookingFilter] = useState('ALL');

  // Selected booking for invoice inspection
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [isAuthenticated, isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, workersRes, bookingsRes, usersRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getWorkers(),
        api.admin.getBookings(),
        api.admin.getUsers(),
      ]);

      if (statsRes && statsRes.data) setStats(statsRes.data);
      if (workersRes && workersRes.data) setWorkers(workersRes.data);
      if (bookingsRes && bookingsRes.data) setBookings(bookingsRes.data);
      if (usersRes && usersRes.data) setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWorker = async (workerId, newStatus) => {
    const notes = prompt(`Enter verification review note for worker status (${newStatus}):`, 
      newStatus === 'VERIFIED' ? 'Aadhaar ID and trade credentials verified by Admin.' : 'Incomplete documentation.');
    if (notes === null) return;

    try {
      await api.admin.verifyWorker(workerId, {
        status: newStatus,
        notes: notes,
      });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update verification status');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    if (!window.confirm('Are you sure you want to change the active status of this user account?')) return;
    try {
      await api.admin.toggleUserStatus(userId);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  const pendingWorkers = workers.filter((w) => w.verificationStatus === 'PENDING');

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'ALL') return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Platform Administration & Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            KaamSetu Central Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor platform metrics, verify worker credentials, and oversee local bookings.
          </p>
        </div>

        {pendingWorkers.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-amber-300 text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>{pendingWorkers.length} Worker Verification(s) Pending Review</span>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Total Platform Users</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</p>
            <p className="text-[10px] text-slate-500 mt-1">{stats.totalCustomers} Customers • {stats.totalWorkers} Workers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Verified Technicians</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.verifiedWorkers}</p>
            <p className="text-[10px] text-amber-600 font-bold mt-1">{stats.pendingWorkers} Pending Verification</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Total Bookings</p>
            <p className="text-2xl font-extrabold text-brand-600 mt-1">{stats.totalBookings}</p>
            <p className="text-[10px] text-slate-500 mt-1">{stats.pendingBookings} Pending • {stats.inProgressBookings} In Progress</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Completed Jobs</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.completedBookings}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">100% OTP Verified</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold text-slate-400">Platform GMV (Volume)</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{stats.totalRevenue}</p>
            <p className="text-[10px] text-brand-600 font-bold mt-1">0% Commission Extracted</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold text-slate-500 gap-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 relative transition flex items-center gap-1.5 ${
            activeTab === 'verifications' ? 'text-indigo-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          <span>Worker Verifications</span>
          {pendingWorkers.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingWorkers.length}
            </span>
          )}
          {activeTab === 'verifications' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 relative transition ${
            activeTab === 'bookings' ? 'text-indigo-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          All Platform Bookings ({bookings.length})
          {activeTab === 'bookings' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 relative transition ${
            activeTab === 'users' ? 'text-indigo-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          User Accounts & Access ({users.length})
          {activeTab === 'users' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>}
        </button>
      </div>

      {/* Tab 1: Worker Verifications */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registered Service Providers & KYC Verification</h3>
              <p className="text-xs text-slate-500">Review submitted identity proofs, experience certificates, and approve official verification badges.</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{workers.length} Workers Total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
                  <th className="py-3 px-5 font-semibold">Technician</th>
                  <th className="py-3 px-3 font-semibold">Category</th>
                  <th className="py-3 px-3 font-semibold">ID Proof Type & No.</th>
                  <th className="py-3 px-3 font-semibold">Experience</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Verification Audit Notes</th>
                  <th className="py-3 px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80'}
                          alt={w.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{w.name}</p>
                          <p className="text-[11px] text-slate-400">{w.email}</p>
                          <p className="text-[11px] text-slate-400">{w.city}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-brand-600">{w.categoryName}</span>
                      <span className="block text-[10px] text-slate-400">₹{w.visitingCharge} visit</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-semibold text-slate-800">{w.idProofType || 'AADHAAR'}</span>
                      <span className="block font-mono text-[10px] text-slate-500">{w.idProofNumber || 'XXXX-XXXX-8921'}</span>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {w.experienceYears} Years
                    </td>

                    <td className="py-3.5 px-3">
                      {w.verified ? (
                        <Badge status="VERIFIED" size="xs" />
                      ) : w.verificationStatus === 'REJECTED' ? (
                        <Badge status="REJECTED" size="xs" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate" title={w.verificationNotes}>
                      {w.verificationNotes || 'Awaiting initial check'}
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                      {!w.verified ? (
                        <button
                          onClick={() => handleVerifyWorker(w.id, 'VERIFIED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                        >
                          ✓ Approve & Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyWorker(w.id, 'REJECTED')}
                          className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg text-xs transition"
                        >
                          Revoke Badge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All Bookings Monitoring */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Live Platform Booking Log</h3>
              <p className="text-xs text-slate-500">Inspect real-time booking lifecycle, OTP verification status, and charges.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    bookingFilter === st ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
                  <th className="py-3 px-5 font-semibold">Booking ID</th>
                  <th className="py-3 px-3 font-semibold">Customer</th>
                  <th className="py-3 px-3 font-semibold">Assigned Worker</th>
                  <th className="py-3 px-3 font-semibold">Service</th>
                  <th className="py-3 px-3 font-semibold">Date & Slot</th>
                  <th className="py-3 px-3 font-semibold">Status & OTP</th>
                  <th className="py-3 px-3 font-semibold">Amount</th>
                  <th className="py-3 px-5 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-700">
                      {b.bookingNumber}
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900">{b.customerName}</p>
                      <p className="text-[10px] text-slate-400">{b.city}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900">{b.workerName}</p>
                      <p className="text-[10px] text-brand-600 font-medium">{b.categoryName}</p>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-800 max-w-xs truncate" title={b.serviceTitle}>
                      {b.serviceTitle}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {b.scheduledDate}
                      <span className="block text-[10px] text-slate-400">{b.scheduledTimeSlot}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <Badge status={b.status} size="xs" />
                      <span className="block font-mono text-[10px] text-slate-400 mt-0.5">OTP: {b.completionOtp}</span>
                    </td>

                    <td className="py-3.5 px-3 font-extrabold text-slate-900">
                      ₹{b.totalAmount}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedInvoice(b)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users Accounts & Access Control */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registered Users & Role-Based Access</h3>
              <p className="text-xs text-slate-500">Manage customer and worker platform access rights and account activation.</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{users.length} Registered Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
                  <th className="py-3 px-5 font-semibold">User Profile</th>
                  <th className="py-3 px-3 font-semibold">Assigned Role</th>
                  <th className="py-3 px-3 font-semibold">Location</th>
                  <th className="py-3 px-3 font-semibold">Phone</th>
                  <th className="py-3 px-3 font-semibold">Account State</th>
                  <th className="py-3 px-5 text-right font-semibold">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        u.role === 'ROLE_ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'ROLE_WORKER'
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {u.city || 'Delhi NCR'}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {u.phone || '-'}
                    </td>

                    <td className="py-3.5 px-3">
                      {u.active ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            u.active
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.active ? 'Suspend Account' : 'Activate Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal for Admin Review */}
      {selectedInvoice && (
        <InvoiceModal
          booking={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

