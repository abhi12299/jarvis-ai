import { WhisperBase, WhisperModel } from ".";

class WhisperTranscriber extends WhisperBase {
  constructor(model: WhisperModel) {
    super(model);
  }

  async transcribe(audioPath: string) {
    const whisper = await this.whisperLib();
    console.log("whisperLib", whisper);
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
    console.log("params", params);
    const result = await whisper(params);

    console.log(result);
    return result;
  }
}

export default WhisperTranscriber;
