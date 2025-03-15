import { Mistral } from '@mistralai/mistralai';

/**
 * Creates and returns a Mistral API client instance
 * @param apiKey - The Mistral API key
 * @returns Mistral client instance
 */
export function createMistralClient(apiKey: string): Mistral {
  return new Mistral({ apiKey });
}