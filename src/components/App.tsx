import React, { useEffect, useState, useRef } from "react";
import { AVAILABLE_MODELS, WhisperModel } from "../whisper/models";
import { DownloadProgress, ITranscriptLine } from "../types";

export function App() {
  const [selectedModel, setSelectedModel] = useState<WhisperModel>("tiny");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [transcription, setTranscription] = useState<ITranscriptLine[]>([]);
  const [transcribing, setTranscribing] = useState(false);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const loadAudioDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error("Error loading audio devices:", error);
      }
    };

    loadAudioDevices();
  }, []);

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


  const handleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: selectedDevice
          }
        });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();

          setTranscribing(true);
          try {
            const result = await window.electron.transcribeAudio(arrayBuffer, "recorded-audio.webm");
            setTranscription(result);
          } catch (error) {
            console.error("Transcription failed:", error);
          } finally {
            setTranscribing(false);
          }

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recording:", error);
      }
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
        <h3>Audio Input</h3>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          disabled={isRecording || transcribing || downloading}
          style={{ marginRight: "10px" }}
        >
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId}`}
            </option>
          ))}
        </select>

        <button
          onClick={handleRecording}
          disabled={!selectedDevice || transcribing || downloading}
          style={{
            marginRight: "10px",
            backgroundColor: isRecording ? "#ff4444" : undefined
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {transcribing && (
        <div style={{ marginTop: "10px" }}>Transcribing audio...</div>
      )}

      {transcription && (
        <div style={{ marginTop: "20px" }}>
          <h3>Transcription:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(transcription, null, 2)}</pre>
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