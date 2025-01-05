import path from "path";
import fs from "fs";
import { promisify } from "util";

import { WhisperModel } from "./models";
import { pathExists } from "../lib/pathExists";

class WhisperBase {
  protected model: WhisperModel;
  private _modelsDir: string;
  private _modelPath: string;
  private _whisperAddonPath: string;

  constructor(
    model: WhisperModel,
    modelsDir?: string,
    whisperAddonPath?: string
  ) {
    this.model = model;

    this._modelsDir =
      modelsDir ||
      (process.env.NODE_ENV === "development"
        ? path.join(__dirname, "../../models")
        : path.join((process as any).resourcesPath, "models"));

    this._whisperAddonPath =
      whisperAddonPath ||
      (process.env.NODE_ENV === "development"
        ? path.join(
            __dirname,
            "../../lib/whisper.cpp/build/Release/addon.node.node"
          )
        : path.join(
            (process as any).resourcesPath,
            "build/Release/addon.node.node"
          ));

    console.log("whisperAddonPath", this._whisperAddonPath);
    this._modelPath = path.join(this._modelsDir, `${this.model}.bin`);
    console.log("modelPath", this._modelPath);
  }

  async init() {
    const modelDirExists = await pathExists(this._modelsDir);
    if (!modelDirExists) {
      await fs.promises.mkdir(this._modelsDir, { recursive: true });
    }
  }

  async modelExists() {
    return await pathExists(this._modelPath);
  }

  async whisperLib() {
    const addonPathExists = await pathExists(this._whisperAddonPath);
    if (!addonPathExists) {
      throw new Error(
        "Whisper addon not found. Run `npm run postinstall` to build it."
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { whisper } = require(this._whisperAddonPath);
    return promisify(whisper);
  }

  get modelPath() {
    return this._modelPath;
  }

  get modelsDir() {
    return this._modelsDir;
  }
}

export default WhisperBase;
