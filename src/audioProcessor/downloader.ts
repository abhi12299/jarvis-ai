import ffbinaries, { Platform } from "ffbinaries";
import FfmpegBase from "./base";

class FfmpegDownloader extends FfmpegBase {
  constructor(binariesPath?: string) {
    super(binariesPath);
  }

  async downloadBinaries(platform?: Platform) {
    if (await this.binariesExist()) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      ffbinaries.downloadBinaries(
        ["ffmpeg", "ffprobe"],
        {
          destination: this.binariesPath,
          platform,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`FFmpeg binaries downloaded to ${this.binariesPath}`);
            resolve();
          }
        }
      );
    });
  }
}

export default FfmpegDownloader;
