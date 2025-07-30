'use server';

/**
 * @fileOverview An AI agent that suggests shell commands based on user input and command history.
 *
 * - suggestCommands - A function that suggests shell commands.
 * - SuggestCommandsInput - The input type for the suggestCommands function.
 * - SuggestCommandsOutput - The return type for the suggestCommands function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCommandsInputSchema = z.object({
  userInput: z.string().describe('The current user input in the terminal.'),
  commandHistory: z
    .string()
    .array()
    .describe('The history of commands executed by the user.'),
});
export type SuggestCommandsInput = z.infer<typeof SuggestCommandsInputSchema>;

const SuggestCommandsOutputSchema = z.object({
  suggestions: z
    .string()
    .array()
    .describe('An array of suggested commands based on the input and history.'),
});
export type SuggestCommandsOutput = z.infer<typeof SuggestCommandsOutputSchema>;

export async function suggestCommands(input: SuggestCommandsInput): Promise<SuggestCommandsOutput> {
  return suggestCommandsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCommandsPrompt',
  input: {schema: SuggestCommandsInputSchema},
  output: {schema: SuggestCommandsOutputSchema},
  prompt: `You are a helpful terminal assistant. Your task is to suggest shell commands to the user based on their current input and past command history.

Here's the user's current input:
{{userInput}}

Here's the user's command history:
{{#each commandHistory}}
- {{{this}}}
{{/each}}

Suggest a list of commands that the user might want to execute next. Be concise and only suggest relevant commands.

Your response should be a JSON array of strings.`,
});

const suggestCommandsFlow = ai.defineFlow(
  {
    name: 'suggestCommandsFlow',
    inputSchema: SuggestCommandsInputSchema,
    outputSchema: SuggestCommandsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
