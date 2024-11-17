"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createAudioStreamFromText } from "@/utils/elevenlabsTTS";
import { MicButton } from "@/components/MicButton";
import { useReducer, useEffect, useRef, useState } from "react";
import { systemPromptJane } from "@/lib/constants";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Define actions for the reducer
type Action = { type: "UPDATE_PROPERTY"; payload: Partial<PropertyData> };

type PropertyData = {
  name: string;
  address: string;
  propertyAddress: string;
  sellerConcessions: "yes" | "no";
  buyerBrokerFee: string;
  closingCostAssistance: string;
  mortgageContingency: "yes" | "no";
  appraisalContingency: "yes" | "no";
  inspections: "yes" | "no";
  selectedInspections: string[];
  inspectionDays: number;
  settlementDate: Date | undefined;
  offerDate: Date | undefined;
  includedFixtures: string;
  excludedFixtures: string;
  additionalTerms: string;
  purchasePrice: number;
  agreementDraftDate: Date;
  earnestMoneyDeposit: number;
  initialDepositDays: number;
};

const initialPropertyData: PropertyData = {
  name: "",
  address: "",
  propertyAddress: "",
  sellerConcessions: "no" as "yes" | "no",
  buyerBrokerFee: "",
  closingCostAssistance: "",
  mortgageContingency: "no" as "yes" | "no",
  appraisalContingency: "no" as "yes" | "no",
  inspections: "no" as "yes" | "no",
  selectedInspections: [],
  inspectionDays: 0,
  settlementDate: undefined,
  offerDate: undefined,
  includedFixtures: "",
  excludedFixtures: "",
  additionalTerms: "",
  purchasePrice: 0,
  agreementDraftDate: new Date(),
  earnestMoneyDeposit: 0,
  initialDepositDays: 0,
};

// Reducer function
function propertyReducer(state: PropertyData, action: Action): PropertyData {
  switch (action.type) {
    case "UPDATE_PROPERTY":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function AIChat() {
  const [propertyData, dispatch] = useReducer(
    propertyReducer,
    initialPropertyData
  );

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: "system-1",
        role: "system",
        content: systemPromptJane,
      },
    ],
    async onToolCall({ toolCall }) {
      console.log("toolCall", JSON.stringify(toolCall));
      try {
        // Validate and parse toolCall.args using Zod schema if necessary
        const args = toolCall.args as Partial<PropertyData>;
        let toastMessage = "";

        // Dispatch a single action to update all fields
        dispatch({ type: "UPDATE_PROPERTY", payload: args });

        // Create a toast message for updated fields
        Object.keys(args).forEach((key) => {
          const value = args[key as keyof typeof args];
          if (value !== undefined) {
            toastMessage += `${key} updated: ${value}\n\n`;
          }
        });

        if (toastMessage) {
          toast({
            title: "Form Updates",
            description: toastMessage.trim(),
          });
        }
      } catch (error) {
        console.error("Error handling tool call:", error);
        toast({
          title: "Error",
          description:
            "There was an issue updating the form. Please try again.",
          variant: "destructive",
        });
      }
    },
    onFinish: async (message) => {
      // Check that mic is active
      if (isMicOn) {
        await handleGenerateAudio(message.content);
      }
    },
  });

  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Custom submit handler with safeguards
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);

    // const lastMessage = messages[messages.length - 1];
    // await handleGenerateAudio(lastMessage?.content);
  };

  // New function to handle audio generation with safeguards
  const handleGenerateAudio = async (text?: string) => {
    if (!text) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    // Stop any currently playing audio
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }

    try {
      audioSourceRef.current = await createAudioStreamFromText(
        text,
        "Rachel", // Rachel's voice ID
        audioContextRef.current
      );
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (error) {
          console.error("Error cleaning up audio:", error);
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleMicInput = (value: string) => {
    handleInputChange({
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerateForm = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <div className="flex-grow w-full max-w-3xl overflow-y-auto px-4 pb-24 pt-8">
        {JSON.stringify(systemPromptJane)}
        {messages.filter((m) => m.id !== "system-1").length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            Start a conversation by typing a message below, or chat with the AI
            by speaking.
          </div>
        ) : (
          messages
            .filter((m) => m.id !== "system-1")
            .map((m) => (
              <div
                key={m.id}
                className={`mb-4 p-4 rounded-lg ${
                  m.role === "user" ? "bg-blue-100 ml-12" : "bg-gray-100 mr-12"
                }`}
              >
                <div className="font-semibold mb-1">
                  {m.role === "user" ? "You" : "AI"}
                </div>
                <div className="whitespace-pre-wrap">
                  {m.toolInvocations ? (
                    <div className="mt-2">
                      <p>Would you like to generate the ASR form?</p>
                      <Button onClick={handleGenerateForm} className="mt-2">
                        Generate Form
                      </Button>
                    </div>
                  ) : (
                    <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                  )}
                </div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Textarea
              className="flex-grow p-3 min-h-[44px] max-h-[200px] resize-none"
              value={input}
              placeholder="Type your message..."
              onChange={(e) => {
                handleInputChange(e);
                // Auto-adjust height
                e.target.style.height = "inherit";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
            <Button type="submit">Send</Button>
            <MicButton
              setInputValue={handleMicInput}
              handleSendMessage={() => {
                const syntheticEvent = {
                  preventDefault: () => {},
                } as React.FormEvent;
                onSubmit(syntheticEvent);
              }}
              setIsMicOn={setIsMicOn}
              isMicOn={isMicOn}
            />
          </form>
          {isMicOn && (
            <p className="mt-2 text-sm text-gray-600">Listening...</p>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTitle>Generate ASR Form</DialogTitle>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto"></DialogContent>
      </Dialog>
    </div>
  );
}
