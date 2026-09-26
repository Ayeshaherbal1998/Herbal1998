import { AlertCircle, CheckCircle, Clock, Loader2, Package, Search, Truck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { trackOrderById } from '../../services/orderService';
import { isBackendEnabled } from '../../config/api';

interface TrackedOrder {
  orderId: string;
  orderDate: string;
  customerName: string;
  productNames: string;
  quantities: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  lastUpdated: string;
}

const ORDER_STEPS = ['New', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const stepIcons: Record<string, React.ReactNode> = {
  New: <Clock size={18} />,
  Confirmed: <CheckCircle size={18} />,
  Processing: <Package size={18} />,
  Shipped: <Truck size={18} />,
  Delivered: <CheckCircle size={18} />,
};

const paymentLabels: Record<string, string> = {
  cod: 'Cash on Delivery',
  gpay: 'Google Pay / UPI',
};

const paymentStatusColors: Record<string, string> = {
  Unpaid: 'text-amber-600',
  Paid: 'text-green-600',
  Refunded: 'text-gray-500',
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError('Please enter both Order ID and mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const result = await trackOrderById(orderId.trim(), phone.trim());
      if (result.success && result.order) {
        setOrder(result.order as TrackedOrder);
      } else {
        setError(result.error || 'Order not found. Please check your Order ID and mobile number.');
      }
    } catch {
      setError('Could not connect to backend. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.orderStatus === 'Cancelled';
  const currentStepIdx = isCancelled ? -1 : ORDER_STEPS.indexOf(order?.orderStatus || '');

  return (
    <div className="min-h-screen bg-[#F8F4E8]">
      <div className="bg-[#2F4A24] text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading mb-1">Track Your Order</h1>
          <p className="text-[#c8d9b4] text-sm">Enter your Order ID and mobile number to see the latest status</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] p-6">
          {!isBackendEnabled() ? (
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#253022] text-sm">Order tracking not available yet</p>
                <p className="text-[#6B4A2D] text-xs mt-1">
                  The Google Sheets backend has not been configured. Contact us on WhatsApp with your Order ID to get a status update.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#253022] mb-1.5">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => { setOrderId(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="e.g. AH-20241225-1234"
                  className="w-full border border-[#5B7138]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4A24] uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#253022] mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="Mobile number used when ordering"
                  maxLength={10}
                  className="w-full border border-[#5B7138]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4A24]"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2F4A24] hover:bg-[#253022] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Tracking...</> : <><Search size={18} /> Track Order</>}
              </button>
            </form>
          )}
        </div>

        {/* Order Result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] overflow-hidden">
            {/* Header */}
            <div className={`py-5 px-6 text-white ${isCancelled ? 'bg-red-600' : 'bg-[#2F4A24]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70 mb-0.5">Order ID</p>
                  <p className="font-bold text-lg">{order.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70 mb-0.5">Ordered on</p>
                  <p className="font-semibold text-sm">{order.orderDate}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Tracker */}
              {isCancelled ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <XCircle size={24} className="text-red-600 shrink-0" />
                  <div>
                    <p className="font-bold text-red-700">Order Cancelled</p>
                    <p className="text-xs text-red-500">This order has been cancelled. Contact us for any queries.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-[#2F4A24] uppercase mb-4">Order Progress</p>
                  <div className="relative">
                    {/* Track line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#EFE7D5]" />
                    <div
                      className="absolute left-4 top-0 w-0.5 bg-[#2F4A24] transition-all"
                      style={{ height: `${((currentStepIdx) / (ORDER_STEPS.length - 1)) * 100}%` }}
                    />
                    <div className="space-y-6">
                      {ORDER_STEPS.map((step, idx) => {
                        const done = idx <= currentStepIdx;
                        const current = idx === currentStepIdx;
                        return (
                          <div key={step} className="flex items-center gap-4 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${done ? 'bg-[#2F4A24] text-white' : 'bg-white border-2 border-[#EFE7D5] text-[#6B4A2D]'} ${current ? 'ring-4 ring-[#2F4A24]/20' : ''}`}>
                              {stepIcons[step]}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${done ? 'text-[#253022]' : 'text-[#6B4A2D]'}`}>{step}</p>
                              {current && <p className="text-xs text-[#5B7138]">Current Status</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Products */}
              <div>
                <p className="text-xs font-bold text-[#2F4A24] uppercase mb-2">Items Ordered</p>
                <div className="bg-[#F8F4E8] rounded-xl p-4">
                  <p className="text-sm text-[#6B4A2D]">{order.productNames}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="border border-[#EFE7D5] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#6B4A2D]"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between text-[#6B4A2D]"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span></div>
                <div className="flex justify-between font-bold text-[#253022] border-t border-[#EFE7D5] pt-2">
                  <span>Total</span><span className="text-[#2F4A24]">₹{order.total}</span>
                </div>
                <div className="flex justify-between text-[#6B4A2D]">
                  <span>Payment</span>
                  <span>{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4A2D]">Payment Status</span>
                  <span className={`font-semibold text-sm ${paymentStatusColors[order.paymentStatus] || ''}`}>{order.paymentStatus}</span>
                </div>
              </div>

              <p className="text-xs text-[#6B4A2D] text-center">Last updated: {order.lastUpdated}</p>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="bg-white rounded-xl border border-[#EFE7D5] p-4">
          <p className="text-xs font-semibold text-[#253022] mb-1">Need help?</p>
          <p className="text-xs text-[#6B4A2D]">
            Your Order ID was shown on the order confirmation page and sent via WhatsApp. If you lost it, contact us on WhatsApp with your name and mobile number.
          </p>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP || '918496093074'}?text=Hi, I need help tracking my order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs font-semibold text-[#2F4A24] hover:underline"
          >
            Message us on WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
}
