"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drill, Mail, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface FeedbackResponse {
  contentClarity: {
    feedback: string;
    score: number;
  };
  personalization: {
    feedback: string;
    score: number;
  };
  toneAndStyle: {
    feedback: string;
    score: number;
  };
  valueProposition: {
    feedback: string;
    score: number;
  };
  status: string;
  reason: string;
}

export function PinataScenario() {
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const url =
        "https://magicloops.dev/api/loop/4818a939-6705-4ae3-a60a-8faed7845c4f/run";
      const apiResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      });

      const feedbackData = await apiResponse.json();
      setFeedback(feedbackData);

      // Store response in localStorage
      localStorage.setItem("pinataScenarioResponse", response);

      toast({
        title: "Response Submitted",
        description: "Your response has been analyzed successfully.",
      });
      setShowFeedback(true);
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <div className="flex items-center space-x-2">
            <Drill className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              DealDrill
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Scenario Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pinata, a leading IPFS pinning service and file storage service,
              has received an inquiry from a mid-sized consumer goods company
              interested in enhancing their data storage and management
              processes. The company&apos;s operations manager, Jane Doe, seeks
              to understand how Pinata&apos;s platform can address their current
              challenges. As a sales representative, your goal is to provide
              valuable information about Pinata&apos;s solutions while
              scheduling a discovery call to better understand their specific
              needs and demonstrate the platform&apos;s capabilities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Inbound Email from Jane Doe</span>
            </CardTitle>
            <CardDescription>
              Subject: Inquiry About Pinata&apos;s IPFS Storage Solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className=" rounded-md border p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dear Piñata Team,
                <br />
                <br />
                I am the Operations Manager at Acme Consumer Goods, and we are
                exploring solutions to improve our data storage and management
                processes. We face challenges with data accessibility, security,
                and scalability.
                <br />
                <br />
                Could you please provide more information on how Pinata&apos;s
                platform can assist us in overcoming these challenges?
                Additionally, we would like to understand the implementation
                process and any support services you offer.
                <br />
                <br />
                Looking forward to your response.
                <br />
                <br />
                Best regards,
                <br />
                <br />
                Jane Doe
                <br />
                Operations Manager
                <br />
                Acme Consumer Goods
                <br />
                jane.doe@acmeconsumergoods.com
                <br />
                (555) 123-4567
              </p>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Salesperson&apos;s Response</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your response here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={10}
              className="w-full"
            />
            <div className="mt-4 flex justify-end">
              <Button disabled={isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-4 border-b-4 border-blue-500"></div>
                ) : (
                  "Submit Response"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Response Analysis</DialogTitle>
          </DialogHeader>
          {feedback && (
            <div className="space-y-4">
              {feedback.reason && (
                <div className="space-y-2 bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold">Overall Feedback</h3>
                  <p className="text-sm">{feedback.reason}</p>
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-semibold">Content Clarity</h3>
                <p className="text-sm">{feedback.contentClarity.feedback}</p>
                <div className="text-sm text-muted-foreground">
                  Score: {feedback.contentClarity.score}/5
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Personalization</h3>
                <p className="text-sm">{feedback.personalization.feedback}</p>
                <div className="text-sm text-muted-foreground">
                  Score: {feedback.personalization.score}/5
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Tone and Style</h3>
                <p className="text-sm">{feedback.toneAndStyle.feedback}</p>
                <div className="text-sm text-muted-foreground">
                  Score: {feedback.toneAndStyle.score}/5
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Value Proposition</h3>
                <p className="text-sm">{feedback.valueProposition.feedback}</p>
                <div className="text-sm text-muted-foreground">
                  Score: {feedback.valueProposition.score}/5
                </div>
              </div>
              {feedback.status === "ok" && (
                <div className="pt-4 flex justify-center">
                  <Button asChild>
                    <Link href="/ai-chat">Proceed to Voice Chat</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
