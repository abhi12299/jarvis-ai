import { WhisperBase, WhisperModel } from ".";
import { ITranscriptLine } from "../types";

class WhisperTranscriber extends WhisperBase {
  constructor(model: WhisperModel) {
    super(model);
  }

  async transcribe(audioPath: string) {
    const whisper = await this.whisperLib();
    const params = {
      language: "en",
      model: this.modelPath,
      fname_inp: audioPath,
      use_gpu: true,
      flash_attn: false,
      no_prints: true,
      comma_in_time: false,
      translate: true,
      no_timestamps: false,
      audio_ctx: 0,
    };

    const result = await whisper(params);
    return result.map((r: string[]) => ({
      start: r[0],
      end: r[1],
      speech: r[2],
    })) as ITranscriptLine[];
  }
}

export default WhisperTranscriber;
