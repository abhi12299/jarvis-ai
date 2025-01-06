import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
// import { signAsync } from "@electron/osx-sign";
// import path from "path";

const config: ForgeConfig = {
  packagerConfig: {
    extraResource: ["lib/whisper.cpp/build", "models", "lib/ffmpeg"],
    darwinDarkModeSupport: true,
    icon: "./assets/icon.icns",
    osxSign: {
      identity: "Developer ID Application: Abhishek Mehandiratta",
      optionsForFile: () => {
        return {
          entitlements: "entitlements.plist",
          hardenedRuntime: true,
        };
      },
    },
    // afterComplete: [
    //   async (buildPath) => {
    //     await signAsync({
    //       app: path.join(buildPath, "jarvis.app"),
    //       identity: "Developer ID Application: Abhishek Mehandiratta",
    //       optionsForFile: () => {
    //         const entitlements = "entitlements.plist";

    //         // const isBin =
    //         //   filePath.includes("/Resources/build") ||
    //         //   filePath.includes("/Resources/models") ||
    //         //   filePath.includes("/Resources/ffmpeg");
    //         // if (isBin) {
    //         //   entitlements = "entitlements-bins.plist";
    //         // }
    //         // console.log("filePath", filePath, "isBin", isBin);

    //         return {
    //           hardenedRuntime: true,
    //           entitlements,
    //         };
    //       },
    //     });
    //   },
    // ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
