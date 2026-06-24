import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import AppError from "../errors/AppError";
import { AI_PROVIDER, type AIProvider, DEFAULT_AI_MODELS } from "../constants";

const SYSTEM_PROMPT =
  "You are an expert copywriter specializing in follow-up email, SMS, WhatsApp, and phone call sequences. Generate content exactly as instructed.";

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface GenerateOptions {
  temperature?: number;
}

interface AIResponse {
  content: string;
}

const generateWithOpenAI = async (
  apiKey: string,
  model: string,
  prompt: string,
  options?: GenerateOptions
): Promise<string> => {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: options?.temperature ?? 0.7,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new AppError(500, "AI returned empty response");
  }

  return text;
};

const generateWithGemini = async (
  apiKey: string,
  model: string,
  prompt: string,
  options?: GenerateOptions
): Promise<string> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    generationConfig: { temperature: options?.temperature ?? 0.7 },
  });

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new AppError(500, "AI returned empty response");
  }

  return text;
};

const generateWithClaude = async (
  apiKey: string,
  model: string,
  prompt: string,
  options?: GenerateOptions
): Promise<string> => {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    temperature: options?.temperature ?? 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (!block || block.type !== "text" || !block.text) {
    throw new AppError(500, "AI returned empty response");
  }

  return block.text;
};

export const generateContent = async (
  config: AIConfig,
  prompt: string,
  options?: GenerateOptions
): Promise<AIResponse> => {
  const model = config.model || DEFAULT_AI_MODELS[config.provider];

  try {
    let content: string;

    switch (config.provider) {
      case AI_PROVIDER.OPENAI:
        content = await generateWithOpenAI(
          config.apiKey,
          model,
          prompt,
          options
        );
        break;
      case AI_PROVIDER.GEMINI:
        content = await generateWithGemini(
          config.apiKey,
          model,
          prompt,
          options
        );
        break;
      case AI_PROVIDER.CLAUDE:
        content = await generateWithClaude(
          config.apiKey,
          model,
          prompt,
          options
        );
        break;
      default:
        throw new AppError(400, `Unsupported AI provider: ${config.provider}`);
    }

    return { content };
  } catch (error) {
    if (error instanceof AppError) throw error;

    const message =
      error instanceof Error ? error.message : "AI generation failed";
    throw new AppError(502, `AI provider error: ${message}`);
  }
};
