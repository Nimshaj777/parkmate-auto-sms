import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7545009ae9664934a588347c6be943fd',
  appName: 'Parking SMS - Automated Parking SMS App',
  webDir: 'dist',
  server: {
    url: 'https://7545009a-e966-4934-a588-347c6be943fd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#3B82F6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;