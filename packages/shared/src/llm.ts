import type { z } from 'zod';

/**
 * LLM abstraction per ADR-0008. Anthropic Claude is primary, OpenAI is fallback.
 *
 * In Sprint 1 this is a stub: it validates the call shape and returns a "not yet
 * implemented" sentinel. Sprint 4 wires up the real Anthropic client and Langfuse
 * tracing.
 */

export type LlmModel =
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001'
  | 'gpt-4o'
  | 'gpt-4o-mini';

export interface LlmMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface LlmCall<TOutput = unknown> {
  model: LlmModel;
  system?: string;
  messages: LlmMessage[];
  tools?: LlmTool[];
  /** Zod schema for structured output. When set, the response must conform. */
  responseSchema?: z.ZodType<TOutput>;
  /** Cache key for (prompt_hash, model_version) deduplication. */
  cacheKey?: string;
  /** Maximum tokens for the response. */
  maxTokens?: number;
  /** Temperature; 0 for deterministic output. */
  temperature?: number;
  /** Trace metadata for Langfuse. */
  trace?: {
    name: string;
    tenantId?: string;
    caseId?: string;
    userId?: string;
  };
}

export interface LlmResult<TOutput = unknown> {
  output: TOutput;
  rawText: string;
  model: LlmModel;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
  cached: boolean;
  latencyMs: number;
}

/**
 * Stub implementation. Sprint 4 replaces this with the real Anthropic client.
 */
export async function llm<TOutput = unknown>(
  _call: LlmCall<TOutput>,
): Promise<LlmResult<TOutput>> {
  throw new Error(
    'llm() is a stub in Sprint 1. Implement in Sprint 4 with the Anthropic SDK.',
  );
}
