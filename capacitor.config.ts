import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.candymath.app',
  appName: 'Candy Math',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
