'use server';

import { suggestCommands, type SuggestCommandsInput } from '@/ai/flows/suggest-commands';

export async function getCommandSuggestions(input: SuggestCommandsInput): Promise<string[]> {
  try {
    const result = await suggestCommands(input);
    return result.suggestions || [];
  } catch (error) {
    console.error('Error getting command suggestions:', error);
    // In a real app, you might want to handle this more gracefully
    return [];
  }
}
