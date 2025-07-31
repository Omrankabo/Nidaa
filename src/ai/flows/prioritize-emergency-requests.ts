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
  try {
    return await prioritizeEmergencyRequestFlow(input);
  } catch (error) {
    console.error('AI prioritization failed, using default.', error);
    return {
      priorityLevel: 'medium',
      reason: 'تعذر تحديد الأولوية تلقائيًا. تمت المراجعة بشكل افتراضي.'
    };
  }
}

const prompt = ai.definePrompt({
  name: 'prioritizeEmergencyRequestPrompt',
  input: {schema: PrioritizeEmergencyRequestInputSchema},
  output: {schema: PrioritizeEmergencyRequestOutputSchema},
  prompt: `You are an emergency response system. Your task is to prioritize emergency requests based on the text of the request. The request will be in Arabic.

Given the following emergency request:

"{{requestText}}"

Analyze the text for keywords and phrases that indicate urgency. Examples of critical keywords include "حريق", "فاقد للوعي", "نزيف", "حادث سيارة", "صعوبة في التنفس". 

Assign a priority level from the following options: 'critical', 'high', 'medium', 'low'.

Provide a brief reason for your decision in Arabic.

Your entire output must be a valid JSON object that conforms to the specified output schema.
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
    if (!output) {
      throw new Error('AI returned no output. This is unexpected.');
    }
    return output;
  }
);
