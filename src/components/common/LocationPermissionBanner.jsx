import React from 'react';
import { AlertCircle, X, Navigation, HelpCircle, Lock } from 'lucide-react';

export const LocationPermissionBanner = ({ onRetry, onDismiss, currentSource }) => {
  return (
    <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 shadow-sm animate-in fade-in space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Browser GPS Access Blocked / Denied</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-800 p-0.5 rounded-lg transition"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-amber-800 leading-relaxed">
        {currentSource === 'IP' 
          ? 'Your location was automatically set via Network IP. For exact street-level tracking, you can allow browser GPS permission.'
          : 'Your browser denied location access. We have set a default local hub so you can continue seamlessly without interruption.'}
      </p>

      {/* Step by step browser unblock guide */}
      <div className="bg-white/80 border border-amber-200 rounded-xl p-3 space-y-1.5 text-[11px]">
        <p className="font-bold text-slate-800 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          How to allow GPS in Chrome / Edge / Brave:
        </p>
        <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1">
          <li>Look at the address bar at the top (next to <strong>localhost:5173</strong>).</li>
          <li>Click the <strong>🔒 Padlock</strong> or <strong>🎚️ Site Settings</strong> tune icon.</li>
          <li>Switch <strong>Location</strong> from <em>Block</em> to <strong>Allow</strong>.</li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Retry GPS Detection</span>
          </button>
        )}
        <span className="text-[11px] text-amber-700 font-medium">
          Or pick any city area from the dropdown selector.
        </span>
      </div>
    </div>
  );
};
