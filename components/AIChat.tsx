"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createAudioStreamFromText } from "@/utils/elevenlabsTTS";
import { MicButton } from "@/components/MicButton";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import Logo from "@/public/img/logo.png";

// Import EnhancedPhoneCall
import { EnhancedPhoneCall } from "@/components/enhanced-phone-call";
import { Phone } from "lucide-react";

// Simplify to only keep decision-related type
type Decision = {
  decision: "yes" | "no";
  reason: string;
};

type Farewell = {
  farewell: string;
  reason: string;
};

type ModalContent = {
  type: "decision" | "farewell";
  content: Decision | Farewell;
};

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getFileUrl, pinata } from "@/lib/config";

// Update the component props interface
interface AIChatProps {
  systemPrompt: string;
}

// Update the component definition to accept props
export function AIChat({ systemPrompt }: AIChatProps) {
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  // State to manage Phone Call Dialog
  const [isPhoneCallOpen, setIsPhoneCallOpen] = useState<boolean>(false);

  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const [url, setUrl] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: "system-1",
        role: "system",
        content: systemPrompt,
      },
    ],
    async onToolCall({ toolCall }) {
      console.log("toolCall", JSON.stringify(toolCall));
      try {
        if (toolCall.toolName === "leaveCall") {
          const farewellData = toolCall.args as Farewell;
          setModalContent({
            type: "farewell",
            content: farewellData,
          });
          setIsModalOpen(true);

          toast({
            title: "Call Ended",
            description: farewellData.farewell,
          });
        } else if (toolCall.toolName === "makeDecision") {
          const decisionData = toolCall.args as Decision;
          setModalContent({
            type: "decision",
            content: decisionData,
          });
          setIsModalOpen(true);

          toast({
            title: "Decision Made",
            description: `Decision: ${decisionData.decision}\nReason: ${decisionData.reason}`,
          });
        }
      } catch (error) {
        console.error("Error handling tool call:", error);
        toast({
          title: "Error",
          description:
            "There was an issue processing the decision. Please try again.",
          variant: "destructive",
        });
      }
    },
    onFinish: async (message) => {
      if (isMicOn) {
        await handleGenerateAudio(message.content);
      }
    },
  });

  // UseEffect to update the decision state
  useEffect(() => {
    if (modalContent) {
      console.log("Decision:", modalContent.content);
    }
  }, [modalContent]);

  useEffect(() => {
    const initializeGroup = async () => {
      try {
        const response = await fetch("/api/init-group");
        if (!response.ok) {
          throw new Error("Failed to initialize group");
        }
        const group = await response.json();
        setGroupId(group.id);
      } catch (err) {
        console.error(err);
      }
    };

    initializeGroup();
  }, []);

  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [groupId, setGroupId] = useState<string | null>(null);
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

  // Add this ref to store the toggle function
  const toggleMicRef = useRef<(() => void) | undefined>();

  const triggerMic = () => {
    toggleMicRef.current?.();
  };

  // Add function to generate feedback
  const handleGenerateFeedback = async () => {
    setIsGeneratingFeedback(true);
    try {
      // Get email response from localStorage
      const emailResponse = localStorage.getItem("pinataScenarioResponse");

      // Prepare conversation data
      const conversationData = messages
        .filter((m) => m.id !== "system-1")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const data = {
        emailResponse,
        conversation: conversationData,
      };

      const response = await fetch(
        "https://magicloops.dev/api/loop/60bb42b5-8883-433e-b9ac-50d3211c8654/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const feedbackForm = await response.json();
      // Create PDF
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      let page = pdfDoc.addPage();
      const { height } = page.getSize();

      // Add feedback content
      if (feedbackForm) {
        try {
          // const feedback = JSON.parse(feedbackForm);
          const feedback = feedbackForm;
          const { width } = page.getSize();
          let currentY = height - 50;
          const sections = [
            { title: "Overall Feedback", data: feedback.overallFeedback },
            { title: "Email Analysis", data: feedback.emailFeedback },
            {
              title: "Conversation Analysis",
              data: feedback.conversationFeedback,
            },
          ];

          for (const section of sections) {
            // Add new page if needed
            if (currentY < 100) {
              page = pdfDoc.addPage();
              currentY = height - 50;
            }

            // Draw section title
            page.drawText(section.title, {
              x: 50,
              y: currentY,
              size: 16,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            currentY -= 30;

            // Draw section content
            Object.entries(section.data).forEach(
              ([key, value]: [string, unknown]) => {
                const title = key.charAt(0).toUpperCase() + key.slice(1);
                if (typeof value === "object") {
                  // Draw subsection title
                  page.drawText(`${title}:`, {
                    x: 50,
                    y: currentY,
                    size: 12,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                  });
                  currentY -= 20;

                  // Draw score and feedback
                  page.drawText(
                    `Score: ${(value as { score: number })?.score}/5`,
                    {
                      x: 70,
                      y: currentY,
                      size: 12,
                      font: timesRomanFont,
                      color: rgb(0, 0, 0),
                    }
                  );
                  currentY -= 20;

                  // Handle text wrapping for feedback
                  const words = (value as { feedback: string })?.feedback.split(
                    " "
                  );
                  let line = "";
                  const maxWidth = width - 140; // Increased indent for feedback

                  words.forEach((word: string) => {
                    const testLine = line + word + " ";
                    const textWidth = (12 / 2) * testLine.length;

                    if (textWidth > maxWidth && line.length > 0) {
                      page.drawText(line, {
                        x: 70,
                        y: currentY,
                        size: 12,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
                      });
                      currentY -= 20;
                      line = word + " ";
                    } else {
                      line = testLine;
                    }
                  });

                  if (line.length > 0) {
                    page.drawText(line.trim(), {
                      x: 70,
                      y: currentY,
                      size: 12,
                      font: timesRomanFont,
                      color: rgb(0, 0, 0),
                    });
                    currentY -= 30;
                  }
                }
              }
            );
            currentY -= 20; // Add space between sections
          }
        } catch (error) {
          console.error("Error parsing feedback form:", error);
          toast({
            title: "Error",
            description: "Failed to parse feedback data",
            variant: "destructive",
          });
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const file = new File([blob], "conversation-feedback.pdf", {
        type: "application/pdf",
      });

      // Save to pinata
      const keyRequest = await fetch("/api/key");
      const keyData = await keyRequest.json();
      const upload = await pinata.upload
        .file(file)
        .group(groupId!)
        .key(keyData.JWT);

      const publicUrl = getFileUrl(upload.cid);

      setUrl(publicUrl);

      // save to local storage
      // append to array of urls
      const existingUrls =
        localStorage.getItem("conversationFeedbackUrls") || "[]";
      const urls = JSON.parse(existingUrls);
      urls.push(publicUrl);
      localStorage.setItem("conversationFeedbackUrls", JSON.stringify(urls));

      // Send URL via webhook to Magic Loops
      const webhookUrl =
        "https://magicloops.dev/api/loop/e744c6c1-eb85-40ea-a97f-e5b1d5a9b900/run";

      try {
        console.log("Sending webhook with data:", { url, feedbackForm });

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: url,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Webhook success:", result);
      } catch (error) {
        console.error("Webhook error:", error);
        toast({
          title: "Webhook Error",
          description:
            "Failed to send feedback data, but PDF was generated successfully.",
          variant: "destructive",
        });
      }

      // Create a download link
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.download = "conversation-feedback.pdf";
      // link.click();

      // // Cleanup
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to generate feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <div className="flex items-center space-x-2">
            <a href="/dashboard" className="flex items-center space-x-2">
              <Image src={Logo} alt="DealDrill Logo" width={32} height={32} />
              <h1 className="text-2xl font-bold text-black dark:text-white">
                DealDrill
              </h1>
            </a>
          </div>
        </div>
      </header>

      <div className="flex-grow w-full max-w-3xl overflow-y-auto px-4 pb-24 pt-8">
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
                  <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
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
              toggleMicFunction={toggleMicRef.current}
            />
            {/* New Button to Open EnhancedPhoneCall Dialog */}
            <Button
              variant="ghost"
              onClick={() => setIsPhoneCallOpen(true)}
              className="ml-2"
              title="Open Phone Call"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </form>
          {isMicOn && (
            <p className="mt-2 text-sm text-gray-600">Listening...</p>
          )}
        </div>
      </div>

      {/* Existing Modal for Decisions and Farewells */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTitle>
          {modalContent?.type === "decision" ? "Sales Response" : "Call Ended"}
        </DialogTitle>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {modalContent ? (
            modalContent.type === "decision" ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Response:</span>
                  <span
                    className={
                      (modalContent.content as Decision).decision === "yes"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {(modalContent.content as Decision).decision === "yes"
                      ? "APPROVED"
                      : "DECLINED"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Explanation:</span>
                  <p className="mt-1">
                    {(modalContent.content as Decision).reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 ">
                <div>
                  <span className="font-semibold">Farewell Message:</span>
                  <p className="mt-1">
                    {(modalContent.content as Farewell).farewell}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Reason:</span>
                  <p className="mt-1">
                    {(modalContent.content as Farewell).reason}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="text-gray-500">
              No response has been generated yet.
            </div>
          )}
          {modalContent && (
            <div className="mt-6 space-y-4">
              <Button
                onClick={handleGenerateFeedback}
                disabled={isGeneratingFeedback}
                className="w-full"
              >
                {isGeneratingFeedback ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating Feedback...
                  </>
                ) : (
                  "Generate Conversation Feedback"
                )}
              </Button>

              {url && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View PDF Report
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Dialog for EnhancedPhoneCall */}
      <Dialog
        open={isPhoneCallOpen}
        onOpenChange={(open) => {
          setIsPhoneCallOpen(open);
          if (!open) {
            setIsMicOn(false);
          }
        }}
      >
        <DialogTitle>Enhanced Phone Call</DialogTitle>
        <DialogContent className="sm:max-w-[425px] p-0">
          <EnhancedPhoneCall isMicOn={isMicOn} setIsMicOn={triggerMic} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
