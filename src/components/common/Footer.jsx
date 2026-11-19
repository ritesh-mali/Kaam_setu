import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart, ShieldCheck, CheckCircle2, Phone, MapPin, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-display">
                Kaam<span className="text-brand-500">Setu</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bridging the gap between skilled local workers and households. Transparent pricing, verified credentials, and digital records that empower independent service pros.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Verified Identity & Skills
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Popular Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/workers?category=plumber" className="hover:text-brand-400 transition">
                  Plumbing & Leak Repairs
                </Link>
              </li>
              <li>
                <Link to="/workers?category=electrician" className="hover:text-brand-400 transition">
                  Electrician & MCB Faults
                </Link>
              </li>
              <li>
                <Link to="/workers?category=carpenter" className="hover:text-brand-400 transition">
                  Carpentry & Furniture
                </Link>
              </li>
              <li>
                <Link to="/workers?category=appliance-repair" className="hover:text-brand-400 transition">
                  AC & Appliance Repair
                </Link>
              </li>
              <li>
                <Link to="/workers?category=painter" className="hover:text-brand-400 transition">
                  Painting & Waterproofing
                </Link>
              </li>
            </ul>
          </div>

          {/* For Workers & Customers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/workers" className="hover:text-brand-400 transition">
                  Browse Service Providers
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition">
                  Join as Independent Worker
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="hover:text-brand-400 transition">
                  Track Your Booking Status
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="hover:text-brand-400 transition">
                  Standard Rate Card
                </Link>
              </li>
              <li>
                <span className="text-xs bg-slate-800 text-brand-400 px-2 py-0.5 rounded border border-slate-700">
                  Zero Platform Commission
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Community */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Local Helpline</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>1800-KAAM-SETU (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@kaamsetu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Connecting Local Neighbourhoods Across Delhi NCR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 KaamSetu Technologies. Built with pride for local workers.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made to empower independent technicians</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};

