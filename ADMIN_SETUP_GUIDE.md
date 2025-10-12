# 🔐 Admin Setup & Code Generation Guide

## 📋 Overview
This guide explains how to set up your admin account and start generating activation codes for ParkMate customers.

---

## 🚀 Initial Admin Setup

### Step 1: Create Your Admin Account

1. **Open the Backend Dashboard**
   - Contact your developer to access the Cloud backend
   - You need to create your first admin user account

2. **Create Admin User**
   - Sign up with your email and password in the authentication section
   - Note down your User ID (you'll need it for the next step)

3. **Assign Admin Role**
   - In the backend, go to the `user_roles` table
   - Add a new row with:
     - `user_id`: Your user ID from step 2
     - `role`: Select "admin"
   
   This gives you admin privileges to generate codes.

### Step 2: Access the Admin Panel

1. Navigate to: `https://your-app-url.com/admin`
2. Login with your admin credentials
3. You should now see the Admin Dashboard

---

## 💰 Your Selling Workflow

### How to Sell Subscriptions

**Step 1: Customer Contacts You**
- Customer reaches out (WhatsApp, phone, etc.)
- They want to buy: 30, 60, or 90-day subscription
- Collect payment first (cash, bank transfer, etc.)

**Step 2: Generate Activation Code**
1. Open admin panel: `/admin`
2. Select duration:
   - 30 days = 1 month
   - 60 days = 2 months
   - 90 days = 3 months
3. Set quantity: Usually 1 (unless bulk order)
4. Click "Generate Codes"
5. Code appears immediately (format: PK123456AB)

**Step 3: Send Code to Customer**
- Copy the code
- Send via WhatsApp or SMS:
  ```
  Your ParkMate activation code: PK123456AB
  Valid for: 30 days
  
  How to activate:
  1. Open ParkMate app
  2. Go to "Activate" tab
  3. Enter code: PK123456AB
  4. Click Activate
  
  Your subscription will start immediately!
  ```

**Step 4: Customer Activates**
- Customer enters code in app
- Code is validated with server
- Subscription starts automatically
- Code becomes used (can't be reused)

**Step 5: Track & Manage**
- All generated codes appear in your admin panel
- You can:
  - Copy individual codes
  - Copy all codes at once
  - Export codes to CSV for your records

---

## 🎯 Best Practices

### Code Management
- **Generate codes on-demand** (when customer pays)
- **Keep records** - Download CSV regularly for accounting
- **Single use only** - Each code works once
- **No expiry** - Generated codes don't expire until activated

### Pricing Strategy (Suggested)
You can set your own prices based on your market:
- **30 days**: $X
- **60 days**: $Y (10% discount)
- **90 days**: $Z (20% discount)

### Customer Support
If customer says code doesn't work:
1. Check code format (must be exact: PK######XX)
2. Verify you sent the correct code
3. Check if code was already used (in your records)
4. Generate a new code if needed

---

## 📊 Admin Panel Features

### Generate Codes Section
- **Duration dropdown**: Select 30/60/90 days
- **Quantity field**: How many codes to generate (1-100)
- **Generate button**: Creates codes instantly

### Generated Codes List
Shows all codes you've generated:
- **Code**: The activation code (PK123456AB)
- **Duration**: How many days it's valid for
- **Generated At**: When you created it
- **Copy button**: Quick copy to clipboard

### Bulk Actions
- **Copy All**: Copy all codes to clipboard at once
- **Export CSV**: Download Excel-compatible file with all codes

---

## 🔒 Security Notes

### Protect Your Admin Access
- ✅ Use strong password
- ✅ Don't share admin credentials
- ✅ Only access from secure devices
- ✅ Log out after generating codes

### Code Security
- Each code can only be used once
- Codes are tied to device ID (prevents sharing)
- Server validates all activations
- You can track which codes are used

---

## 💡 Common Questions

**Q: How many codes can I generate at once?**
A: Between 1 and 100 codes per generation

**Q: Do generated codes expire?**
A: No, codes remain valid until activated. After activation, subscription expires based on duration.

**Q: Can I see who used which code?**
A: Codes are tracked but don't reveal personal user data (privacy by design)

**Q: What if I lose my codes?**
A: All generated codes are saved in the admin panel. You can also export CSV backups.

**Q: Can a code be used multiple times?**
A: No, each code works only once. After activation, it's marked as used.

**Q: What happens when customer's subscription expires?**
A: App notifies them. They contact you for renewal. You generate a new code.

---

## 📱 Customer Instructions (Share This)

### How Customers Activate:

1. **Open ParkMate app**
2. **Tap "Activate" tab** (bottom navigation)
3. **Enter activation code** (example: PK123456AB)
4. **Tap "Activate" button**
5. **Done!** Subscription active immediately

### If Code Doesn't Work:
- Check code format (must be exact)
- Make sure no extra spaces
- Code is case-sensitive (use UPPERCASE)
- Contact you if issue persists

---

## 🎉 Success Tips

1. **Fast Response**: Generate codes quickly when customer pays
2. **Clear Communication**: Send activation instructions with code
3. **Keep Records**: Export CSV monthly for accounting
4. **Customer Service**: Help customers activate if they have trouble
5. **Renewals**: Remind customers before expiry to renew

---

## 🆘 Need Help?

If you encounter issues:
1. Check this guide first
2. Verify your admin role is set correctly
3. Ensure you're using the correct admin panel URL
4. Contact your developer for technical issues

---

## 📈 Tracking Your Business

### Monthly Reports
1. Export CSV from admin panel
2. Count total codes generated
3. Calculate revenue
4. Track popular durations (30/60/90 days)

### Customer Retention
- Track renewal rates
- Offer loyalty discounts
- Send renewal reminders before expiry

---

**Remember**: You're in control! Generate codes whenever customers pay, and let the system handle the technical validation automatically. Focus on customer service and growing your business! 🚀
