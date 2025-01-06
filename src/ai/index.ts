import { LanguageModelV1 } from "ai";

export interface AIModelConfig {
  apiKey?: string;
  modelId: string;
}

abstract class AIBase {
  protected model: LanguageModelV1;
  protected modelId: string;
  protected apiKey?: string;

  constructor(model: LanguageModelV1, config: AIModelConfig) {
    this.model = model;
    this.modelId = config.modelId;
    this.apiKey = config.apiKey;
  }

  protected setModel(model: LanguageModelV1, modelId: string) {
    this.model = model;
    this.modelId = modelId;
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.onApiKeyUpdate(apiKey);
  }

  public getApiKey(): string | undefined {
    return this.apiKey;
  }

  protected abstract onApiKeyUpdate(apiKey: string): void;
  protected abstract initializeModel(): Promise<void>;

  public getModelId(): string {
    return this.modelId;
  }

  public abstract transcribe(text: string): Promise<string>;
}

export default AIBase;
