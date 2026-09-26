// ─── Order Service — communicates with Google Apps Script backend ─────────────
import { API_CONFIG } from '../config/api';
import type { CartItem, CustomerInfo } from '../types';

export interface OrderPayload {
  customer: CustomerInfo;
  items: CartItem[];
  paymentMethod: string;
  customerNotes?: string;
  idempotencyKey: string;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  total?: number;
  subtotal?: number;
  shipping?: number;
  error?: string;
  duplicate?: boolean;
}

export interface TrackOrderResult {
  success: boolean;
  order?: {
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
  };
  error?: string;
}

// ─── Core fetch to Apps Script ────────────────────────────────
async function callBackend(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const url = API_CONFIG.APPS_SCRIPT_URL;
  if (!url) throw new Error('Apps Script URL not configured. See src/config/api.ts');

  const response = await fetch(url, {
    method: 'POST',
    // Use text/plain to avoid CORS preflight (Apps Script limitation)
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─── Create Order ─────────────────────────────────────────────
export async function submitOrder(payload: OrderPayload): Promise<OrderResult> {
  const data = await callBackend({
    action: 'createOrder',
    customer: payload.customer,
    items: payload.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    })),
    paymentMethod: payload.paymentMethod,
    customerNotes: payload.customerNotes || '',
    idempotencyKey: payload.idempotencyKey,
  });

  return data as unknown as OrderResult;
}

// ─── Track Order ──────────────────────────────────────────────
export async function trackOrderById(orderId: string, phone: string): Promise<TrackOrderResult> {
  const data = await callBackend({
    action: 'trackOrder',
    orderId,
    phone,
  });
  return data as unknown as TrackOrderResult;
}

// ─── Admin: Login ─────────────────────────────────────────────
export async function adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  const data = await callBackend({ action: 'adminLogin', adminToken: password });
  return data as { success: boolean; error?: string };
}

// ─── Admin: Get Orders ────────────────────────────────────────
export async function adminGetOrders(
  adminToken: string,
  filters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const data = await callBackend({ action: 'getOrders', adminToken, ...filters });
  return data as { success: boolean; orders?: AdminOrder[]; total?: number; page?: number; error?: string };
}

// ─── Admin: Get Single Order ──────────────────────────────────
export async function adminGetOrder(adminToken: string, orderId: string) {
  const data = await callBackend({ action: 'getOrder', adminToken, orderId });
  return data as { success: boolean; order?: AdminOrderDetail; error?: string };
}

// ─── Admin: Update Order Status ───────────────────────────────
export async function adminUpdateOrderStatus(
  adminToken: string, orderId: string, newStatus: string, notes?: string
) {
  const data = await callBackend({ action: 'updateOrderStatus', adminToken, orderId, newStatus, notes: notes || '' });
  return data as { success: boolean; error?: string };
}

// ─── Admin: Update Payment Status ────────────────────────────
export async function adminUpdatePaymentStatus(
  adminToken: string, orderId: string, newStatus: string, notes?: string
) {
  const data = await callBackend({ action: 'updatePaymentStatus', adminToken, orderId, newStatus, notes: notes || '' });
  return data as { success: boolean; error?: string };
}

// ─── Admin: Add Note ──────────────────────────────────────────
export async function adminAddNote(adminToken: string, orderId: string, note: string) {
  const data = await callBackend({ action: 'addNote', adminToken, orderId, note });
  return data as { success: boolean; error?: string };
}

// ─── Admin: Get Stats ─────────────────────────────────────────
export async function adminGetStats(adminToken: string) {
  const data = await callBackend({ action: 'getStats', adminToken });
  return data as { success: boolean; stats?: AdminStats; error?: string };
}

// ─── Admin: Export CSV ────────────────────────────────────────
export async function adminExportCSV(adminToken: string, statusFilter?: string, paymentFilter?: string) {
  const data = await callBackend({ action: 'exportCSV', adminToken, statusFilter, paymentFilter });
  return data as { success: boolean; csv?: string; rowCount?: number; error?: string };
}

// ─── Types ────────────────────────────────────────────────────
export interface AdminOrder {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productNames: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  lastUpdated: string;
}

export interface AdminOrderDetail extends AdminOrder {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  productIds: string;
  quantities: string;
  unitPrices: string;
  customerNotes: string;
  adminNotes: string;
  history: Array<{
    date: string;
    previousStatus: string;
    newStatus: string;
    updatedBy: string;
    notes: string;
  }>;
}

export interface AdminStats {
  total: number;
  newOrders: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
}
