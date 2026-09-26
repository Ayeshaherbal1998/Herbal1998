// ============================================================
// AYESHA HERBAL — Google Apps Script Backend
// Version: 2.0
// ============================================================
// HOW TO DEPLOY:
// 1. Go to script.google.com and create a new project
// 2. Paste this entire file as Code.gs
// 3. Run setupSheets() once to initialize your spreadsheet
// 4. Run setAdminPassword() once to set your admin password
// 5. Deploy → New deployment → Web App
//    Execute as: Me | Who has access: Anyone
// 6. Copy the Web App URL into src/config/api.ts
// ============================================================

// ─── CONFIGURATION ────────────────────────────────────────────
var SHEET_NAMES = {
  ORDERS: 'Orders',
  ORDER_ITEMS: 'Order Items',
  ORDER_HISTORY: 'Order History',
  CONFIG: 'Configuration',
};

var ORDER_STATUSES = ['New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
var PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Refunded'];

// Trusted product catalogue — prices are validated server-side
var PRODUCTS = {
  'ayesha-herbal-hair-growth-powder': {
    name: 'Ayesha Herbal Hair Growth Powder',
    variants: {
      '100g': { label: '1 Box — 100g', price: 199 },
      '2box': { label: '2 Boxes — 200g (Save ₹49)', price: 349 },
    },
  },
};

var SHIPPING_CHARGE = 60;
var FREE_SHIPPING_THRESHOLD = 499;

// ─── ENTRY POINT ──────────────────────────────────────────────
function doPost(e) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    var body = JSON.parse(e.postData ? e.postData.contents : '{}');
    var action = body.action || '';
    var result;

    switch (action) {
      case 'createOrder':
        result = createOrder(body);
        break;
      case 'trackOrder':
        result = trackOrder(body);
        break;
      case 'adminLogin':
        result = adminLogin(body);
        break;
      case 'getOrders':
        result = getOrders(body);
        break;
      case 'getOrder':
        result = getOrder(body);
        break;
      case 'updateOrderStatus':
        result = updateOrderStatus(body);
        break;
      case 'updatePaymentStatus':
        result = updatePaymentStatus(body);
        break;
      case 'addNote':
        result = addNote(body);
        break;
      case 'getStats':
        result = getStats(body);
        break;
      case 'exportCSV':
        result = exportCSV(body);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  // Allow GET for health check and order tracking
  var params = e.parameter || {};
  var action = params.action || '';
  var result;

  try {
    if (action === 'health') {
      result = { success: true, message: 'Ayesha Herbal backend is running' };
    } else if (action === 'trackOrder') {
      result = trackOrder(params);
    } else {
      result = { success: false, error: 'Use POST for this action' };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── ADMIN AUTHENTICATION ─────────────────────────────────────
function verifyAdmin(adminToken) {
  var stored = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!stored) return { valid: false, error: 'Admin password not configured. Run setAdminPassword() first.' };
  if (adminToken !== stored) return { valid: false, error: 'Invalid admin password.' };
  return { valid: true };
}

function adminLogin(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };
  return { success: true, message: 'Login successful' };
}

// Run this ONCE in the Apps Script console to set admin password:
// setAdminPassword('YOUR_CHOSEN_PASSWORD')
function setAdminPassword(password) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  PropertiesService.getScriptProperties().setProperty('ADMIN_TOKEN', password);
  Logger.log('Admin password set successfully');
}

// ─── ORDER CREATION ───────────────────────────────────────────
function createOrder(params) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    // Idempotency: prevent duplicate orders
    var idempotencyKey = params.idempotencyKey || '';
    if (idempotencyKey) {
      var existing = findOrderByIdempotencyKey(idempotencyKey);
      if (existing) {
        return { success: true, orderId: existing, duplicate: true };
      }
    }

    // Validate required fields
    var customer = params.customer || {};
    if (!customer.fullName) return { success: false, error: 'Customer name is required' };
    if (!customer.mobileNumber) return { success: false, error: 'Mobile number is required' };
    if (!customer.address) return { success: false, error: 'Address is required' };
    if (!customer.city) return { success: false, error: 'City is required' };
    if (!customer.state) return { success: false, error: 'State is required' };
    if (!customer.pinCode) return { success: false, error: 'PIN code is required' };

    // Validate and price items server-side
    var items = params.items || [];
    if (!items.length) return { success: false, error: 'No items in order' };

    var validatedItems = [];
    var subtotal = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var product = PRODUCTS[item.productId];
      if (!product) return { success: false, error: 'Invalid product: ' + item.productId };

      var variant = item.variantId ? product.variants[item.variantId] : null;
      var price = variant ? variant.price : product.variants['100g'].price;
      var label = variant ? variant.label : product.variants['100g'].label;
      var qty = parseInt(item.quantity) || 1;

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId || '100g',
        name: product.name,
        variantLabel: label,
        price: price,
        quantity: qty,
        lineTotal: price * qty,
      });
      subtotal += price * qty;
    }

    var shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
    var total = subtotal + shipping;
    var orderId = generateOrderId();
    var now = new Date();

    // Write to Orders sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordersSheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
    var itemsSheet = ss.getSheetByName(SHEET_NAMES.ORDER_ITEMS);
    var historySheet = ss.getSheetByName(SHEET_NAMES.ORDER_HISTORY);

    var productNames = validatedItems.map(function(i) { return i.name + ' (' + i.variantLabel + ') x' + i.quantity; }).join('; ');
    var productIds = validatedItems.map(function(i) { return i.productId + ':' + i.variantId; }).join('; ');
    var quantities = validatedItems.map(function(i) { return i.quantity; }).join('; ');
    var prices = validatedItems.map(function(i) { return i.price; }).join('; ');

    ordersSheet.appendRow([
      orderId,                          // Order ID
      now,                              // Order Date
      customer.fullName,                // Customer Name
      customer.mobileNumber,            // Customer Phone
      customer.email || '',             // Customer Email
      customer.address,                 // Delivery Address
      customer.city,                    // City
      customer.state,                   // State
      customer.pinCode,                 // Postal Code
      productIds,                       // Product IDs
      productNames,                     // Product Names
      quantities,                       // Quantities
      prices,                           // Unit Prices
      subtotal,                         // Subtotal
      shipping,                         // Delivery Charge
      total,                            // Total Amount
      params.paymentMethod || 'cod',    // Payment Method
      'Unpaid',                         // Payment Status
      'New',                            // Order Status
      params.customerNotes || '',       // Customer Notes
      '',                               // Admin Notes
      now,                              // Last Updated
      idempotencyKey,                   // Idempotency Key (hidden col)
    ]);

    // Write to Order Items sheet
    for (var j = 0; j < validatedItems.length; j++) {
      var vi = validatedItems[j];
      itemsSheet.appendRow([orderId, vi.productId, vi.name + ' (' + vi.variantLabel + ')', vi.quantity, vi.price, vi.lineTotal]);
    }

    // Write to Order History
    historySheet.appendRow([orderId, now, '', 'New', 'System', 'Order placed by customer']);

    return {
      success: true,
      orderId: orderId,
      total: total,
      subtotal: subtotal,
      shipping: shipping,
    };

  } finally {
    lock.releaseLock();
  }
}

// ─── CUSTOMER ORDER TRACKING ──────────────────────────────────
function trackOrder(params) {
  var orderId = (params.orderId || '').trim().toUpperCase();
  var phone = (params.phone || '').trim().replace(/\D/g, '');

  if (!orderId || !phone) return { success: false, error: 'Order ID and phone number are required' };
  if (orderId.length < 5) return { success: false, error: 'Invalid order ID format' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = ordersSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowOrderId = String(row[0]).trim().toUpperCase();
    var rowPhone = String(row[3]).trim().replace(/\D/g, '');

    if (rowOrderId === orderId && rowPhone === phone) {
      return {
        success: true,
        order: {
          orderId: row[0],
          orderDate: row[1] ? new Date(row[1]).toLocaleDateString('en-IN') : '',
          customerName: row[2],
          productNames: row[10],
          quantities: row[11],
          subtotal: row[13],
          shipping: row[14],
          total: row[15],
          paymentMethod: row[16],
          paymentStatus: row[17],
          orderStatus: row[18],
          lastUpdated: row[21] ? new Date(row[21]).toLocaleDateString('en-IN') : '',
        },
      };
    }
  }

  return { success: false, error: 'No order found. Check your Order ID and phone number.' };
}

// ─── ADMIN: GET ALL ORDERS ────────────────────────────────────
function getOrders(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = sheet.getDataRange().getValues();

  var orders = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    orders.push({
      orderId: row[0],
      orderDate: row[1] ? new Date(row[1]).toISOString() : '',
      customerName: row[2],
      customerPhone: row[3],
      customerEmail: row[4],
      address: row[5],
      city: row[6],
      state: row[7],
      pinCode: row[8],
      productNames: row[10],
      quantities: row[11],
      subtotal: row[13],
      shipping: row[14],
      total: row[15],
      paymentMethod: row[16],
      paymentStatus: row[17],
      orderStatus: row[18],
      customerNotes: row[19],
      adminNotes: row[20],
      lastUpdated: row[21] ? new Date(row[21]).toISOString() : '',
    });
  }

  // Apply filters
  if (params.status && params.status !== 'All') {
    orders = orders.filter(function(o) { return o.orderStatus === params.status; });
  }
  if (params.paymentStatus && params.paymentStatus !== 'All') {
    orders = orders.filter(function(o) { return o.paymentStatus === params.paymentStatus; });
  }
  if (params.search) {
    var q = params.search.toLowerCase();
    orders = orders.filter(function(o) {
      return o.orderId.toLowerCase().includes(q) ||
             o.customerName.toLowerCase().includes(q) ||
             o.customerPhone.includes(q);
    });
  }
  if (params.dateFrom) {
    var from = new Date(params.dateFrom);
    orders = orders.filter(function(o) { return new Date(o.orderDate) >= from; });
  }
  if (params.dateTo) {
    var to = new Date(params.dateTo);
    to.setHours(23, 59, 59);
    orders = orders.filter(function(o) { return new Date(o.orderDate) <= to; });
  }

  // Sort newest first
  orders.sort(function(a, b) { return new Date(b.orderDate) - new Date(a.orderDate); });

  // Pagination
  var page = parseInt(params.page) || 1;
  var pageSize = parseInt(params.pageSize) || 20;
  var total = orders.length;
  var start = (page - 1) * pageSize;
  var paged = orders.slice(start, start + pageSize);

  return { success: true, orders: paged, total: total, page: page, pageSize: pageSize };
}

// ─── ADMIN: GET SINGLE ORDER ──────────────────────────────────
function getOrder(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };

  var orderId = (params.orderId || '').trim().toUpperCase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = ordersSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).trim().toUpperCase() === orderId) {
      var historySheet = ss.getSheetByName(SHEET_NAMES.ORDER_HISTORY);
      var histData = historySheet.getDataRange().getValues();
      var history = [];
      for (var h = 1; h < histData.length; h++) {
        if (String(histData[h][0]).trim().toUpperCase() === orderId) {
          history.push({
            date: histData[h][1] ? new Date(histData[h][1]).toISOString() : '',
            previousStatus: histData[h][2],
            newStatus: histData[h][3],
            updatedBy: histData[h][4],
            notes: histData[h][5],
          });
        }
      }

      return {
        success: true,
        order: {
          orderId: row[0],
          orderDate: row[1] ? new Date(row[1]).toISOString() : '',
          customerName: row[2],
          customerPhone: row[3],
          customerEmail: row[4],
          address: row[5],
          city: row[6],
          state: row[7],
          pinCode: row[8],
          productIds: row[9],
          productNames: row[10],
          quantities: row[11],
          unitPrices: row[12],
          subtotal: row[13],
          shipping: row[14],
          total: row[15],
          paymentMethod: row[16],
          paymentStatus: row[17],
          orderStatus: row[18],
          customerNotes: row[19],
          adminNotes: row[20],
          lastUpdated: row[21] ? new Date(row[21]).toISOString() : '',
          history: history,
        },
      };
    }
  }
  return { success: false, error: 'Order not found: ' + orderId };
}

// ─── ADMIN: UPDATE ORDER STATUS ───────────────────────────────
function updateOrderStatus(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };

  var orderId = (params.orderId || '').trim().toUpperCase();
  var newStatus = params.newStatus || '';
  if (ORDER_STATUSES.indexOf(newStatus) === -1) return { success: false, error: 'Invalid status: ' + newStatus };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = sheet.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === orderId) {
      var prevStatus = data[i][18];
      sheet.getRange(i + 1, 19).setValue(newStatus);  // Order Status col
      sheet.getRange(i + 1, 22).setValue(now);         // Last Updated col

      // Log to history
      var histSheet = ss.getSheetByName(SHEET_NAMES.ORDER_HISTORY);
      histSheet.appendRow([orderId, now, prevStatus, newStatus, 'Admin', params.notes || '']);

      return { success: true, message: 'Status updated to ' + newStatus };
    }
  }
  return { success: false, error: 'Order not found: ' + orderId };
}

// ─── ADMIN: UPDATE PAYMENT STATUS ────────────────────────────
function updatePaymentStatus(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };

  var orderId = (params.orderId || '').trim().toUpperCase();
  var newStatus = params.newStatus || '';
  if (PAYMENT_STATUSES.indexOf(newStatus) === -1) return { success: false, error: 'Invalid payment status: ' + newStatus };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = sheet.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === orderId) {
      var prevStatus = data[i][17];
      sheet.getRange(i + 1, 18).setValue(newStatus);  // Payment Status col
      sheet.getRange(i + 1, 22).setValue(now);

      var histSheet = ss.getSheetByName(SHEET_NAMES.ORDER_HISTORY);
      histSheet.appendRow([orderId, now, 'Payment:' + prevStatus, 'Payment:' + newStatus, 'Admin', params.notes || '']);

      return { success: true, message: 'Payment status updated to ' + newStatus };
    }
  }
  return { success: false, error: 'Order not found: ' + orderId };
}

// ─── ADMIN: ADD NOTE ──────────────────────────────────────────
function addNote(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };

  var orderId = (params.orderId || '').trim().toUpperCase();
  var note = (params.note || '').trim();
  if (!note) return { success: false, error: 'Note cannot be empty' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = sheet.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === orderId) {
      var existing = data[i][20] || '';
      var newNote = existing ? existing + '\n[' + now.toLocaleDateString('en-IN') + '] ' + note : '[' + now.toLocaleDateString('en-IN') + '] ' + note;
      sheet.getRange(i + 1, 21).setValue(newNote);
      sheet.getRange(i + 1, 22).setValue(now);
      return { success: true, message: 'Note added' };
    }
  }
  return { success: false, error: 'Order not found: ' + orderId };
}

// ─── ADMIN: DASHBOARD STATS ───────────────────────────────────
function getStats(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = sheet.getDataRange().getValues();

  var stats = {
    total: 0, newOrders: 0, confirmed: 0, processing: 0,
    shipped: 0, delivered: 0, cancelled: 0,
    totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0,
    todayOrders: 0, weekOrders: 0, monthOrders: 0,
  };

  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    stats.total++;
    var status = row[18];
    var payStatus = row[17];
    var total = parseFloat(row[15]) || 0;
    var orderDate = new Date(row[1]);

    if (status === 'New') stats.newOrders++;
    else if (status === 'Confirmed') stats.confirmed++;
    else if (status === 'Processing') stats.processing++;
    else if (status === 'Shipped') stats.shipped++;
    else if (status === 'Delivered') stats.delivered++;
    else if (status === 'Cancelled') stats.cancelled++;

    if (status !== 'Cancelled') {
      stats.totalRevenue += total;
      if (payStatus === 'Paid') stats.paidRevenue += total;
      else stats.pendingRevenue += total;
    }

    if (orderDate >= todayStart) stats.todayOrders++;
    if (orderDate >= weekStart) stats.weekOrders++;
    if (orderDate >= monthStart) stats.monthOrders++;
  }

  return { success: true, stats: stats };
}

// ─── ADMIN: EXPORT CSV ────────────────────────────────────────
function exportCSV(params) {
  var check = verifyAdmin(params.adminToken);
  if (!check.valid) return { success: false, error: check.error };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [headers.slice(0, 22)]; // exclude idempotency key

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    var status = row[18];
    var payStatus = row[17];
    if (params.statusFilter && params.statusFilter !== 'All' && status !== params.statusFilter) continue;
    if (params.paymentFilter && params.paymentFilter !== 'All' && payStatus !== params.paymentFilter) continue;
    rows.push(row.slice(0, 22));
  }

  var csv = rows.map(function(r) {
    return r.map(function(cell) {
      var s = cell instanceof Date ? cell.toLocaleDateString('en-IN') : String(cell || '');
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(',');
  }).join('\n');

  return { success: true, csv: csv, rowCount: rows.length - 1 };
}

// ─── SETUP: INITIALIZE SHEETS ─────────────────────────────────
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Orders Sheet
  createOrGetSheet(ss, SHEET_NAMES.ORDERS, [
    'Order ID', 'Order Date', 'Customer Name', 'Customer Phone', 'Customer Email',
    'Delivery Address', 'City', 'State', 'Postal Code',
    'Product IDs', 'Product Names', 'Quantities', 'Unit Prices',
    'Subtotal', 'Delivery Charge', 'Total Amount',
    'Payment Method', 'Payment Status', 'Order Status',
    'Customer Notes', 'Admin Notes', 'Last Updated', 'Idempotency Key',
  ]);

  // Order Items Sheet
  createOrGetSheet(ss, SHEET_NAMES.ORDER_ITEMS, [
    'Order ID', 'Product ID', 'Product Name', 'Quantity', 'Unit Price', 'Line Total',
  ]);

  // Order History Sheet
  createOrGetSheet(ss, SHEET_NAMES.ORDER_HISTORY, [
    'Order ID', 'Event Date', 'Previous Status', 'New Status', 'Updated By', 'Notes',
  ]);

  // Configuration Sheet
  createOrGetSheet(ss, SHEET_NAMES.CONFIG, [
    'Key', 'Value', 'Description',
  ]);
  var configSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (configSheet.getLastRow() < 2) {
    configSheet.appendRow(['SHIPPING_CHARGE', 60, 'Shipping charge in INR']);
    configSheet.appendRow(['FREE_SHIPPING_THRESHOLD', 499, 'Order value for free shipping']);
    configSheet.appendRow(['STORE_NAME', 'Ayesha Herbal Powder', 'Store name']);
    configSheet.appendRow(['WHATSAPP', '918496093074', 'WhatsApp number with country code']);
  }

  Logger.log('Setup complete! All sheets created.');
  SpreadsheetApp.getUi().alert('Setup complete! All sheets are ready.');
}

function createOrGetSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headerRow = sheet.getRange(1, 1, 1, headers.length);
    headerRow.setValues([headers]);
    headerRow.setFontWeight('bold');
    headerRow.setBackground('#2F4A24');
    headerRow.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150);
    Logger.log('Created sheet: ' + name);
  } else {
    Logger.log('Sheet already exists: ' + name);
  }
  return sheet;
}

// ─── HELPERS ──────────────────────────────────────────────────
function generateOrderId() {
  var now = new Date();
  var datePart = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
  var randPart = Math.floor(1000 + Math.random() * 9000);
  return 'AH-' + datePart + '-' + randPart;
}

function findOrderByIdempotencyKey(key) {
  if (!key) return null;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][22]) === key) return String(data[i][0]);
  }
  return null;
}
