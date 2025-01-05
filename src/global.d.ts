import { WhisperModel } from "./whisper/models";
import { DownloadProgress, ITranscriptLine } from "./types";

declare global {
  interface Window {
    electron: {
      downloadModel: (model: WhisperModel) => Promise<void>;
      onDownloadProgress: (
        callback: (progress: DownloadProgress) => void
      ) => () => void;
      transcribeAudio: (
        arrayBuffer: ArrayBuffer,
        fileName: string
      ) => Promise<ITranscriptLine[]>;
    };
  }
}
