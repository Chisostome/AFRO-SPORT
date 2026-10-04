import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.chisostome.afrosport",
  appName: "AFRO SPORT",
  webDir: "docs",
  ios: {
    scheme: "App",
    buildOptions: {
      signingStyle: "automatic",
      exportMethod: "app-store-connect"
    }
  }
};

export default config;
