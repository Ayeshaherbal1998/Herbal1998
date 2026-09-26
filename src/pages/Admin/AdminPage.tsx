import {
  AlertCircle, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight,
  Download, Eye, Loader2, Lock, LogOut, RefreshCw, Search, X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  adminAddNote, adminExportCSV, adminGetOrder, adminGetOrders, adminGetStats,
  adminLogin, adminUpdateOrderStatus, adminUpdatePaymentStatus,
  type AdminOrder, type AdminOrderDetail, type AdminStats,
} from '../../services/orderService';
import { isBackendEnabled } from '../../config/api';

const ORDER_STATUSES = ['New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Refunded'];

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-purple-100 text-purple-800',
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-orange-100 text-orange-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};
const paymentColors: Record<string, string> = {
  Unpaid: 'bg-red-100 text-red-700',
  Paid: 'bg-green-100 text-green-700',
  Refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ah_admin_token') || '');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [password, setPassword] = useState('');

  const [view, setView] = useState<'dashboard' | 'orders' | 'orderDetail'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [noteText, setNoteText] = useState('');

  const [exporting, setExporting] = useState(false);

  // ── Login ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const result = await adminLogin(password);
      if (result.success) {
        sessionStorage.setItem('ah_admin_token', password);
        setToken(password);
        setLoggedIn(true);
        loadDashboard(password);
      } else {
        setLoginError(result.error || 'Invalid password');
      }
    } catch {
      setLoginError('Could not connect to backend. Check your Apps Script URL in src/config/api.ts');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ah_admin_token');
    setToken('');
    setLoggedIn(false);
    setPassword('');
    setView('dashboard');
  };

  // Auto-login if session token exists
  useEffect(() => {
    if (token) {
      adminLogin(token).then((r) => {
        if (r.success) { setLoggedIn(true); loadDashboard(token); }
        else { sessionStorage.removeItem('ah_admin_token'); setToken(''); }
      }).catch(() => { setLoggedIn(false); });
    }
  }, []);

  // ── Dashboard Stats ────────────────────────────────────────
  const loadDashboard = async (t: string) => {
    setStatsLoading(true);
    try {
      const r = await adminGetStats(t);
      if (r.success && r.stats) setStats(r.stats);
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  };

  // ── Orders List ───────────────────────────────────────────
  const loadOrders = async (page = 1) => {
    setOrdersLoading(true);
    try {
      const r = await adminGetOrders(token, {
        status: filterStatus, paymentStatus: filterPayment,
        search, dateFrom, dateTo, page, pageSize: 15,
      });
      if (r.success) {
        setOrders(r.orders || []);
        setOrdersTotal(r.total || 0);
        setOrdersPage(page);
      }
    } catch { /* ignore */ }
    finally { setOrdersLoading(false); }
  };

  const goToOrders = () => { setView('orders'); loadOrders(1); };

  // ── Order Detail ──────────────────────────────────────────
  const openOrder = async (orderId: string) => {
    setOrderLoading(true);
    setView('orderDetail');
    setUpdateMsg('');
    try {
      const r = await adminGetOrder(token, orderId);
      if (r.success && r.order) setSelectedOrder(r.order);
    } catch { /* ignore */ }
    finally { setOrderLoading(false); }
  };

  const updateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    if (newStatus === 'Cancelled' && !confirm('Cancel this order? This cannot be undone.')) return;
    setUpdating(true);
    try {
      const r = await adminUpdateOrderStatus(token, selectedOrder.orderId, newStatus);
      if (r.success) { setUpdateMsg('Status updated!'); openOrder(selectedOrder.orderId); }
      else setUpdateMsg(r.error || 'Update failed');
    } catch { setUpdateMsg('Network error'); }
    finally { setUpdating(false); }
  };

  const updatePayment = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const r = await adminUpdatePaymentStatus(token, selectedOrder.orderId, newStatus);
      if (r.success) { setUpdateMsg('Payment status updated!'); openOrder(selectedOrder.orderId); }
      else setUpdateMsg(r.error || 'Update failed');
    } catch { setUpdateMsg('Network error'); }
    finally { setUpdating(false); }
  };

  const addNote = async () => {
    if (!selectedOrder || !noteText.trim()) return;
    setUpdating(true);
    try {
      const r = await adminAddNote(token, selectedOrder.orderId, noteText);
      if (r.success) { setNoteText(''); setUpdateMsg('Note added!'); openOrder(selectedOrder.orderId); }
      else setUpdateMsg(r.error || 'Failed to add note');
    } catch { setUpdateMsg('Network error'); }
    finally { setUpdating(false); }
  };

  // ── Export CSV ────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await adminExportCSV(token, filterStatus, filterPayment);
      if (r.success && r.csv) {
        const blob = new Blob([r.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ayesha-orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
    finally { setExporting(false); }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };

  const formatRupee = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;

  // ── NOT CONFIGURED ────────────────────────────────────────
  if (!isBackendEnabled()) {
    return (
      <div className="min-h-screen bg-[#F8F4E8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFE7D5] p-8 max-w-lg w-full text-center">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#253022] mb-2">Backend Not Configured</h2>
          <p className="text-[#6B4A2D] text-sm mb-4">
            The admin dashboard requires the Google Apps Script backend to be set up.
          </p>
          <div className="bg-[#F8F4E8] rounded-xl p-4 text-left text-xs text-[#6B4A2D] space-y-1 mb-4">
            <p className="font-semibold text-[#253022] mb-2">Setup Steps:</p>
            <p>1. Follow the guide in <code>google-apps-script/README.md</code></p>
            <p>2. Deploy the Apps Script as a Web App</p>
            <p>3. Set <code>VITE_APPS_SCRIPT_URL</code> in your <code>.env</code> file</p>
            <p>4. Set <code>VITE_BACKEND_ENABLED=true</code></p>
            <p>5. Rebuild and redeploy the website</p>
          </div>
          <a href="#/" className="text-[#2F4A24] font-semibold hover:underline text-sm">← Back to Home</a>
        </div>
      </div>
    );
  }

  // ── LOGIN SCREEN ──────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F4E8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md border border-[#EFE7D5] p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#2F4A24] flex items-center justify-center mx-auto mb-3">
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#253022] font-serif-heading">Admin Login</h1>
            <p className="text-[#6B4A2D] text-sm mt-1">Ayesha Herbal Order Management</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#253022] mb-1.5">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full border border-[#5B7138]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4A24]"
                autoFocus
              />
            </div>
            {loginError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-xs">{loginError}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#2F4A24] hover:bg-[#253022] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loginLoading ? <><Loader2 size={18} className="animate-spin" /> Logging in...</> : 'Login'}
            </button>
          </form>
          <p className="text-center text-xs text-[#6B4A2D] mt-4">
            <a href="#/" className="hover:underline">← Back to website</a>
          </p>
        </div>
      </div>
    );
  }

  // ── ORDER DETAIL VIEW ─────────────────────────────────────
  if (view === 'orderDetail') {
    return (
      <div className="min-h-screen bg-[#F8F4E8]">
        <div className="bg-[#2F4A24] text-white py-4 px-6 flex items-center justify-between">
          <button onClick={() => { setView('orders'); loadOrders(ordersPage); }} className="flex items-center gap-2 text-sm hover:text-[#c8d9b4]">
            <ArrowLeft size={16} /> Back to Orders
          </button>
          <span className="font-bold text-sm">Order Management</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-[#c8d9b4]"><LogOut size={14} /></button>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {orderLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2F4A24]" /></div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              {/* Order header */}
              <div className="bg-white rounded-2xl border border-[#EFE7D5] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#253022]">{selectedOrder.orderId}</h2>
                    <p className="text-sm text-[#6B4A2D]">Placed on {formatDate(selectedOrder.orderDate)}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[selectedOrder.orderStatus] || 'bg-gray-100'}`}>{selectedOrder.orderStatus}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${paymentColors[selectedOrder.paymentStatus] || 'bg-gray-100'}`}>{selectedOrder.paymentStatus}</span>
                  </div>
                </div>

                {updateMsg && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-green-700 text-sm">{updateMsg}</p>
                    <button onClick={() => setUpdateMsg('')} className="ml-auto"><X size={14} /></button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer info */}
                  <div className="bg-[#F8F4E8] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#2F4A24] uppercase mb-2">Customer</p>
                    <p className="font-semibold text-[#253022] text-sm">{selectedOrder.customerName}</p>
                    <p className="text-sm text-[#6B4A2D]">{selectedOrder.customerPhone}</p>
                    {selectedOrder.customerEmail && <p className="text-sm text-[#6B4A2D]">{selectedOrder.customerEmail}</p>}
                  </div>
                  {/* Delivery */}
                  <div className="bg-[#F8F4E8] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#2F4A24] uppercase mb-2">Delivery Address</p>
                    <p className="text-sm text-[#6B4A2D]">{selectedOrder.address}</p>
                    <p className="text-sm text-[#6B4A2D]">{selectedOrder.city}, {selectedOrder.state} — {selectedOrder.pinCode}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-2xl border border-[#EFE7D5] p-6">
                <h3 className="font-bold text-[#253022] mb-4">Products Ordered</h3>
                <div className="space-y-2 text-sm text-[#6B4A2D] mb-4">
                  <p>{selectedOrder.productNames}</p>
                </div>
                <div className="border-t border-[#EFE7D5] pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-[#6B4A2D]">Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                  <div className="flex justify-between"><span className="text-[#6B4A2D]">Shipping</span><span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span></div>
                  <div className="flex justify-between font-bold text-[#253022] border-t border-[#EFE7D5] pt-2"><span>Total</span><span className="text-[#2F4A24]">₹{selectedOrder.total}</span></div>
                  <div className="flex justify-between text-[#6B4A2D]"><span>Payment</span><span>{selectedOrder.paymentMethod === 'gpay' ? 'Google Pay / UPI' : 'Cash on Delivery'}</span></div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-white rounded-2xl border border-[#EFE7D5] p-6">
                <h3 className="font-bold text-[#253022] mb-4">Update Order Status</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={updating || s === selectedOrder.orderStatus}
                      onClick={() => updateStatus(s)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${s === selectedOrder.orderStatus ? 'bg-[#2F4A24] text-white border-[#2F4A24]' : 'border-[#EFE7D5] text-[#6B4A2D] hover:border-[#2F4A24] hover:text-[#2F4A24]'} disabled:opacity-50`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <h3 className="font-bold text-[#253022] mb-3">Update Payment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={updating || s === selectedOrder.paymentStatus}
                      onClick={() => updatePayment(s)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${s === selectedOrder.paymentStatus ? 'bg-[#2F4A24] text-white border-[#2F4A24]' : 'border-[#EFE7D5] text-[#6B4A2D] hover:border-[#2F4A24] hover:text-[#2F4A24]'} disabled:opacity-50`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {updating && <p className="text-xs text-[#6B4A2D] mt-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Updating...</p>}
              </div>

              {/* Admin Notes */}
              <div className="bg-white rounded-2xl border border-[#EFE7D5] p-6">
                <h3 className="font-bold text-[#253022] mb-3">Admin Notes (not visible to customer)</h3>
                {selectedOrder.adminNotes && (
                  <div className="bg-[#F8F4E8] rounded-xl p-3 mb-3 text-sm text-[#6B4A2D] whitespace-pre-line">
                    {selectedOrder.adminNotes}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 border border-[#5B7138]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4A24]"
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                  />
                  <button onClick={addNote} disabled={updating || !noteText.trim()} className="bg-[#2F4A24] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-[#253022]">
                    Add
                  </button>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.customerNotes && (
                <div className="bg-white rounded-2xl border border-[#EFE7D5] p-6">
                  <h3 className="font-bold text-[#253022] mb-2">Customer Notes</h3>
                  <p className="text-sm text-[#6B4A2D]">{selectedOrder.customerNotes}</p>
                </div>
              )}

              {/* Order History */}
              {selectedOrder.history?.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#EFE7D5] p-6">
                  <h3 className="font-bold text-[#253022] mb-4">Order History</h3>
                  <div className="space-y-3">
                    {selectedOrder.history.map((h, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-[#2F4A24] shrink-0 mt-1.5" />
                        <div>
                          <p className="text-[#253022] font-medium">{h.previousStatus ? `${h.previousStatus} → ${h.newStatus}` : h.newStatus}</p>
                          {h.notes && <p className="text-[#6B4A2D] text-xs">{h.notes}</p>}
                          <p className="text-[#6B4A2D] text-xs">{formatDate(h.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#6B4A2D] text-center py-12">Order not found.</p>
          )}
        </div>
      </div>
    );
  }

  // ── ORDERS LIST VIEW ──────────────────────────────────────
  if (view === 'orders') {
    const totalPages = Math.ceil(ordersTotal / 15);
    return (
      <div className="min-h-screen bg-[#F8F4E8]">
        <div className="bg-[#2F4A24] text-white py-4 px-6 flex items-center justify-between">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm hover:text-[#c8d9b4]">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span className="font-bold">All Orders ({ordersTotal})</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-[#c8d9b4]"><LogOut size={14} /> Logout</button>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#EFE7D5] p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4A2D]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, order ID..." className="w-full pl-8 pr-3 py-2 border border-[#EFE7D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4A24]" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-[#EFE7D5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4A24]">
                <option value="All">All Statuses</option>
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="border border-[#EFE7D5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4A24]">
                <option value="All">All Payments</option>
                {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-[#EFE7D5] rounded-lg px-3 py-2 text-sm focus:outline-none" title="Date from" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-[#EFE7D5] rounded-lg px-3 py-2 text-sm focus:outline-none" title="Date to" />
              <button onClick={() => loadOrders(1)} className="bg-[#2F4A24] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-[#253022]">
                <RefreshCw size={14} /> Search
              </button>
              <button onClick={handleExport} disabled={exporting} className="border border-[#2F4A24] text-[#2F4A24] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-[#F8F4E8] disabled:opacity-60">
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export CSV
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#EFE7D5] overflow-hidden">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#2F4A24]" /></div>
            ) : orders.length === 0 ? (
              <p className="text-center text-[#6B4A2D] py-16">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8F4E8] border-b border-[#EFE7D5]">
                      <th className="text-left px-4 py-3 text-[#253022] font-semibold text-xs">Order ID</th>
                      <th className="text-left px-4 py-3 text-[#253022] font-semibold text-xs">Date</th>
                      <th className="text-left px-4 py-3 text-[#253022] font-semibold text-xs">Customer</th>
                      <th className="text-left px-4 py-3 text-[#253022] font-semibold text-xs">Total</th>
                      <th className="text-left px-4 py-3 text-[#253022] font-semibold text-xs">Payment</th>
                      <th className="text-left px-4 py-3 text-[#253022] font-semibold text-xs">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderId} className="border-b border-[#EFE7D5] hover:bg-[#F8F4E8] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[#2F4A24] font-semibold">{order.orderId}</td>
                        <td className="px-4 py-3 text-[#6B4A2D] text-xs">{formatDate(order.orderDate)}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#253022] text-xs">{order.customerName}</p>
                          <p className="text-[#6B4A2D] text-xs">{order.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#253022] text-xs">₹{order.total}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentColors[order.paymentStatus] || 'bg-gray-100'}`}>{order.paymentStatus}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>{order.orderStatus}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openOrder(order.orderId)} className="flex items-center gap-1 text-[#2F4A24] hover:underline text-xs font-semibold">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => loadOrders(ordersPage - 1)} disabled={ordersPage <= 1} className="p-2 rounded-lg border border-[#EFE7D5] disabled:opacity-40 hover:bg-white">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-[#6B4A2D]">Page {ordersPage} of {totalPages}</span>
              <button onClick={() => loadOrders(ordersPage + 1)} disabled={ordersPage >= totalPages} className="p-2 rounded-lg border border-[#EFE7D5] disabled:opacity-40 hover:bg-white">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DASHBOARD VIEW ────────────────────────────────────────
  const statCards = stats ? [
    { label: 'Total Orders', value: stats.total, color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { label: 'New', value: stats.newOrders, color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { label: 'Confirmed', value: stats.confirmed, color: 'bg-purple-50 border-purple-100 text-purple-700' },
    { label: 'Processing', value: stats.processing, color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
    { label: 'Shipped', value: stats.shipped, color: 'bg-orange-50 border-orange-100 text-orange-700' },
    { label: 'Delivered', value: stats.delivered, color: 'bg-green-50 border-green-100 text-green-700' },
    { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-50 border-red-100 text-red-700' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#F8F4E8]">
      <div className="bg-[#2F4A24] text-white py-4 px-6 flex items-center justify-between">
        <span className="font-bold text-lg">Ayesha Herbal — Admin</span>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-[#c8d9b4]">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Revenue Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#EFE7D5] p-5">
              <p className="text-xs text-[#6B4A2D] mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-[#2F4A24]">{formatRupee(stats.totalRevenue)}</p>
              <p className="text-xs text-[#6B4A2D] mt-1">All non-cancelled orders</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#EFE7D5] p-5">
              <p className="text-xs text-[#6B4A2D] mb-1">Collected (Paid)</p>
              <p className="text-2xl font-bold text-green-600">{formatRupee(stats.paidRevenue)}</p>
              <p className="text-xs text-[#6B4A2D] mt-1">Payment received</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#EFE7D5] p-5">
              <p className="text-xs text-[#6B4A2D] mb-1">Pending Collection</p>
              <p className="text-2xl font-bold text-amber-600">{formatRupee(stats.pendingRevenue)}</p>
              <p className="text-xs text-[#6B4A2D] mt-1">Payment not yet received</p>
            </div>
          </div>
        )}

        {/* Period Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Today', value: stats.todayOrders }, { label: 'This Week', value: stats.weekOrders }, { label: 'This Month', value: stats.monthOrders }].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#EFE7D5] p-4 text-center">
                <p className="text-2xl font-bold text-[#253022]">{s.value}</p>
                <p className="text-xs text-[#6B4A2D]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Order Status Counts */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-[#2F4A24]" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {statCards.map((c) => (
              <div key={c.label} className={`rounded-xl border p-4 text-center ${c.color}`}>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs font-medium">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={goToOrders} className="bg-[#2F4A24] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#253022] transition-colors flex items-center gap-2">
            <Eye size={16} /> View All Orders
          </button>
          <button onClick={() => loadDashboard(token)} className="border border-[#2F4A24] text-[#2F4A24] font-semibold px-6 py-3 rounded-xl hover:bg-white transition-colors flex items-center gap-2">
            <RefreshCw size={16} /> Refresh Stats
          </button>
          <button onClick={handleExport} disabled={exporting} className="border border-[#5B7138] text-[#5B7138] font-semibold px-6 py-3 rounded-xl hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-60">
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Export All Orders CSV
          </button>
        </div>
      </div>
    </div>
  );
}
