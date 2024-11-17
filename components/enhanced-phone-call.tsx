"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Clock,
  Phone,
  MicOff,
  KeyRound,
  Volume2,
  UserPlus,
  Video,
  Users,
} from "lucide-react";

export function EnhancedPhoneCall() {
  const [isAnswered, setIsAnswered] = useState(false);
  const [time, setTime] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  const dragRef = useRef(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAnswered) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnswered]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const handleMove = (e: TouchEvent | MouseEvent) => {
      const currentX =
        "touches" in e
          ? (e as TouchEvent).touches[0].clientX
          : (e as MouseEvent).clientX;
      const diff = currentX - startX;
      const newPosition = Math.max(0, Math.min(diff, 200));
      setDragPosition(newPosition);

      if (newPosition > 150) {
        setIsAnswered(true);
        cleanup();
      }
    };

    const cleanup = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", cleanup);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", cleanup);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", cleanup);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", cleanup);
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-primary/90 to-primary-foreground/90 p-4 flex flex-col justify-center items-center">
      <Card className="w-full max-w-sm bg-background/80 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden">
        {!isAnswered ? (
          <div className="p-8 flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-6">
              <AvatarImage
                src="/placeholder.svg?height=128&width=128"
                alt="Sarah"
              />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-light mb-2 text-primary">Sarah</h1>
            <p className="text-xl text-muted-foreground mb-8">mobile</p>
            <div className="flex justify-center space-x-16 mb-8">
              <Button
                variant="ghost"
                className="flex flex-col items-center text-primary"
              >
                <Clock className="h-8 w-8 mb-2" />
                <span className="text-xs">Remind Me</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center text-primary"
              >
                <MessageCircle className="h-8 w-8 mb-2" />
                <span className="text-xs">Message</span>
              </Button>
            </div>
            <div
              className="bg-primary/20 rounded-full h-16 relative w-full max-w-xs backdrop-blur-sm"
              ref={dragRef}
              onTouchStart={handleDragStart}
              onMouseDown={handleDragStart}
            >
              <div
                className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-green-500 h-16 w-16 rounded-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${dragPosition}px)` }}
              >
                <Phone className="h-8 w-8 text-background" />
              </div>
              <div className="h-full flex items-center justify-center text-primary font-medium">
                slide to answer
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage
                src="/placeholder.svg?height=96&width=96"
                alt="Sarah"
              />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-light mb-2 text-primary">Sarah</h1>
            <p className="text-xl font-medium text-muted-foreground mb-8">
              {formatTime(time)}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8 w-full">
              {[
                { icon: MicOff, label: "mute" },
                { icon: KeyRound, label: "keypad" },
                { icon: Volume2, label: "audio" },
                { icon: UserPlus, label: "add call" },
                { icon: Video, label: "FaceTime" },
                { icon: Users, label: "contacts" },
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="flex flex-col items-center text-primary"
                >
                  <item.icon className="h-6 w-6 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              ))}
            </div>
            <Button
              variant="destructive"
              className="rounded-full h-16 w-16 animate-pulse"
              onClick={() => setIsAnswered(false)}
            >
              <Phone className="h-8 w-8 rotate-135" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
