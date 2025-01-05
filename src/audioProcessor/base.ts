import path from "path";
import os from "os";

import { pathExists } from "../lib/pathExists";

class FfmpegBase {
  private _binariesPath: string;
  private _tmpDir: string;

  constructor(binariesPath?: string) {
    this._binariesPath =
      binariesPath ||
      (process.env.NODE_ENV === "development"
        ? path.join(__dirname, "../../lib/ffmpeg")
        : path.join(process.resourcesPath, "ffmpeg"));

    this._tmpDir = os.tmpdir();
  }

  async binariesExist() {
    const isWindows = process.platform === "win32";
    const extension = isWindows ? ".exe" : "";

    const ffmpegPath = path.join(this._binariesPath, `ffmpeg${extension}`);
    const ffprobePath = path.join(this._binariesPath, `ffprobe${extension}`);

    try {
      const res = await Promise.all([
        pathExists(ffmpegPath),
        pathExists(ffprobePath),
      ]);
      return res.every((exists) => exists);
    } catch (error) {
      return false;
    }
  }

  get ffmpegPath() {
    const isWindows = process.platform === "win32";
    const extension = isWindows ? ".exe" : "";
    return path.join(this._binariesPath, `ffmpeg${extension}`);
  }

  get ffprobePath() {
    const isWindows = process.platform === "win32";
    const extension = isWindows ? ".exe" : "";
    return path.join(this._binariesPath, `ffprobe${extension}`);
  }

  get tmpDir() {
    return this._tmpDir;
  }

  get binariesPath() {
    return this._binariesPath;
  }
}

export default FfmpegBase;
