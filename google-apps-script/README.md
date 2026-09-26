# Google Apps Script Setup Guide

## What This Does
- Saves every order from your website into a **Google Sheet**
- Powers the **Admin Dashboard** (`/#/admin`) to manage orders
- Powers **Customer Order Tracking** (`/#/track-order`)
- Sends automated responses to the website's frontend

---

## STEP 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) (use `herbalayesha191@gmail.com`)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it: **Ayesha Herbal Orders**
4. Copy the spreadsheet URL — you'll need it in Step 2

---

## STEP 2 — Create the Apps Script Project

1. Inside the spreadsheet, click **Extensions → Apps Script**
2. This opens the Apps Script editor
3. **Delete everything** in the `Code.gs` file that opens
4. Open the file `google-apps-script/Code.gs` from this project
5. **Select all** and **copy** its entire contents
6. **Paste** it into the Apps Script editor
7. Click **Save** (the floppy disk icon) or press `Ctrl+S`
8. Name the project: **Ayesha Herbal Backend**

---

## STEP 3 — Initialize the Google Sheets

1. In the Apps Script editor, find the function dropdown at the top (it says "Select function")
2. Select **`setupSheets`** from the dropdown
3. Click the **▶ Run** button
4. A popup will ask you to **authorize** the script — click through:
   - Click **"Review permissions"**
   - Select your Google account (`herbalayesha191@gmail.com`)
   - Click **"Advanced"** → **"Go to Ayesha Herbal Backend (unsafe)"**
   - Click **"Allow"**
5. The script runs and creates all the sheets (Orders, Order Items, Order History, Configuration)
6. A popup will say **"Setup complete!"**

---

## STEP 4 — Set Your Admin Password

1. In the Apps Script editor, **open the Console** (View → Logs, or bottom panel)
2. In the function dropdown, select **`setAdminPassword`**
3. You **cannot run it with a parameter from the dropdown** directly. Instead:
   - Click on the **Editor** tab (the `<>` icon on the left)
   - At the very bottom of `Code.gs`, temporarily add this line:
     ```javascript
     function runSetPassword() { setAdminPassword('YOUR_CHOSEN_PASSWORD'); }
     ```
     Replace `YOUR_CHOSEN_PASSWORD` with a strong password (minimum 8 characters)
   - Select `runSetPassword` in the function dropdown
   - Click **▶ Run**
   - **Delete that temporary function line** after running it
   - Click **Save**

> **Security**: Your password is stored only on Google's servers in Script Properties. It is never in your code or git repository.

---

## STEP 5 — Deploy as a Web App

1. Click **Deploy** (top right) → **New deployment**
2. Click the ⚙️ gear icon next to "Type" → select **Web app**
3. Configure:
   - **Description**: `Ayesha Herbal Backend v1`
   - **Execute as**: `Me (herbalayesha191@gmail.com)`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. Authorize again if prompted (same steps as Step 3)
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## STEP 6 — Configure the Website

1. In your project folder, create a file called `.env` (copy from `.env.example`)
2. Fill in:
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
   VITE_BACKEND_ENABLED=true
   ```
3. Save the file

> **IMPORTANT**: Never commit `.env` to git. It is already in `.gitignore`.

---

## STEP 7 — Rebuild and Deploy the Website

Open a terminal in the project folder and run:

```bash
npm run deploy
```

This builds the website with your new settings and pushes it to GitHub Pages.

---

## STEP 8 — Test the System

1. **Place a test order** on `https://ayeshaherbal1998.github.io/Herbal1998/`
2. Check your **Google Sheet → Orders tab** — the order should appear within seconds
3. Open the **Admin Dashboard**: `https://ayeshaherbal1998.github.io/Herbal1998/#/admin`
4. Log in with the password you set in Step 4
5. You should see your test order

---

## Accessing the Admin Dashboard

URL: `https://ayeshaherbal1998.github.io/Herbal1998/#/admin`

**What you can do:**
- View all orders with filters (status, payment, date, search)
- Click any order to see full details
- Update order status (New → Confirmed → Processing → Shipped → Delivered)
- Mark payment as Paid / Unpaid / Refunded
- Add internal notes
- Export all orders as a CSV file for Excel/Sheets

---

## Customer Order Tracking

URL: `https://ayeshaherbal1998.github.io/Herbal1998/#/track-order`

Customers enter their **Order ID + mobile number** to see:
- Current order status with visual progress bar
- Items ordered
- Total amount and payment status

---

## Updating the Apps Script

If you need to make changes:
1. Go to script.google.com → open your project
2. Edit the code
3. Click **Deploy → Manage deployments**
4. Click the pencil ✏️ icon on your deployment
5. Change version to **"New version"**
6. Click **Deploy**

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Admin login fails | Check VITE_APPS_SCRIPT_URL is correct; verify you ran `setAdminPassword()` |
| Orders not appearing in sheet | Open the Apps Script editor and check Executions log for errors |
| CORS error in browser console | Make sure Apps Script is deployed with "Anyone" access |
| Track order says "not found" | Order ID is case-sensitive; phone must match exactly what customer entered |
| CSV download is empty | Make sure there are real orders in the sheet |

---

## Backup

To backup your orders:
1. Open the Google Sheet
2. File → Download → Microsoft Excel (.xlsx)

Or from the Admin Dashboard, click **Export CSV** to download all orders.
