import { CheckCircle, MessageCircle, Package, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { businessConfig } from '../../config/business';
import type { OrderDetails } from '../../types';
import { formatPrice } from '../../utils';

export default function OrderConfirmation() {
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('ayesha_last_order');
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  const buildWhatsAppMessage = (o: OrderDetails) => {
    const itemLines = o.items
      .map((i) => `• ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''} × ${i.quantity} = ${formatPrice(i.price * i.quantity)}`)
      .join('\n');

    const paymentNote =
      o.paymentMethod === 'gpay'
        ? `💳 Google Pay to ${businessConfig.googlePayNumber} — ₹${o.total}\n(Please send payment screenshot)`
        : '💵 Cash on Delivery';

    return `🌿 *New Order — Ayesha Herbal Powder* 🌿

📦 *Order ID:* ${o.id}

🛒 *Items Ordered:*
${itemLines}

💰 *Subtotal:* ${formatPrice(o.subtotal)}
🚚 *Shipping:* ${o.shipping === 0 ? 'FREE' : formatPrice(o.shipping)}
✅ *Total:* ${formatPrice(o.total)}

💳 *Payment:* ${paymentNote}

📍 *Delivery Address:*
${o.customer.fullName}
${o.customer.address}
${o.customer.city}, ${o.customer.state} — ${o.customer.pinCode}
📱 ${o.customer.mobileNumber}

Please confirm my order. Thank you! 🙏`;
  };

  const whatsappUrl = `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(
    order ? buildWhatsAppMessage(order) : businessConfig.whatsappDefaultMessage
  )}`;

  return (
    <div className="min-h-screen bg-[#F8F4E8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] overflow-hidden">
          {/* Top Banner */}
          <div className="bg-[#2F4A24] text-white py-8 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading mb-1">
              Order Placed Successfully!
            </h1>
            <p className="text-[#c8d9b4]">
              Thank you for choosing Ayesha Herbal Powder.
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {order ? (
              <>
                {/* Order ID */}
                <div className="flex items-center justify-between bg-[#F8F4E8] rounded-xl px-5 py-4 mb-6">
                  <span className="text-sm text-[#6B4A2D] font-medium">Order Number</span>
                  <span className="font-bold text-[#2F4A24] text-lg">{order.id}</span>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-bold text-[#253022] mb-3 flex items-center gap-2">
                    <Package size={16} className="text-[#2F4A24]" />
                    Your Items
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={`${item.productId}_${item.variantId ?? ''}`}
                        className="flex items-center gap-4 p-3 bg-[#F8F4E8] rounded-xl"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23EFE7D5" width="48" height="48"/%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#253022]">{item.name}</p>
                          {item.variantLabel && (
                            <p className="text-xs text-[#5B7138]">{item.variantLabel}</p>
                          )}
                          <p className="text-xs text-[#6B4A2D]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-[#2F4A24] text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="border border-[#EFE7D5] rounded-xl p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[#6B4A2D]">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#6B4A2D]">
                      <span>Shipping</span>
                      <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#253022] text-base border-t border-[#EFE7D5] pt-2 mt-2">
                      <span>Total Paid</span>
                      <span className="text-[#2F4A24]">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-[#F8F4E8] rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-[#253022] mb-2">Delivery Address</p>
                  <p className="text-sm text-[#6B4A2D] leading-relaxed">
                    {order.customer.fullName}
                    <br />
                    {order.customer.address}
                    <br />
                    {order.customer.city}, {order.customer.state} — {order.customer.pinCode}
                    <br />
                    {order.customer.mobileNumber}
                  </p>
                </div>

                {/* Payment */}
                {order.paymentMethod === 'gpay' ? (
                  <div className="bg-[#e8f5e9] border border-[#4caf50]/30 rounded-xl p-4 mb-6">
                    <p className="font-bold text-[#2F4A24] text-sm mb-2">⚠️ Complete Your Payment</p>
                    <p className="text-sm text-[#2F4A24] mb-2">
                      Send <strong>{formatPrice(order.total)}</strong> via Google Pay to:
                    </p>
                    <p className="text-2xl font-bold text-[#2F4A24] text-center tracking-widest mb-1">
                      {businessConfig.googlePayNumber}
                    </p>
                    <p className="text-xs text-[#6B4A2D] text-center">{businessConfig.googlePayName}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[#6B4A2D] mb-6">
                    <span className="font-semibold text-[#253022]">Payment: </span>Cash on Delivery
                  </p>
                )}
              </>
            ) : (
              <p className="text-[#6B4A2D] text-center py-6">
                Your order has been placed successfully. Check your WhatsApp or email for confirmation.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/shop"
                className="flex-1 text-center bg-[#2F4A24] hover:bg-[#253022] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Continue Shopping
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-[#25D366] hover:bg-[#20BD5C] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                {order?.paymentMethod === 'gpay' ? 'Confirm Order on WhatsApp' : 'Contact Us'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
