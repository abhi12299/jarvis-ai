import settings from "electron-settings";
import { createGroq } from "@ai-sdk/groq";
import { generateText, LanguageModelV1 } from "ai";
import AIBase from ".";
import { SYSTEM_PROMPT } from "./prompts/basic";

export const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.3-70b-specdec",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
] as const;

export type GroqModels = (typeof GROQ_MODELS)[number];

class Groq extends AIBase {
  private static readonly apiKeySettingsKey = "groqApiKey";

  constructor(modelId: GroqModels) {
    const apiKey = settings.getSync(Groq.apiKeySettingsKey) as
      | string
      | undefined;
    const initialModel = Groq.createGroqModel(modelId, apiKey);

    super(initialModel, { modelId, apiKey });
  }

  private static createGroqModel(
    modelId: GroqModels,
    apiKey?: string
  ): LanguageModelV1 {
    const groqProvider = createGroq({ apiKey });
    return groqProvider(modelId);
  }

  protected onApiKeyUpdate(apiKey: string): void {
    settings.setSync(Groq.apiKeySettingsKey, apiKey);
    const newModel = Groq.createGroqModel(this.modelId as GroqModels, apiKey);
    this.setModel(newModel, this.modelId);
  }

  protected async initializeModel(): Promise<void> {
    if (!this.apiKey) {
      const apiKey = settings.getSync(Groq.apiKeySettingsKey) as string;

      if (!apiKey) {
        throw new Error("Groq API key is not set");
      }

      this.setApiKey(apiKey);
    }
  }

  public async transcribe(text: string): Promise<string> {
    await this.initializeModel();

    const response = await generateText({
      model: this.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `<input>${text}</input>\nOutput:\n` },
      ],
    });

    return response.text;
  }
}

export default Groq;
