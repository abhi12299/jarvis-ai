import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import started from "electron-squirrel-startup";
import { WhisperModelDownloader, WhisperModel } from "./whisper";
import WhisperTranscriber from "./whisper/transcribe";
import fs from "fs";
import { AudioProcessor } from "./audioProcessor";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  if (process.env.NODE_ENV === "development") {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("download-model", async (_, model: WhisperModel) => {
  const downloader = new WhisperModelDownloader(model);
  await downloader.download((progress) => {
    mainWindow?.webContents.send("download-progress", progress);
  });
});

const audioProcessor = new AudioProcessor();
const transcriber = new WhisperTranscriber("base");

ipcMain.handle(
  "transcribe-audio",
  async (_, arrayBuffer: ArrayBuffer, fileName: string) => {
    try {
      const tempFilePath = await audioProcessor.saveToFile(
        arrayBuffer,
        fileName
      );

      // convert to wav
      const wavFilePath = await audioProcessor.convertToWav(tempFilePath);

      // Transcribe the audio
      const result = await transcriber.transcribe(wavFilePath);

      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error("Error cleaning up temp file:", err);
      }

      return result;
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }
);
