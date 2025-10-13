# ⚡ Quick Start - Android Build (15-minute version)

> **For complete beginners**: Use the [MOBILE_DEPLOYMENT_GUIDE.md](MOBILE_DEPLOYMENT_GUIDE.md) instead.
> This is for users with some technical experience.

## Prerequisites Installed?
- ✅ Node.js (v18+)
- ✅ Git
- ✅ Android Studio
- ✅ Physical Android device with USB debugging enabled

---

## 🚀 Build in 5 Steps

### 1️⃣ Clone & Install (3 min)
```bash
# Export to GitHub from Lovable first!
git clone [YOUR-GITHUB-URL]
cd parkmate-auto-sms
npm install
```

### 2️⃣ Add Android Platform (2 min)
```bash
npx cap add android
npm run build
npx cap sync android
```

### 3️⃣ Open in Android Studio (5 min)
```bash
npx cap open android
```
Wait for Gradle sync to finish.

### 4️⃣ Test on Device (3 min)
1. Connect phone via USB
2. Select device in Android Studio dropdown
3. Click green play button ▶️
4. Test app features

### 5️⃣ Build Release APK (2 min)
```bash
# Generate signing key (one-time)
keytool -genkey -v -keystore parkmate-release.keystore -alias parkmate -keyalg RSA -keysize 2048 -validity 10000

# Build APK
cd android
./gradlew assembleRelease
```

**APK Location:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Distribution

1. Copy APK file
2. Upload to your website/cloud storage
3. Share link with customers
4. Customers install via "Install from unknown sources"

---

## 🔄 Update Workflow

```bash
git pull origin main
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

---

## 💰 Generate Activation Codes

1. Open: `https://[your-app-url]/admin`
2. Sign up as admin
3. Use "Admin Code Generator"
4. Send codes to customers after payment

---

## 🆘 Quick Fixes

| Issue | Fix |
|-------|-----|
| Phone not detected | Disable/enable USB debugging |
| Gradle fails | File → Invalidate Caches → Restart |
| SMS not working | Check permissions + real device |
| Code doesn't work | Check admin panel + RLS policies |

---

## 📚 Full Guide

For detailed step-by-step instructions with screenshots:
👉 **[MOBILE_DEPLOYMENT_GUIDE.md](MOBILE_DEPLOYMENT_GUIDE.md)**

---

**Ready to go live? Follow these 5 steps and you're done! 🎉**
