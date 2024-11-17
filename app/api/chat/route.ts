// import { openai } from "@ai-sdk/openai";

import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

import { streamText } from "ai";
import { tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages: messages,
    tools: {
      generateASRForm: tool({
        description: "Generate an ASR form based on provided details",
        parameters: z.object({
          propertyAddress: z.string().optional().describe("Property address"),
          name: z.string().optional().describe("Client name"),
          address: z.string().optional().describe("Client address"),
          sellerConcessions: z
            .string()
            .optional()
            .describe("Seller concessions (yes/no)"),
          buyerBrokerFee: z.string().optional().describe("Buyer broker fee"),
          closingCostAssistance: z
            .string()
            .optional()
            .describe("Closing cost assistance"),
          mortgageContingency: z
            .string()
            .optional()
            .describe("Mortgage contingency (yes/no)"),
          appraisalContingency: z
            .string()
            .optional()
            .describe("Appraisal contingency (yes/no)"),
          inspections: z.string().optional().describe("Inspections (yes/no)"),
          selectedInspections: z
            .array(z.string())
            .optional()
            .describe("Selected inspection types"),
          inspectionDays: z
            .number()
            .optional()
            .describe("Inspection period in days"),
          settlementDate: z
            .string()
            .optional()
            .describe("Settlement date (ISO string format)"),
          offerDate: z
            .string()
            .optional()
            .describe("Offer date (ISO string format)"),
          includedFixtures: z.string().optional().describe("Included fixtures"),
          excludedFixtures: z.string().optional().describe("Excluded fixtures"),
          additionalTerms: z.string().optional().describe("Additional terms"),
          purchasePrice: z.number().optional().describe("Purchase price"),
          agreementDraftDate: z
            .string()
            .transform((str) => new Date(str).toISOString())
            .optional()
            .describe("Agreement draft date (ISO string format)"),
          earnestMoneyDeposit: z
            .number()
            .optional()
            .describe("Earnest money deposit"),
          initialDepositDays: z
            .number()
            .optional()
            .describe("Initial deposit days"),
        }),
        execute: async (params) => {
          const processedParams = {
            ...params,
            settlementDate: params.settlementDate
              ? new Date(params.settlementDate).toISOString()
              : undefined,
            offerDate: params.offerDate
              ? new Date(params.offerDate).toISOString()
              : undefined,
            agreementDraftDate: params.agreementDraftDate
              ? new Date(params.agreementDraftDate).toISOString()
              : undefined,
          };

          return {
            success: true,
            formDetails: processedParams,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
