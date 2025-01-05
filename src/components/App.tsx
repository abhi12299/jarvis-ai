import React, { useEffect, useState, useRef } from "react";
import { AVAILABLE_MODELS, WhisperModel } from "../whisper/models";
import { DownloadProgress } from "../types";

export function App() {
  const [selectedModel, setSelectedModel] = useState<WhisperModel>("tiny");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [transcribing, setTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const cleanup = window.electron.onDownloadProgress((progress) => {
      setProgress(progress);
    });
    return cleanup;
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await window.electron.downloadModel(selectedModel);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
      setProgress(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setTranscription(""); // Clear previous transcription
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    setTranscribing(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await window.electron.transcribeAudio(arrayBuffer, selectedFile.name);
      setTranscription(result);
    } catch (error) {
      console.error("Transcription failed:", error);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Whisper Model Downloader</h2>

      <div style={{ marginBottom: "20px" }}>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as WhisperModel)}
          disabled={downloading}
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{ marginLeft: "10px" }}
        >
          Download Model
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="audio/*"
          disabled={transcribing || downloading}
        />
        <button
          onClick={handleTranscribe}
          disabled={!selectedFile || transcribing || downloading}
          style={{ marginLeft: "10px" }}
        >
          Transcribe
        </button>
      </div>

      {transcribing && (
        <div style={{ marginTop: "10px" }}>Transcribing audio...</div>
      )}

      {transcription && (
        <div style={{ marginTop: "20px" }}>
          <h3>Transcription:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{transcription}</pre>
        </div>
      )}

      {progress && (
        <div>
          <div>Progress: {progress.progress}%</div>
          <div>
            Downloaded: {(progress.downloaded / 1024 / 1024).toFixed(2)} MB /
            {(progress.total / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      )}
    </div>
  );
} 