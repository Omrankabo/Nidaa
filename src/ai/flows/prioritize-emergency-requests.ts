'use server';

/**
 * @fileOverview A flow that prioritizes emergency requests based on keywords or phrases.
 *
 * - prioritizeEmergencyRequest - A function that handles the prioritization process.
 * - PrioritizeEmergencyRequestInput - The input type for the prioritizeEmergencyRequest function.
 * - PrioritizeEmergencyRequestOutput - The return type for the prioritizeEmergencyRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeEmergencyRequestInputSchema = z.object({
  requestText: z
    .string()
    .describe('The text of the emergency request, either from SMS or voice transcription.'),
});
export type PrioritizeEmergencyRequestInput = z.infer<
  typeof PrioritizeEmergencyRequestInputSchema
>;

const PrioritizeEmergencyRequestOutputSchema = z.object({
  priorityLevel: z
    .enum(['critical', 'high', 'medium', 'low'])
    .describe("The priority level of the emergency request."),
  reason: z.string().describe('The reason for the assigned priority level.'),
});
export type PrioritizeEmergencyRequestOutput = z.infer<
  typeof PrioritizeEmergencyRequestOutputSchema
>;

export async function prioritizeEmergencyRequest(
  input: PrioritizeEmergencyRequestInput
): Promise<PrioritizeEmergencyRequestOutput> {
  return prioritizeEmergencyRequestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeEmergencyRequestPrompt',
  input: {schema: PrioritizeEmergencyRequestInputSchema},
  output: {schema: PrioritizeEmergencyRequestOutputSchema},
  prompt: `You are an emergency response system. Your task is to prioritize emergency requests based on the text of the request. The request will be in Arabic.

Given the following emergency request:

{{requestText}}

Determine the priority level of the request (critical, high, medium, or low) and provide a reason for your decision in Arabic.

Consider keywords and phrases that indicate urgency, such as "فورا," "فاقد للوعي," "ينزف," etc.

Ensure that the output is in the correct JSON format.
`,
});

const prioritizeEmergencyRequestFlow = ai.defineFlow(
  {
    name: 'prioritizeEmergencyRequestFlow',
    inputSchema: PrioritizeEmergencyRequestInputSchema,
    outputSchema: PrioritizeEmergencyRequestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
