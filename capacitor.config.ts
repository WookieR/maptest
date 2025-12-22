import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'maptest',
  webDir: 'www',
  plugins: {
    // BackgroundRunner: {
    //   label: "com.taionner.background.location",
    //   src: "runners/location-runner.js",
    //   event: "runGeolocationCheck",
    //   repeat: true,
    //   interval: 1,
    //   autoStart: true,
    // }
  }
};
export default config;
