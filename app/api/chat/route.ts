import { openai } from "@ai-sdk/openai";

// import { createOpenAI } from "@ai-sdk/openai";

// const openai = createOpenAI({
//   // custom settings, e.g.
//   apiKey: process.env.SAMBANOVA_API_KEY,
//   baseURL: "https://api.sambanova.ai/v1",
//   // baseURL: "https://api.sambanova.ai/v1/chat/completions",
// });

import { streamText } from "ai";
import { tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log("messages", messages);
  const result = await streamText({
    // model: openai("Meta-Llama-3.1-405B-Instruct"),
    model: openai("gpt-4o"),
    messages: messages,
    tools: {
      makeDecision: tool({
        description: "Make a yes or no decision about a purchase",
        parameters: z.object({
          decision: z.enum(["yes", "no"]).describe("Final decision"),
          reason: z.string().describe("Explanation for the decision"),
        }),
        execute: async (params) => {
          return {
            success: true,
            decision: params,
          };
        },
      }),
      leaveCall: tool({
        description: "End the current conversation politely",
        parameters: z.object({
          farewell: z.string().describe("Polite goodbye message"),
          reason: z.string().describe("Reason for leaving the call"),
        }),
        execute: async (params) => {
          return {
            success: true,
            message: params,
          };
        },
      }),
    },
  });

  // console.log("result", result);

  return result.toDataStreamResponse();
}
