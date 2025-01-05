import path from "path";
import { FfmpegDownloader } from "../audioProcessor";

async function downloadFfmpeg() {
  try {
    const binPath = path.join(__dirname, "../../lib/ffmpeg/");
    const ffmpeg = new FfmpegDownloader(binPath);

    console.log("Downloading FFmpeg binaries for packaging...");
    // TODO: add platform
    await ffmpeg.downloadBinaries();
    console.log("FFmpeg binaries downloaded successfully");
  } catch (error) {
    console.error("Error downloading FFmpeg binaries:", error);
    process.exit(1);
  }
}

downloadFfmpeg();
