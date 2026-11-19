import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Send, 
  MessageSquare, 
  User, 
  Phone, 
  Clock, 
  Sparkles,
  CheckCheck
} from 'lucide-react';

export const ChatModal = ({ booking, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const quickCannedReplies = [
    "I'm on my way, ETA 10 mins.",
    "Please share building / flat gate code.",
    "Where is the main shutoff valve / MCB?",
    "Work completed! Please inspect and share OTP."
  ];

  useEffect(() => {
    if (!isOpen || !booking) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Poll for new messages every 4s
    return () => clearInterval(interval);
  }, [isOpen, booking]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.messages.getForBooking(booking.id);
      if (res && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (textToSend = inputText) => {
    if (!textToSend || !textToSend.trim() || sending) return;

    try {
      setSending(true);
      const res = await api.messages.send(booking.id, textToSend.trim());
      setInputText('');
      if (res && res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !booking) return null;

  const isCustomer = user?.id === booking.customerId;
  const otherPartyName = isCustomer ? booking.workerName : booking.customerName;
  const otherPartyRole = isCustomer ? `${booking.categoryName || 'Worker'} Specialist` : 'Customer';
  const otherPartyPhone = isCustomer ? booking.workerPhone : booking.contactPhone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">{otherPartyName}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-300">
                {otherPartyRole} • <span className="font-mono text-brand-300">#{booking.bookingNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {otherPartyPhone && (
              <a
                href={`tel:${otherPartyPhone}`}
                className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 transition"
                title={`Call ${otherPartyPhone}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Booking Context Banner */}
        <div className="px-4 py-2 bg-brand-50 border-b border-brand-100 text-[11px] text-brand-900 flex items-center justify-between">
          <span className="truncate font-semibold">{booking.serviceTitle}</span>
          <span className="shrink-0 text-[10px] bg-white px-2 py-0.5 rounded-full font-mono font-bold text-slate-700 border border-brand-200">
            {booking.scheduledTimeSlot}
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              Connecting secure chat thread...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No messages yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Coordinate directions, parking, or job specifics directly with {otherPartyName}.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[80%]">
                    {!isMe && (
                      <img
                        src={msg.senderAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                        alt={msg.senderName}
                        className="w-6 h-6 rounded-full object-cover mb-1"
                      />
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Canned Chips */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickCannedReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 whitespace-nowrap transition border border-slate-200/60"
            >
              + {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Type a message to ${otherPartyName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-md shadow-brand-500/20 disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

