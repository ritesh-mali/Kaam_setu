import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, XCircle, Wrench } from 'lucide-react';

export const Badge = ({ status, size = 'sm' }) => {
  const normalized = status ? status.toUpperCase() : 'PENDING';

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (normalized) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verified Pro
        </span>
      );

    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse-subtle" />
          Pending Request
        </span>
      );

    case 'ACCEPTED':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Accepted / Scheduled
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <Wrench className="w-3.5 h-3.5 text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
          Work In Progress
        </span>
      );

    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );

    case 'REJECTED':
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          {normalized === 'REJECTED' ? 'Rejected' : 'Cancelled'}
        </span>
      );

    case 'ONLINE':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Available Now
        </span>
      );

    case 'OFFLINE':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          Offline
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

