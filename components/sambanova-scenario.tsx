"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Logo from "@/public/img/logo.png";
import Image from "next/image";

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

export function SambanovaScenario() {
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
        localStorage.setItem("sambanovaScenarioResponse", response);

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
                <a href="/dashboard" className="flex items-center space-x-2">
                <Image src={Logo} alt="DealDrill Logo" width={32} height={32} />
                <h1 className="text-2xl font-bold text-black dark:text-white">
                    DealDrill
                </h1>
                </a>
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
                SambaNova, a leading AI platform provider specializing in large
                language models, has received an inquiry from a mid-sized
                technology company interested in implementing AI solutions for
                their business processes. The company&apos;s CTO, Jane Doe, seeks
                to understand how SambaNova&apos;s LLM platform can enhance their
                current operations. As a sales representative, your goal is to
                provide valuable information about SambaNova&apos;s solutions
                while scheduling a discovery call to better understand their
                specific needs and demonstrate the platform&apos;s capabilities.
                </p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader className="border-b p-4">
                <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt="JD"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold">Jane Doe</h2>
                    <p className="text-sm text-gray-500">
                    jane.doe@techcompany.com
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleString()}
                </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">
                Inquiry About SambaNova&apos;s LLM Solutions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                Dear SambaNova Team,
                <br />
                <br />
                I am the Director of Hack University Texas, Dallas, and we are
                organizing our annual hackathon event, Hack UTD 2024. We&apos;re
                looking to partner with leading AI companies to provide
                participants with cutting-edge tools and technologies for their
                projects. Given SambaNova&apos;s expertise in AI and LLMs, we
                believe you would be an excellent sponsor for our event.
                <br />
                <br />
                We&apos;re interested in exploring potential sponsorship
                opportunities that could include providing access to your AI
                platform for participants, technical mentorship, and workshop
                sessions. Our hackathon typically attracts over 500 developers and
                AI enthusiasts, offering great visibility for innovative AI
                platforms like SambaNova.
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
                Chief Technology Officer
                <br />
                Tech Solutions Inc.
                <br />
                jane.doe@techcompany.com
                <br />
                (555) 123-4567
                </p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader className="border-b p-4">
                <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt="JD"
                    />
                    <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold">
                    <span>Salesperson&apos;s Response</span>
                    </h2>
                    <p className="text-sm text-gray-500">salesperson@email.com</p>
                </div>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleString()}
                </div>
                </div>
            </CardHeader>
            <CardContent>
                <Textarea
                placeholder="Type your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={10}
                className="w-full mt-5"
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Response Analysis</DialogTitle>
            </DialogHeader>
            {feedback && (
                <div className="space-y-4">
                <div className="space-y-2 bg-blue-100 p-4 rounded-lg relative">
                    <h3 className="font-semibold">Overall Feedback</h3>
                    <p className="text-sm">
                    {feedback.reason ||
                        "This is an aggregated score based on all feedback categories."}
                    </p>
                    <div className="absolute top-4 right-4 text-[#163286] font-semibold">
                    {(
                        (feedback.contentClarity.score +
                        feedback.personalization.score +
                        feedback.toneAndStyle.score +
                        feedback.valueProposition.score) /
                        4
                    ).toFixed(1)}
                    /5
                    </div>
                </div>
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
                        <Link href="/ai-chat-sambanova">Proceed to Voice Chat</Link>
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
