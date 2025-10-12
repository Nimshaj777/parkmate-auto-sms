# 📋 PHASE 2: Admin Portal Setup - Detailed Guide

**Time Required:** 20-30 minutes  
**Difficulty:** Beginner-friendly  
**Goal:** Create admin account and generate your first activation codes

---

## 🎯 What You'll Accomplish

By the end of Phase 2, you will:
- ✅ Have a working admin account
- ✅ Access the secure admin portal
- ✅ Generate activation codes
- ✅ Understand the code distribution workflow

---

## 📍 Step-by-Step Instructions

### **STEP 1: Access Your Backend Dashboard** ⚡

1. **In Lovable (where you are now):**
   - Look at the **top navigation bar**
   - Find and click the **"Backend"** button (next to "Publish")
   
2. **Backend Opens in New Tab:**
   - You'll see your **Lovable Cloud** dashboard
   - This is your database where all data is stored
   - Left sidebar shows your database tables

3. **What You're Looking At:**
   - This is like the "control panel" of your app
   - All user data, subscriptions, and codes live here
   - You have full control - be careful with changes!

---

### **STEP 2: Create Your First Admin User** 👤

Since there's no signup form in the main app yet, we'll create your admin account directly in the database.

#### **Option A: SQL Editor Method (Recommended - Easier)**

1. **In Backend Dashboard:**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

2. **Copy This Exact SQL Code:**
   ```sql
   -- Create admin user with email and password
   -- Replace 'your-email@example.com' and 'your-secure-password'
   
   INSERT INTO auth.users (
     id,
     email,
     encrypted_password,
     email_confirmed_at,
     raw_app_meta_data,
     raw_user_meta_data,
     created_at,
     updated_at,
     confirmation_token,
     email_change,
     email_change_token_new,
     recovery_token
   )
   SELECT
     gen_random_uuid(),
     'your-email@example.com',  -- ⚠️ CHANGE THIS to your email
     crypt('your-secure-password', gen_salt('bf')),  -- ⚠️ CHANGE THIS to your password
     now(),
     '{"provider":"email","providers":["email"]}',
     '{}',
     now(),
     now(),
     '',
     '',
     '',
     ''
   WHERE NOT EXISTS (
     SELECT 1 FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```

3. **⚠️ IMPORTANT - Edit These Two Lines:**
   - Line with `'your-email@example.com'` → Change to YOUR email
   - Line with `'your-secure-password'` → Change to YOUR password
   
   **Example:**
   ```sql
   'admin@parkmate.com',  -- Your email
   crypt('MySecure123!', gen_salt('bf')),  -- Your password
   ```

4. **Run the Query:**
   - Click **"Run"** button (or press F5)
   - You should see: **"Success. No rows returned"**
   - This means your user was created!

5. **Verify User Created:**
   - In left sidebar, navigate to **Authentication → Users**
   - You should see your email address listed
   - **Copy the User ID (UUID)** - you'll need it next!
   - It looks like: `550e8400-e29b-41d4-a716-446655440000`

#### **Option B: Manual Method (If SQL Doesn't Work)**

If the SQL method gives errors, we'll use Lovable AI to add a signup form:

1. **Come back to Lovable Chat**
2. **Type this message:**
   ```
   Add a simple signup form to the main app so I can create my admin account
   ```
3. **Wait for me to add it**
4. **Use the signup form to create your account**
5. **Continue to Step 3 below**

---

### **STEP 3: Assign Admin Role** 👑

Now that you have a user account, let's make it an admin account.

1. **In Backend Dashboard:**
   - Find **`user_roles`** table in left sidebar
   - Click on it to open

2. **What You See:**
   - Probably empty (no rows)
   - Columns: `id`, `user_id`, `role`, `created_at`

3. **Click "Insert Row" Button:**
   - Usually at the top or bottom of the table
   - A form will appear

4. **Fill in the Form:**
   
   | Field | What to Enter |
   |-------|---------------|
   | `id` | Leave empty (auto-generated) |
   | `user_id` | Paste the UUID you copied from Step 2 |
   | `role` | Select **"admin"** from dropdown |
   | `created_at` | Leave as default (current time) |

5. **Click "Save" or "Insert"**

6. **Verify:**
   - You should see the new row appear
   - It should show your user_id with role = "admin"
   - ✅ Success! You're now an admin!

---

### **STEP 4: Access Admin Portal** 🔐

Time to login to your admin portal!

1. **Get Your Admin Portal URL:**
   
   Your admin portal is at: `your-app-url/admin`
   
   **Find Your URL:**
   - In Lovable, look at the preview window (right side)
   - The URL is shown at the top of the preview
   - It looks like: `https://7545009a-e966-4934-a588-347c6be943fd.lovableproject.com`
   
   **Your Admin Portal URL:**
   ```
   https://7545009a-e966-4934-a588-347c6be943fd.lovableproject.com/admin
   ```

2. **Open Admin Portal:**
   - Copy the URL above
   - Open a **new browser tab**
   - Paste the URL and press Enter
   
   **⚠️ Important:** Use the same browser where you're viewing Lovable!

3. **You Should See:**
   - A login page with:
     - 👑 Crown icon
     - "Admin Login" heading
     - Email and Password fields
     - Blue "Login" button

4. **Login:**
   - **Email:** Enter the email you used in Step 2
   - **Password:** Enter the password you used in Step 2
   - Click **"Login"** button

5. **If Login Successful:**
   - You'll see the **Admin Dashboard**
   - Header shows: "Admin Dashboard" with crown icon
   - You'll see code generation controls
   - ✅ You're in!

6. **If You See "Access Denied":**
   - Go back to Step 3
   - Verify the `user_id` in `user_roles` matches your user
   - Verify `role` is set to "admin" (not "user" or "moderator")
   - Try logging out and back in

---

### **STEP 5: Understand the Admin Dashboard** 📊

Let's tour your new admin portal!

#### **A) Header Section**
- **Crown icon** + "Admin Dashboard" title
- **Logout button** on the right (click to logout)

#### **B) Statistics Cards** (Top Row)
Three cards showing:

1. **Total Codes** 📊
   - All activation codes ever generated
   - Currently shows: 0

2. **Used Codes** ✅
   - Codes that customers have activated
   - Currently shows: 0

3. **Available Codes** ⚡
   - Unused codes ready to sell
   - Currently shows: 0

#### **C) Quick Generate Section** ⚡
Four preset buttons for common scenarios:

| Button | What It Does |
|--------|--------------|
| **Generate 10 Trial Codes** | Creates 10 codes for 5-day free trials |
| **Generate 10 Monthly Codes** | Creates 10 codes for 30-day subscriptions |
| **Generate 5 Quarterly Codes** | Creates 5 codes for 90-day subscriptions |
| **Generate 5 Yearly Codes** | Creates 5 codes for 365-day subscriptions |

**These are ONE-CLICK!** Just click the button and codes generate automatically.

#### **D) Custom Code Generation**
For specific needs:

- **Code Type & Duration** dropdown:
  - Trial (5 days) - marked with "Trial" badge
  - 30 Days (1 Month)
  - 60 Days (2 Months)
  - 90 Days (3 Months)
  - 180 Days (6 Months)
  - 365 Days (1 Year)

- **Quantity** field:
  - Enter 1-100 (how many codes to generate)

- **Generate Codes** button:
  - Click to create the codes

#### **E) Generated Codes List** (Appears After Generation)
Shows all codes you've generated:

- **Code** in large monospace font (e.g., PK123456AB)
- **Duration badge** (e.g., "30 days" or "Trial - 5 days")
- **Timestamp** when generated
- **Copy button** (📋) to copy individual code
- **Copy All** button at top to copy all codes at once
- **Export CSV** button to download as spreadsheet

---

### **STEP 6: Generate Your First Test Codes** 🎉

Let's practice generating codes!

#### **Quick Generate Method (Recommended for First Time):**

1. **Click "Generate 10 Trial Codes"**
   - This creates 10 free trial codes (5 days each)
   - Wait 2-3 seconds
   - You'll see a success toast notification

2. **View Generated Codes:**
   - Scroll down
   - You'll see "Generated Codes (10)" section appear
   - All 10 codes are listed

3. **Each Code Shows:**
   ```
   PK123456AB          [📋 Copy button]
   Trial - 5 days  •  11/15/2024, 10:30:42 AM
   ```

4. **Try Copying a Code:**
   - Click the 📋 copy button on any code
   - You'll see "Copied!" notification
   - Code is now in your clipboard
   - You could paste it into WhatsApp to send to a customer

#### **Custom Generate Method:**

Let's try generating monthly codes:

1. **In Custom Code Generation Section:**
   - **Duration:** Select "30 Days (1 Month)"
   - **Quantity:** Enter `5`
   - Click **"Generate Codes"** button

2. **Wait for Success:**
   - Button shows "Generating..." briefly
   - Toast notification: "Codes Generated Successfully!"
   - New codes appear in the list

3. **Your List Now Shows:**
   - 10 trial codes (from before)
   - 5 monthly codes (just generated)
   - **Total: 15 codes**

---

### **STEP 7: Practice Code Management** 📑

Now let's learn to manage your codes.

#### **A) Copy Individual Code:**

1. Find any code in your list
2. Click its 📋 **Copy** button
3. Open Notepad or any text editor
4. Press `Ctrl+V` to paste
5. ✅ The code should paste as: `PK123456AB`

#### **B) Copy All Codes:**

1. At the top of the generated codes section
2. Click **"Copy All"** button
3. Open Notepad
4. Press `Ctrl+V` to paste
5. ✅ All codes paste, one per line:
   ```
   PK123456AB
   PK234567CD
   PK345678EF
   ...
   ```

#### **C) Export to CSV:**

1. Click **"Export CSV"** button
2. A file downloads: `activation-codes-2024-11-15.csv`
3. Open it in Excel or Google Sheets
4. You'll see a table with columns:
   - Code
   - Duration (days)
   - Generated At

5. **Why This is Useful:**
   - Keep permanent records
   - Track which codes you've sold
   - Share with accountant for business tracking

---

### **STEP 8: Verify Codes in Backend** ✅

Let's confirm the codes are stored in your database.

1. **Go Back to Backend Dashboard**
   - Switch to the backend browser tab
   - Or open it again from Lovable

2. **Navigate to `activation_codes` Table:**
   - Find it in left sidebar under "Tables"
   - Click to open

3. **You Should See:**
   - All the codes you generated
   - Each row is one code
   
4. **Important Columns:**
   
   | Column | What It Means |
   |--------|---------------|
   | `code` | The actual code (PK123456AB) |
   | `duration` | How many days it's valid for |
   | `villa_count` | How many villas (always 1) |
   | `is_used` | false = available, true = activated |
   | `created_by` | Your admin user_id |
   | `used_by_device_id` | null until customer activates |
   | `created_at` | When you generated it |
   | `used_at` | null until customer uses it |

5. **Try This:**
   - Find a code with `is_used = false`
   - **Copy the code value**
   - We'll test it in the next step!

---

### **STEP 9: Test Code Activation** 🧪

Let's test that your codes actually work in the main app!

1. **Open Main App:**
   - In Lovable, look at the preview window (right side)
   - Or open your app URL in new tab

2. **Open Villa Manager:**
   - Click the **villa/building icon** (top left corner)
   - Sheet slides up from bottom

3. **Go to Activate Tab:**
   - Click **"Activate"** tab (second tab)
   - You'll see:
     - "Villa Subscription" heading
     - "Activate a Villa" text
     - Input field for code
     - "Activate" button

4. **Enter Your Test Code:**
   - Paste the code you copied from backend
   - Example: `PK123456AB`
   - Click **"Activate"** button

5. **What Should Happen:**
   
   **✅ Success Case:**
   - Toast notification: "Villa activated successfully!"
   - The code is now activated
   - Go back to backend → `activation_codes` table
   - That code's `is_used` should now be `true`

   **❌ Error Cases:**
   
   - **"Invalid activation code"**
     - Code doesn't exist in database
     - Check spelling - codes are case-insensitive but must match
   
   - **"Code already used"**
     - This code was already activated
     - Try a different code
   
   - **"Network error"**
     - Internet connection issue
     - Refresh page and try again

6. **Verify in Backend:**
   - Refresh the `activation_codes` table
   - Find your test code
   - Check: `is_used` should be `true`
   - Check: `used_by_device_id` should have a value
   - Check: `used_at` should show current timestamp
   - ✅ Success! Your code system works!

---

### **STEP 10: Check Statistics Update** 📈

Let's verify the admin dashboard statistics updated.

1. **Go Back to Admin Portal Tab**
2. **Refresh the page** (F5 or Ctrl+R)
3. **Look at Statistics Cards:**
   
   They should now show:
   - **Total Codes:** 15 (or however many you generated)
   - **Used Codes:** 1 (the one you just activated)
   - **Available Codes:** 14 (remaining unused)

4. ✅ Statistics are working!

---

## 🎯 Phase 2 Complete Checklist

Before moving to Phase 3, verify you've done ALL of these:

### Account Setup
- [ ] Created admin user account (email + password)
- [ ] Assigned admin role in `user_roles` table
- [ ] Successfully logged into admin portal
- [ ] No "Access Denied" errors

### Code Generation
- [ ] Generated trial codes using quick preset
- [ ] Generated custom codes with specific duration
- [ ] Codes appear in the generated codes list
- [ ] Statistics cards show correct numbers

### Code Management
- [ ] Copied individual code to clipboard
- [ ] Copied all codes at once
- [ ] Downloaded CSV export file
- [ ] Opened and verified CSV in Excel/Sheets

### Verification
- [ ] Verified codes exist in backend `activation_codes` table
- [ ] Tested code activation in main app
- [ ] Confirmed code marked as `is_used = true` after activation
- [ ] Statistics updated after code usage

### Understanding
- [ ] Understand how to access admin portal (direct URL only)
- [ ] Know the code format: PK######XX
- [ ] Know which durations are available (5, 30, 60, 90, 180, 365 days)
- [ ] Understand the sales workflow (generate → send → customer activates)

---

## 🎓 Key Learnings from Phase 2

### What You've Mastered:

1. **Admin Access Control**
   - Admin portal is hidden (no button in main app)
   - Only accessible via direct URL: `/admin`
   - Requires both authentication AND admin role
   - Server-side security (can't be bypassed)

2. **Code Generation System**
   - Quick presets for common scenarios
   - Custom generation for specific needs
   - Unique codes that never repeat
   - Format: PK + 6 numbers + 2 letters

3. **Code Lifecycle**
   - **Generated:** Created in admin portal, stored in database
   - **Distributed:** Sent to customer via WhatsApp/SMS/email
   - **Activated:** Customer enters in app, villa unlocked
   - **Used:** Marked in database, statistics updated

4. **Security Model**
   - Each code works only once
   - Each code activates ONE villa only
   - Each villa can have up to 20 vehicles
   - Customers can activate multiple villas with separate codes

---

## 💼 Business Workflow (Now That You're Set Up)

### Daily Operations:

1. **Morning:**
   - Login to admin portal
   - Check statistics (how many codes used yesterday)
   - Generate codes for the day if needed

2. **When Customer Contacts You:**
   - Customer: "I want monthly subscription for 1 villa"
   - You: "Payment is PKR 500, please send via bank transfer"
   - Customer sends payment
   - You: Generate 1 monthly code (30 days)
   - You: Send code via WhatsApp
   - Customer: Activates in app
   - ✅ Transaction complete!

3. **End of Day:**
   - Export CSV of all codes
   - Track revenue (codes sold × price)
   - Plan next day's code inventory

### Record Keeping:

**Weekly:**
- Export CSV every Monday
- File with naming: `codes-week-of-[date].csv`
- Track which codes were sold vs. unsold

**Monthly:**
- Review total sales
- Count active subscriptions
- Plan pricing adjustments
- Contact customers whose subscriptions expire soon

---

## 🚀 Next Steps

### You're Now Ready For:

**Phase 3: Build Android App**
- Download your code to computer
- Install development tools
- Build APK file
- Test on your phone
- Distribute to customers

**OR Start Testing Further:**
- Generate codes for different durations
- Test trial system (5-day codes)
- Practice customer support scenarios
- Try the automation features

---

## ❓ Common Questions After Phase 2

### Q: Can I change the code format?
**A:** Yes! The format is defined in the edge function. Currently: PK + 6 numbers + 2 letters. We can customize this if you want.

### Q: How do I delete unused codes?
**A:** Go to backend → `activation_codes` table → Find the code → Click delete icon. But generally not needed - just don't distribute them.

### Q: Can I see which customer activated which code?
**A:** Yes! In backend, check the `activation_codes` table → `used_by_device_id` column shows which device activated it.

### Q: What if a customer loses their activation?
**A:** Once activated, the villa subscription is tied to their device. They don't need the code again. It's stored in the `user_subscriptions` and `villa_subscriptions` tables.

### Q: Can I give refunds?
**A:** Yes, but manually. You'd need to:
1. Find their activation in `villa_subscriptions` table
2. Delete the record (or mark inactive)
3. Mark the code as unused in `activation_codes` table
4. Customer can then use the code again

### Q: How do I track expiring subscriptions?
**A:** In backend → `villa_subscriptions` table → Check `expires_at` column → Filter for dates in the next 7 days → Contact those customers!

---

## 🆘 Troubleshooting Phase 2

### Problem: "Can't find Backend button"
**Solution:** 
- Look at the very top of Lovable interface
- It's next to "GitHub" and "Publish" buttons
- Should say "Backend" with a database icon

### Problem: "SQL query gives error"
**Solution:**
- Come back to Lovable chat
- Say: "Add signup form to main app"
- I'll add it so you can sign up normally

### Problem: "Can't see user_roles table"
**Solution:**
- In backend left sidebar, scroll down
- Look under "public" schema
- Table might be collapsed - click to expand
- If truly missing, tell me - we'll create it

### Problem: "Admin portal shows blank page"
**Solution:**
- Check browser console (F12) for errors
- Try hard refresh (Ctrl+Shift+R)
- Try different browser (Chrome recommended)
- Clear browser cache and cookies

### Problem: "Generated codes don't appear in backend"
**Solution:**
- Refresh the page (F5)
- Check you're looking at `activation_codes` table (not another table)
- Check the timestamp - sort by `created_at` descending
- If still missing, try generating again

### Problem: "Session expired after 30 minutes"
**Solution:**
- This is a security feature (normal!)
- Just login again
- Your codes are saved - they won't disappear

---

## ✅ Phase 2 Success Indicators

You've SUCCESSFULLY completed Phase 2 if:

✅ You can login to admin portal without errors  
✅ You generated at least 10 test codes  
✅ You successfully activated at least 1 code in the main app  
✅ Statistics dashboard shows correct numbers  
✅ You exported a CSV file with codes  
✅ You verified codes appear in backend database  
✅ You understand the sales workflow  
✅ You know where everything is stored  

---

## 🎉 Congratulations!

You've completed Phase 2! You now have:
- ✅ Working admin account
- ✅ Secure admin portal access
- ✅ Understanding of code generation
- ✅ Tested activation system
- ✅ Ready to start selling (after Phase 3)

**Ready for Phase 3?** 
Tell me in Lovable chat: "Start Phase 3" and I'll guide you through building the Android app!

**Want to practice more?**
Try these exercises:
- Generate 50 codes of different durations
- Practice the full sales workflow
- Set up your pricing structure
- Draft customer communication templates

---

**Questions about Phase 2?** Ask me in Lovable chat! 😊
