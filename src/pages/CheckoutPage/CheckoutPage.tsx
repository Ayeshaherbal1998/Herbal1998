import { IndianRupee, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { businessConfig } from '../../config/business';
import type { CustomerInfo } from '../../types';
import { formatPrice, generateOrderId } from '../../utils';

type PaymentMethod = 'cod' | 'gpay';

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'cod', label: 'Cash on Delivery', icon: <IndianRupee size={18} />, description: 'Pay when your order arrives' },
  { id: 'gpay', label: 'Google Pay / UPI', icon: <Smartphone size={18} />, description: `Pay to ${businessConfig.googlePayNumber} & confirm on WhatsApp` },
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pinRegex = /^\d{6}$/;

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<CustomerInfo>({
    fullName: '', mobileNumber: '', email: '', address: '', city: '', state: '', pinCode: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const validate = (): boolean => {
    const errs: Partial<CustomerInfo> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!phoneRegex.test(form.mobileNumber)) errs.mobileNumber = 'Enter a valid 10-digit mobile number';
    if (form.email && !emailRegex.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!pinRegex.test(form.pinCode)) errs.pinCode = 'Enter a valid 6-digit PIN code';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof CustomerInfo]) {
      setErrors((er) => ({ ...er, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const orderId = generateOrderId();
    const order = { id: orderId, items, customer: form, subtotal, shipping, total, paymentMethod, status: 'placed', createdAt: new Date().toISOString() };
    localStorage.setItem('ayesha_last_order', JSON.stringify(order));

    // Build WhatsApp message with full order details
    const itemLines = items
      .map((item) => `  • ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} × ${item.quantity} = ₹${item.price * item.quantity}`)
      .join('\n');

    const paymentLabel = paymentMethod === 'gpay' ? 'Google Pay / UPI' : 'Cash on Delivery';

    const message = [
      `🌿 *New Order — Ayesha Herbal Powder*`,
      ``,
      `*Order ID:* ${orderId}`,
      `*Name:* ${form.fullName}`,
      `*Mobile:* ${form.mobileNumber}`,
      form.email ? `*Email:* ${form.email}` : null,
      ``,
      `*Items Ordered:*`,
      itemLines,
      ``,
      `*Subtotal:* ₹${subtotal}`,
      `*Shipping:* ${shipping === 0 ? 'FREE' : `₹${shipping}`}`,
      `*Total:* ₹${total}`,
      ``,
      `*Payment Method:* ${paymentLabel}`,
      ``,
      `*Shipping Address:*`,
      `${form.address}`,
      `${form.city}, ${form.state} – ${form.pinCode}`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const whatsappUrl = `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    clearCart();
    setSubmitting(false);
    navigate('/order-confirmation');
  };

  const inputClass = (field: keyof CustomerInfo) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-[#253022] focus:outline-none focus:ring-2 focus:ring-[#2F4A24] ${
      errors[field] ? 'border-red-400' : 'border-[#5B7138]/30'
    }`;

  return (
    <div className="min-h-screen bg-[#F8F4E8]">
      <div className="bg-[#2F4A24] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Customer + Shipping */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] p-6">
                <h2 className="text-lg font-bold text-[#253022] mb-5 font-serif-heading">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[#253022] mb-1.5">Full Name *</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" className={inputClass('fullName')} />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#253022] mb-1.5">Mobile Number *</label>
                    <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} className={inputClass('mobileNumber')} />
                    {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#253022] mb-1.5">Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Optional" className={inputClass('email')} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] p-6">
                <h2 className="text-lg font-bold text-[#253022] mb-5 font-serif-heading">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[#253022] mb-1.5">Street Address *</label>
                    <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House no., street, locality" className={`${inputClass('address')} resize-none`} />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#253022] mb-1.5">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputClass('city')} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#253022] mb-1.5">State *</label>
                    <select name="state" value={form.state} onChange={handleChange} className={inputClass('state')}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#253022] mb-1.5">PIN Code *</label>
                    <input name="pinCode" value={form.pinCode} onChange={handleChange} placeholder="6-digit PIN" maxLength={6} className={inputClass('pinCode')} />
                    {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] p-6">
                <h2 className="text-lg font-bold text-[#253022] mb-5 font-serif-heading">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        paymentMethod === pm.id ? 'border-[#2F4A24] bg-[#F8F4E8]' : 'border-[#EFE7D5] hover:border-[#5B7138]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="accent-[#2F4A24]"
                      />
                      <span className="text-[#2F4A24]">{pm.icon}</span>
                      <div>
                        <p className="font-semibold text-[#253022] text-sm">{pm.label}</p>
                        <p className="text-xs text-[#6B4A2D]">{pm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Google Pay instructions */}
                {paymentMethod === 'gpay' && (
                  <div className="mt-4 bg-[#e8f5e9] border border-[#4caf50]/30 rounded-xl p-4 space-y-2">
                    <p className="font-bold text-[#2F4A24] text-sm flex items-center gap-2">
                      <Smartphone size={16} /> Google Pay / UPI Instructions
                    </p>
                    <ol className="text-xs text-[#2F4A24] space-y-1 list-decimal list-inside">
                      <li>Place your order by clicking <strong>"Place Order"</strong></li>
                      <li>Open Google Pay and pay <strong>{formatPrice(total)}</strong> to:</li>
                    </ol>
                    <div className="bg-white rounded-lg px-4 py-3 text-center border border-[#4caf50]/30">
                      <p className="text-xs text-[#6B4A2D]">Google Pay Number</p>
                      <p className="text-2xl font-bold text-[#2F4A24] tracking-widest">{businessConfig.googlePayNumber}</p>
                      <p className="text-xs text-[#5B7138] font-medium">{businessConfig.googlePayName}</p>
                    </div>
                    <p className="text-xs text-[#6B4A2D]">
                      3. After payment, send your <strong>payment screenshot + Order ID</strong> to our WhatsApp to confirm your order.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] p-6 sticky top-24">
                <h2 className="text-lg font-bold text-[#253022] mb-5 font-serif-heading">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={`${item.productId}_${item.variantId ?? ''}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#F8F4E8] overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect fill="%23EFE7D5" width="48" height="48"/%3E%3C/svg%3E'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#253022] truncate">{item.name}</p>
                        {item.variantLabel && <p className="text-xs text-[#5B7138]">{item.variantLabel}</p>}
                        <p className="text-xs text-[#6B4A2D]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-[#253022]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#EFE7D5] pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#6B4A2D]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-[#6B4A2D]"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                  <div className="flex justify-between font-bold text-[#253022] text-base pt-2 border-t border-[#EFE7D5]">
                    <span>Total</span><span className="text-[#2F4A24]">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-5 bg-[#2F4A24] hover:bg-[#253022] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-base"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
                <p className="text-xs text-[#6B4A2D] text-center mt-3">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
