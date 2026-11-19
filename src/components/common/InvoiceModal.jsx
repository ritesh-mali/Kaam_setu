import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Printer, CheckCircle2, ShieldCheck, Wrench, QrCode, Smartphone, Check } from 'lucide-react';

export const InvoiceModal = ({ booking, isOpen, onClose, onPaymentUpdated }) => {
  if (!isOpen || !booking) return null;

  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus || 'PENDING');
  const [paying, setPaying] = useState(false);
  const [txnId, setTxnId] = useState(`UPI-${Date.now().toString().slice(-8)}`);

  const handlePrint = () => {
    window.print();
  };

  const visitingFee = booking.visitingFee || 199;
  const hourlyRate = booking.hourlyRate || 249;
  const hours = booking.estimatedHours || 1;
  const laborTotal = hourlyRate * hours;
  const partsCost = booking.partsCost || 0;
  const grandTotal = booking.totalAmount || (visitingFee + laborTotal + partsCost);

  const workerUpi = `${booking.workerName?.toLowerCase().replace(/\s+/g, '')}@okaxis`;

  const handleSimulateUpiPay = async () => {
    try {
      setPaying(true);
      await api.bookings.updateStatus(booking.id, {
        paymentStatus: 'PAID_ONLINE',
      });
      setPaymentStatus('PAID_ONLINE');
      setPaying(false);
      if (onPaymentUpdated) onPaymentUpdated();
    } catch (err) {
      alert(err.message || 'Payment simulation failed');
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Digital Service Record & Tax Invoice
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800" id="invoice-sheet">
          {/* Brand & Invoice Title */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Kaam<span className="text-brand-600">Setu</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Local Worker Network & Service Guarantee</p>
              <p className="text-xs text-slate-400">GSTIN: 07AAAFK8920K1ZX • Delhi NCR</p>
            </div>

            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
                paymentStatus.includes('PAID') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {paymentStatus.includes('PAID') ? 'PAID & VERIFIED' : 'PAYMENT DUE'}
              </span>
              <p className="font-mono text-sm font-bold text-slate-900">{booking.bookingNumber}</p>
              <p className="text-xs text-slate-500">Date: {booking.scheduledDate || 'Today'}</p>
            </div>
          </div>

          {/* Customer and Worker columns */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer Details</p>
              <p className="font-bold text-slate-800 text-sm">{booking.customerName || 'Valued Customer'}</p>
              <p className="text-slate-600 mt-0.5">{booking.address}</p>
              <p className="text-slate-600">{booking.city}</p>
              <p className="text-slate-500 mt-1 font-mono">Ph: {booking.contactPhone}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Service Provider</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <span>{booking.workerName}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-brand-700 font-medium">{booking.categoryName || 'Technician'}</p>
              <p className="text-slate-600 mt-0.5">Rating: ★ {booking.workerRating || 4.9} / 5.0</p>
              <p className="text-slate-500 mt-1 font-mono">UPI: {workerUpi}</p>
            </div>
          </div>

          {/* Job summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Service Rendered</h4>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 text-sm">{booking.serviceTitle}</p>
              <p className="text-xs text-slate-600">{booking.problemDescription}</p>
              {booking.workerNotes && (
                <div className="pt-2 mt-2 border-t border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Work Done / Tech Remarks: </span>
                  {booking.workerNotes}
                </div>
              )}
            </div>
          </div>

          {/* Transparent Itemized Billing Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Transparent Itemized Charges</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2 font-semibold">Description</th>
                  <th className="py-2 text-center font-semibold">Qty / Hours</th>
                  <th className="py-2 text-right font-semibold">Rate</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">
                    Visiting & Diagnosis Fee
                    <span className="block text-[10px] text-slate-400">Fixed travel and doorstep inspection</span>
                  </td>
                  <td className="py-2.5 text-center text-slate-600">1 Visit</td>
                  <td className="py-2.5 text-right text-slate-600">₹{visitingFee}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-800">₹{visitingFee}</td>
                </tr>

                <tr>
                  <td className="py-2.5 font-medium text-slate-800">
                    Labor Work Charges
                    <span className="block text-[10px] text-slate-400">Skilled hands-on repair service</span>
                  </td>
                  <td className="py-2.5 text-center text-slate-600">{hours} hr(s)</td>
                  <td className="py-2.5 text-right text-slate-600">₹{hourlyRate}/hr</td>
                  <td className="py-2.5 text-right font-semibold text-slate-800">₹{laborTotal}</td>
                </tr>

                {partsCost > 0 && (
                  <tr>
                    <td className="py-2.5 font-medium text-slate-800">
                      Replacement Materials & Spare Parts
                      <span className="block text-[10px] text-slate-400">Original hardware replacement</span>
                    </td>
                    <td className="py-2.5 text-center text-slate-600">Actuals</td>
                    <td className="py-2.5 text-right text-slate-600">-</td>
                    <td className="py-2.5 text-right font-semibold text-slate-800">₹{partsCost}</td>
                  </tr>
                )}

                <tr>
                  <td className="py-2 font-medium text-slate-500">
                    Platform Surcharge Fee
                  </td>
                  <td className="py-2 text-center text-slate-400">-</td>
                  <td className="py-2 text-right text-emerald-600 font-bold">FREE</td>
                  <td className="py-2 text-right font-semibold text-emerald-600">₹0.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-800 text-sm font-bold text-slate-900">
                  <td colSpan="3" className="pt-3 text-right">Grand Total:</td>
                  <td className="pt-3 text-right text-brand-600 text-base">₹{grandTotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Dynamic UPI Payment Simulator Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Simulated QR Code */}
                <div className="w-20 h-20 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                  <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-[9px] text-center p-1 leading-tight">
                    [ UPI QR ]
                    <br />
                    ₹{grandTotal}
                  </div>
                </div>

                <div className="text-xs">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-brand-600" />
                    Instant UPI Payment
                  </p>
                  <p className="text-slate-500 font-mono mt-0.5">{workerUpi}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-bold">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">Google Pay</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-purple-700">PhonePe</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-sky-700">Paytm</span>
                  </div>
                </div>
              </div>

              {/* Payment Action or Paid Stamp */}
              <div>
                {paymentStatus.includes('PAID') ? (
                  <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Paid Successfully</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulateUpiPay}
                    disabled={paying}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {paying ? 'Processing...' : `Pay ₹${grandTotal} via UPI`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Payment Status & OTP Stamp */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-900">
                  Payment Status: {paymentStatus === 'PAID_ONLINE' ? 'Paid via UPI / Online' : 'Cash on Doorstep'}
                </p>
                <p className="text-emerald-700 text-[11px]">Txn ID: {txnId} • OTP Verified Completion</p>
              </div>
            </div>
            <div className="text-right text-[10px] text-emerald-800 font-mono">
              <p>SECURE JOB OTP: <strong>VERIFIED</strong></p>
              <p>{booking.completedAt ? new Date(booking.completedAt).toLocaleString() : 'Completed'}</p>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Thank you for supporting local independent workers with KaamSetu. For queries, call 1800-KAAM-SETU.
          </p>
        </div>
      </div>
    </div>
  );
};
