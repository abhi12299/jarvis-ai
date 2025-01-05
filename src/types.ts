import { WhisperModel } from "./whisper/models";

export interface DownloadProgress {
  progress: number;
  downloaded: number;
  total: number;
}

export interface IpcChannels {
  "download-model": {
    request: WhisperModel;
    response: void;
  };
  "download-progress": {
    request: never;
    response: DownloadProgress;
  };
}
