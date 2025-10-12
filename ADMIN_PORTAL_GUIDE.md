# ParkMate Admin Portal Guide

## 🔐 Admin Portal Overview

The ParkMate Admin Portal is a **secure, hidden interface** for administrators to generate and manage activation codes for customers. It's completely separated from the main user app with no visible navigation.

---

## 🚀 Quick Start

### Access URL
The admin portal is accessible ONLY via direct URL:
```
https://your-app-url.lovable.app/admin
```

**Important:** There is no button or link to the admin portal in the main app. Only administrators who know the URL can access it.

---

## 📋 Initial Setup

### Step 1: Create Admin Account

1. **Sign up in the main ParkMate app** (normal user signup)
2. Note your email address used for signup

### Step 2: Grant Admin Role

1. **Open Lovable Cloud Backend:**
   - Go to your Lovable project
   - Click "Backend" in the top navigation
   
2. **Navigate to `user_roles` table:**
   - Find the table in the left sidebar
   - Click "Insert row"
   
3. **Add Admin Role:**
   ```
   user_id: [Copy the UUID from auth.users table]
   role: admin
   ```
   
4. **Save the record**

### Step 3: Access Admin Portal

1. Navigate to: `https://your-app-url.lovable.app/admin`
2. Login with your admin credentials
3. You're now in the secure admin dashboard!

---

## 💼 Generating Activation Codes

### Quick Generation (One-Click)

The admin portal provides **preset buttons** for common scenarios:

#### Available Presets:
- **Generate 10 Trial Codes** → 5-day trial period
- **Generate 10 Monthly Codes** → 30-day subscription
- **Generate 5 Quarterly Codes** → 90-day subscription
- **Generate 5 Yearly Codes** → 365-day subscription

**How to use:**
1. Click any preset button
2. Codes are generated automatically
3. Copy or export the codes immediately

### Custom Generation

For specific needs, use the custom generator:

1. **Select Duration:**
   - Trial (5 days)
   - 1 Month (30 days)
   - 2 Months (60 days)
   - 3 Months (90 days)
   - 6 Months (180 days)
   - 1 Year (365 days)

2. **Set Quantity:** 1-100 codes per batch

3. **Click "Generate Codes"**

---

## 📊 Dashboard Features

### Code Statistics
Real-time overview of your activation codes:
- **Total Codes:** All codes ever generated
- **Used Codes:** Codes that have been activated by customers
- **Available Codes:** Unused codes ready for distribution

### Generated Codes List
View all recently generated codes with:
- **Code format:** PK######XX (e.g., PK123456AB)
- **Duration:** Number of days the code is valid for
- **Timestamp:** When the code was generated
- **Copy button:** Quick copy individual codes

### Bulk Actions
- **Copy All:** Copy all codes to clipboard (one per line)
- **Export CSV:** Download codes as CSV file with metadata

---

## 🔒 Security Features

### 1. Server-Side Verification
- All code generation requests are validated on the backend
- Admin role is checked in the database (cannot be spoofed)
- No client-side security bypass possible

### 2. Session Management
- **Auto-logout after 30 minutes** of inactivity
- Session expires for security
- Must re-login after timeout

### 3. Hidden Access
- No buttons or links in main app
- Only accessible via direct URL
- Non-admin users see "Access Denied" message

### 4. Audit Trail
- Every generated code is linked to the admin who created it
- `created_by` field tracks code creator
- Timestamps record when codes were generated

---

## 💰 Selling Workflow

### Step 1: Customer Contact
Customer reaches out via WhatsApp, phone, or email requesting a subscription.

### Step 2: Payment
Receive payment via your preferred method (cash, bank transfer, etc.)

### Step 3: Generate Code
1. Open admin portal
2. Use quick preset or custom generator
3. Generate code(s) based on purchased duration

### Step 4: Send Code to Customer
Send the activation code via:
- WhatsApp message
- SMS
- Email
- In-person handoff

### Step 5: Customer Activation
Customer opens ParkMate app:
1. Navigates to **Villa Manager** (top left icon)
2. Enters received activation code
3. Code activates their villa subscription
4. They can now manage up to 20 vehicles per villa

---

## 🎯 Best Practices

### Code Management
✅ **Generate codes in batches** for popular durations  
✅ **Export to CSV** for record-keeping  
✅ **Track which codes you've sent** to customers  
✅ **Use trial codes** to let customers test the app  

### Pricing Strategy
💡 **Suggested pricing tiers:**
- Trial (5 days): Free for testing
- Monthly (30 days): Standard price
- Quarterly (90 days): 10% discount
- Yearly (365 days): 20% discount

### Customer Support
📞 **Common customer questions:**
- "How do I activate my code?" → Villa Manager → Enter code
- "Can I use one code for multiple villas?" → No, one code = one villa
- "How many vehicles per villa?" → Up to 20 vehicles per villa
- "Can I add more villas?" → Yes, purchase additional codes

---

## 🛠️ Troubleshooting

### "Access Denied" Error
**Problem:** User is not recognized as admin  
**Solution:** Check `user_roles` table - ensure admin role is assigned to correct `user_id`

### "Invalid Duration" Error
**Problem:** Edge function not updated  
**Solution:** Verify edge function accepts: 5, 30, 60, 90, 180, 365 days

### Session Expired
**Problem:** Auto-logout after 30 minutes  
**Solution:** Normal security feature - just login again

### Codes Not Generating
**Problem:** Server error or database issue  
**Solution:** Check Lovable Cloud backend logs for errors

---

## 📈 Business Tracking

### Monthly Reports
Track your business performance:
1. Open **Backend Dashboard**
2. Go to `activation_codes` table
3. Filter by `created_at` date range
4. Count codes by `duration` and `is_used` status

### Customer Retention
Monitor code usage:
- **Activation rate:** Used codes / Total codes
- **Popular durations:** Which subscription lengths sell most
- **Repeat customers:** Track `used_by_device_id` for returning customers

---

## 🔄 Code Format

All activation codes follow this format:
```
PK######XX

PK = Prefix (ParkMate)
###### = 6 random digits
XX = 2 random capital letters

Example: PK123456AB
```

**Properties:**
- ✅ Unique (never repeats)
- ✅ Easy to read and type
- ✅ Format validated on both client and server
- ✅ Case-insensitive input (users can type lowercase)

---

## 📞 Admin Support

### Need Help?
- Review this guide carefully
- Check Backend logs for errors
- Verify admin role is correctly assigned
- Ensure all edge functions are deployed

### Future Enhancements
Consider adding:
- IP whitelisting for extra security
- Separate domain hosting (e.g., admin.parkmate.com)
- SMS integration for automatic code delivery
- Payment gateway integration
- Customer database with purchase history

---

## ✅ Setup Checklist

Before going live with code sales:

- [ ] Admin account created and role assigned
- [ ] Successfully logged into `/admin` portal
- [ ] Generated test codes successfully
- [ ] Verified codes work in main app (Villa Manager)
- [ ] CSV export tested and working
- [ ] Pricing strategy defined
- [ ] Customer communication templates prepared
- [ ] Payment methods set up
- [ ] Session timeout tested (30 min)
- [ ] Access URL bookmarked securely

---

## 🎉 You're Ready!

Your ParkMate Admin Portal is now configured and ready for business. Generate codes, sell subscriptions, and grow your customer base!

**Pro Tip:** Use the quick generation presets for faster code creation during customer calls. Keep the admin portal open in a separate browser tab for quick access during business hours.
