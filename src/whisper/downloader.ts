import fs from "fs";
import axios from "axios";

import { WhisperModel } from "./models";
import { pathExists } from "../lib/pathExists";
import WhisperBase from "./base";

interface DownloadProgress {
  progress: number;
  downloaded: number;
  total: number;
}

class WhisperModelDownloader extends WhisperBase {
  constructor(
    model: WhisperModel,
    modelsDir?: string,
    whisperAddonPath?: string
  ) {
    super(model, modelsDir, whisperAddonPath);
  }

  async download(progressCallback?: (progress: DownloadProgress) => void) {
    console.log("Downloading model", this.model, "to", this.modelPath);
    await this.init();

    const modelExists = await pathExists(this.modelPath);
    if (modelExists) {
      return;
    }

    const modelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${this.model}.bin`;
    const response = await axios.get(modelUrl, {
      responseType: "stream",
      onDownloadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (progressCallback) {
          progressCallback({
            progress,
            downloaded: progressEvent.loaded,
            total: progressEvent.total,
          });
        }
      },
    });

    return new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(this.modelPath);

      // Pipe the response to the file writer
      response.data.pipe(writer);

      let error: Error | null = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });

      writer.on("close", () => {
        if (!error) {
          resolve();
        }
      });
    });
  }
}

export default WhisperModelDownloader;
