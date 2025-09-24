# ParkMate Auto SMS - Android Build Instructions

## Prerequisites
- Android Studio installed
- Node.js and npm installed
- Physical Android device or emulator

## Step 1: Export and Setup Project

1. **Export to GitHub**: Click the "Export to GitHub" button in Lovable
2. **Clone locally**: `git clone [your-repo-url]`
3. **Install dependencies**: `npm install`
4. **Build the web app**: `npm run build`

## Step 2: Add Android Platform

```bash
npx cap add android
npx cap sync android
```

## Step 3: Configure Android Studio

1. **Open in Android Studio**: `npx cap open android`
2. **Wait for Gradle sync** to complete
3. **Check SDK versions** in `build.gradle` files match your Android Studio setup

## Step 4: Generate Release Keystore (for production)

```bash
keytool -genkey -v -keystore parkmate-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias parkmate-key
```

Save the keystore file and remember the passwords!

## Step 5: Configure Signing (for production)

Add to `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            keyAlias 'parkmate-key'
            keyPassword 'your-key-password'
            storeFile file('../../parkmate-release-key.keystore')
            storePassword 'your-store-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Step 6: Build APK

### For Testing (Debug):
```bash
npx cap run android --target=device
```

### For Production (Release):
```bash
cd android
./gradlew assembleRelease
```

The APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

## Step 7: Test Features

1. **SMS Permissions**: App will request SMS permissions on first SMS send
2. **Free Trial**: Test 3-day trial system
3. **Activation Codes**: Test manual activation
4. **Automation**: Test scheduled SMS sending
5. **Villa Management**: Test multi-villa support

## Step 8: Generate Activation Codes

Use the admin utility in the app or generate manually:

```javascript
// In browser console or admin panel
import { SubscriptionManager } from './src/utils/subscription';

// Generate 30-day code
const code = SubscriptionManager.generateActivationCode(30);
console.log('30-day code:', code);

// Generate 60-day code  
const code2 = SubscriptionManager.generateActivationCode(60);
console.log('60-day code:', code2);

// Generate 90-day code
const code3 = SubscriptionManager.generateActivationCode(90);
console.log('90-day code:', code3);
```

## Troubleshooting

### SMS Not Sending
- Ensure SMS permissions are granted
- Test on physical device (emulators may not support SMS)
- Check `AndroidManifest.xml` has SMS permissions

### App Crashes
- Check Android Studio Logcat for errors
- Ensure all native dependencies are synced: `npx cap sync android`

### Build Errors
- Clean and rebuild: `./gradlew clean && ./gradlew assembleRelease`
- Update Capacitor: `npx cap update android`

## Production Distribution

1. **Direct APK**: Share the signed APK file directly
2. **Internal Testing**: Use Google Play Console internal testing
3. **Manual Activation**: Provide activation codes after payment via WhatsApp/SMS

## Business Model Setup

1. **Pricing**: Set your rates (e.g., $10/month, $25/3months)
2. **Code Generation**: Use admin utility to generate codes
3. **Distribution**: Send codes via WhatsApp after payment
4. **Support**: Guide users through installation and activation

The app is now ready for Android deployment with manual payment and activation code system!