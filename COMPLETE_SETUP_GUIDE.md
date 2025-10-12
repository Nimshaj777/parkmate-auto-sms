# 🚀 Complete Setup Guide for Beginners
## ParkMate Auto SMS - Full Installation & Setup

---

## ✅ **STEP 1: Setup Admin Account** (5 minutes)

### 1.1 Create Admin User
1. Open your app in the browser (you're already here!)
2. Go to this URL: `/admin` (add `/admin` to the end of your current URL)
3. You'll see a signup form - **Create your admin account**:
   - Email: your-email@example.com
   - Password: Choose a strong password
   - Click "Sign Up"

### 1.2 Give Yourself Admin Rights
1. Click the button below to open your backend:

<lov-actions>
<lov-open-backend>Open Backend Dashboard</lov-open-backend>
</lov-actions>

2. In the backend, go to **Table Editor** → **user_roles**
3. Click **"Insert Row"** and add:
   - **user_id**: Copy your user ID from the **auth.users** table
   - **role**: Select **"admin"** from dropdown
   - Click **Save**

4. **Refresh your app** - You're now an admin! 🎉

---

## ✅ **STEP 2: Generate Activation Codes** (3 minutes)

### 2.1 Access Admin Panel
1. Go back to `/admin` route in your app
2. You should now see the **Admin Code Generator**

### 2.2 Generate Codes
1. **For Testing** - Generate a 5-day trial code:
   - Duration: Select "5 Days (Trial)"
   - Click "Generate Code"
   - Copy the code shown (format: PARK-XXXX-XXXX-XXXX)

2. **For Customers** - Generate paid subscription codes:
   - 30 Days (1 Month): $10
   - 60 Days (2 Months): $18
   - 90 Days (3 Months): $25
   - 180 Days (6 Months): $45
   - 365 Days (1 Year): $80

3. **Save Your Codes**:
   - Click "Copy All Codes" to copy to clipboard
   - Click "Export CSV" to download as spreadsheet
   - Keep these codes safe - they're like gift cards!

---

## ✅ **STEP 3: Test the App** (10 minutes)

### 3.1 Go to Main App
1. Navigate to the home page (remove `/admin` from URL)
2. You'll see 5 tabs: Vehicles, Villas, SMS, Automation, Activate

### 3.2 Activate Your First Villa
1. Click the **"Activate" tab** (Crown icon)
2. Click **"+ Add Villa"**
3. Enter your activation code (from Step 2.1)
4. Click **"Activate Villa"**
5. You'll see: ✅ "Subscription activated successfully!"

### 3.3 Add a Villa
1. Click the **"Villas" tab** (Home icon)
2. Click **"+ Add Villa"**
3. Enter:
   - Villa Name: "Villa 1" or "Building A"
   - SMS Number: "3009" (default parking SMS number)
4. Click **"Add"**

### 3.4 Add Vehicles
1. Click the **"Vehicles" tab** (Car icon)
2. Click **"+ Add Vehicle"**
3. Select your villa from dropdown
4. Enter plate number (e.g., "ABC 1234")
5. Select vehicle type
6. Click **"Add Vehicle"**

### 3.5 Test SMS (Browser Only - No Actual SMS)
1. Click the **"SMS" tab**
2. Select vehicles to send SMS
3. Click **"Send SMS"**
4. ⚠️ **Note**: SMS will only work on a physical Android device

### 3.6 Setup Automation
1. Click the **"Automation" tab** (Clock icon)
2. Select a villa
3. Toggle "Enable Automation"
4. Set a time (e.g., 08:00 AM)
5. ⚠️ **Note**: Auto-send only works on Android device

---

## ✅ **STEP 4: What Works Where**

### 🌐 **In Browser (Current Preview)**
✅ Add/Edit villas
✅ Add/Edit vehicles  
✅ Activate subscriptions
✅ Generate admin codes
✅ Setup automation schedules
✅ View all data
❌ **Cannot send actual SMS** (requires Android)
❌ **Cannot auto-send SMS** (requires Android)

### 📱 **On Android Device (After Building APK)**
✅ Everything above PLUS:
✅ **Send real SMS messages**
✅ **Auto-send SMS at scheduled times**
✅ Runs offline (no internet needed)

---

## ✅ **STEP 5: Build Android App** (30-60 minutes)

### Option A: Quick Test (No Build Required)
- Use current browser preview to test all features except SMS
- Perfect for learning the app
- **You're already doing this!**

### Option B: Full Android Build

#### Required Software:
1. **Node.js** - Download from [nodejs.org](https://nodejs.org)
2. **Git** - Download from [git-scm.com](https://git-scm.com)
3. **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)

#### Build Steps:
```bash
# 1. Export to GitHub (Use "Export to GitHub" button in Lovable)

# 2. Clone your repo
git clone [your-repo-url]
cd parkmate-auto-sms

# 3. Install dependencies
npm install

# 4. Build web app
npm run build

# 5. Add Android platform
npx cap add android
npx cap sync android

# 6. Open in Android Studio
npx cap open android

# 7. Wait for Gradle sync to complete

# 8. Connect your Android phone via USB (Enable USB Debugging in Developer Options)

# 9. Click the green "Run" button in Android Studio
```

**📺 Detailed Video Guide**: See `BEGINNER_GUIDE.md` for step-by-step screenshots

---

## ✅ **STEP 6: Sell Subscriptions** 💰

### Your Business Model:

1. **Get Customers**:
   - WhatsApp: Share app info
   - Social Media: Facebook, Instagram
   - Word of mouth

2. **Receive Payment**:
   - WhatsApp Pay
   - Bank Transfer
   - Cash

3. **Send Activation Code**:
   - Generate code in admin panel
   - Send via WhatsApp/SMS
   - Customer activates in app

4. **Pricing Suggestion**:
   - Trial (5 days): FREE
   - 1 Month: $10
   - 3 Months: $25 (save $5)
   - 6 Months: $45 (save $15)
   - 1 Year: $80 (save $40)

---

## ✅ **STEP 7: Customer Instructions**

**Share these steps with your customers:**

1. Install ParkMate Auto SMS APK on Android phone
2. Open app
3. Go to "Activate" tab (Crown icon)
4. Click "+ Add Villa"
5. Enter activation code received from you
6. Click "Activate Villa"
7. Go to "Villas" tab and add your villa details
8. Go to "Vehicles" tab and add vehicles
9. Use "SMS" tab to send parking messages
10. Use "Automation" tab for auto-send

---

## ✅ **STEP 8: Support & Troubleshooting**

### Common Issues:

**❓ "No subscription" message appears**
- Check subscription expiry date in "Activate" tab
- Use a new activation code if expired

**❓ Cannot add vehicles**
- Make sure villa has active subscription
- Check expiry date

**❓ SMS not sending**
- App must be installed on Android device
- Grant SMS permissions when prompted
- Emulators cannot send SMS

**❓ Automation not working**
- Must be Android device
- Keep app installed (can be in background)
- Ensure phone has network connection

**❓ Activation code not working**
- Check code hasn't been used already
- Verify code format: PARK-XXXX-XXXX-XXXX
- Generate new code if needed

---

## ✅ **STEP 9: Track Your Business**

### View Generated Codes:
1. Go to `/admin` route
2. See all codes in "Generated Codes" section
3. See which codes are used/unused
4. Track expiry dates

### Export Reports:
1. Click "Export CSV" to download all codes
2. Open in Excel/Google Sheets
3. Track:
   - Total codes generated
   - Codes used vs unused
   - Revenue by duration
   - Customer retention

---

## 🎉 **YOU'RE ALL SET!**

### Quick Recap:
1. ✅ Admin account created
2. ✅ Admin role assigned  
3. ✅ Activation codes generated
4. ✅ Test villa activated
5. ✅ Vehicles added
6. ✅ Features tested

### Next Steps:
- 📱 Build Android APK (for SMS features)
- 💰 Start selling subscriptions
- 📊 Track your business growth

---

## 📚 **Additional Resources**

- **Detailed Build Guide**: See `BUILD_INSTRUCTIONS.md`
- **Beginner Tutorial**: See `BEGINNER_GUIDE.md`  
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Admin Setup**: See `ADMIN_SETUP_GUIDE.md`

---

## 🆘 **Need Help?**

If you're stuck:
1. Read the error message carefully
2. Check the relevant guide above
3. Make sure you completed all previous steps
4. Try refreshing the app
5. Check your subscription expiry date

---

**Last Updated**: January 2025
**App Version**: 2.0 - Multi-Villa Edition
