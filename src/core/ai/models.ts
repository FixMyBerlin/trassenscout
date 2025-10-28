import { openai } from "@ai-sdk/openai"

// OpenAI Models
// https://platform.openai.com/docs/models/compare

export const gpt5Mini = openai("gpt-5-mini")
export const gpt41Mini = openai("gpt-4.1-mini")
// GPT-4.1 - Smartest non-reasoning model
// tool calling
// no reasoning
// context window

export const gpt4Turbo = openai("gpt-4-turbo")
// GPT-4 Turbo - Fast and capable

export const gpt35Turbo = openai("gpt-3.5-turbo")
// GPT-3.5 Turbo - Fast and cost-effective

// Fast and cheap model for evaluations
export const factualityModel = openai("gpt-4o-mini")
// GPT-4o Mini - Fast, cheap, good for classification tasks

// Default model export for easy usage
export const model = gpt41Mini
