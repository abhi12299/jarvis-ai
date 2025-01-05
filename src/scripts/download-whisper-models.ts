import path from "path";
import { WhisperModel } from "../whisper/models";
import WhisperModelDownloader from "../whisper/downloader";

const PACKAGING_MODELS: WhisperModel[] = ["tiny"];

async function downloadModel(model: WhisperModel) {
  const modelsDir = path.join(__dirname, "../../models");
  const whisperAddonPath = path.join(
    __dirname,
    "../../lib/whisper.cpp/build/Release/addon.node.node"
  );
  const downloader = new WhisperModelDownloader(
    model,
    modelsDir,
    whisperAddonPath
  );

  console.log(`Downloading whisper model: ${model}`);
  try {
    await downloader.download();
    console.log(`Model ${model} downloaded successfully`);
  } catch (error) {
    throw new Error(`Error downloading model ${model}: ${error.message}`);
  }
}

async function downloadAllModels() {
  try {
    await Promise.all(PACKAGING_MODELS.map(downloadModel));
    console.log("All whisper models downloaded successfully");
  } catch (error) {
    console.error("Error downloading whisper models:", error);
    process.exit(1);
  }
}

downloadAllModels();
