import path from "path";
import fs from "fs/promises";
import { promisify } from "util";
import { exec } from "child_process";

import { pathExists } from "../lib/pathExists";
import FfmpegBase from "./base";

const execAsync = promisify(exec);

class AudioProcessor extends FfmpegBase {
  async saveToFile(arrayBuffer: ArrayBuffer, filename: string) {
    const tmpDirExists = await pathExists(this.tmpDir);
    if (!tmpDirExists) {
      await fs.mkdir(this.tmpDir, { recursive: true });
    }

    const filePath = path.join(this.tmpDir, filename);
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    return filePath;
  }

  async getAudioFormat(filePath: string): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `"${this.ffprobePath}" -v quiet -print_format json -show_format "${filePath}"`
      );
      const formatInfo = JSON.parse(stdout);
      return formatInfo.format.format_name.split(",")[0]; // Get first format if multiple are returned
    } catch (error) {
      throw new Error(`Failed to get audio format: ${error.message}`);
    }
  }

  async convertToWav(inputPath: string): Promise<string> {
    try {
      const inputFormat = await this.getAudioFormat(inputPath);

      // If already WAV, return the input path
      if (inputFormat.toLowerCase() === "wav") {
        return inputPath;
      }

      // Create output path by replacing the extension with .wav
      const outputPath = inputPath.replace(/\.[^/.]+$/, "") + ".wav";

      // Convert to WAV using ffmpeg
      await execAsync(
        `"${this.ffmpegPath}" -y -i "${inputPath}" -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}"`
      );

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to convert audio to WAV: ${error.message}`);
    }
  }
}

export default AudioProcessor;
