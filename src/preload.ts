// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { WhisperModel } from "./whisper/models";
import { DownloadProgress } from "./types";

contextBridge.exposeInMainWorld("electron", {
  downloadModel: (model: WhisperModel) =>
    ipcRenderer.invoke("download-model", model),
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
    ipcRenderer.on("download-progress", (_, progress) => callback(progress));
    return () => {
      ipcRenderer.removeAllListeners("download-progress");
    };
  },
  transcribeAudio: (arrayBuffer: ArrayBuffer, fileName: string) =>
    ipcRenderer.invoke("transcribe-audio", arrayBuffer, fileName),
});
