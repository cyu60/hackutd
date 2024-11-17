"use client";

import { createContext, useContext, useState } from "react";
import { useDeepgram } from "./DeepgramContextProvider";
import { useMicrophone } from "./MicrophoneContextProvider";
import { SOCKET_STATES } from "@deepgram/sdk";

interface SharedMicrophoneContextType {
  isMicOn: boolean;
  setIsMicOn: (value: boolean) => void;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  connectionState: SOCKET_STATES;
}

const SharedMicrophoneContext =
  createContext<SharedMicrophoneContextType | null>(null);

export function SharedMicrophoneProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMicOn, setIsMicOn] = useState(false);
  const { connectionState } = useDeepgram();
  const { startMicrophone: startMic, stopMicrophone: stopMic } =
    useMicrophone();

  const startMicrophone = () => {
    startMic();
  };

  const stopMicrophone = () => {
    stopMic();
  };

  return (
    <SharedMicrophoneContext.Provider
      value={{
        isMicOn,
        setIsMicOn,
        startMicrophone,
        stopMicrophone,
        connectionState,
      }}
    >
      {children}
    </SharedMicrophoneContext.Provider>
  );
}

export function useSharedMicrophone() {
  const context = useContext(SharedMicrophoneContext);
  if (!context) {
    throw new Error(
      "useSharedMicrophone must be used within a SharedMicrophoneProvider"
    );
  }
  return context;
}
