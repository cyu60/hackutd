"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  DeepgramContextProvider,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/components/context/DeepgramContextProvider";
import {
  MicrophoneContextProvider,
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/components/context/MicrophoneContextProvider";
import { useQueue } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface BaseMicButtonProps {
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  setIsMicOn: (isOn: boolean) => void;
  isMicOn: boolean;
  toggleMicFunction?: () => void;
}

interface Word {
  word: string;
  punctuated_word?: string;
}

interface Alternative {
  words: Word[];
}

interface Channel {
  alternatives: Alternative[];
}

interface LiveTranscriptionEvent {
  is_final: boolean;
  speech_final: boolean;
  channel: Channel;
}

function BaseMicButton(props: BaseMicButtonProps) {
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    stopMicrophone,
    microphoneState,
  } = useMicrophone();
  // const captionTimeout = useRef<any>();

  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const [currentUtterance, setCurrentUtterance] = useState<string>("");
  const [isFinalUtterance, setIsFinalUtterance] = useState<boolean>(false);

  const {
    add: addTranscriptPart,
    queue: transcriptParts,
    clear: clearTranscriptParts,
  } = useQueue<{ is_final: boolean; speech_final: boolean; text: string }>([]);

  const utteranceText = (event: LiveTranscriptionEvent): string => {
    const words = event.channel.alternatives[0].words;
    return words.map((word) => word.punctuated_word ?? word.word).join(" ");
  };

  const getCurrentUtterance = useCallback(() => {
    // console.log("updated transcriptParts: ", transcriptParts);
    return transcriptParts.filter(({ is_final, speech_final }, i, arr) => {
      return is_final || speech_final || (!is_final && i === arr.length - 1);
    });
  }, [transcriptParts]);

  useEffect(() => {
    setupMicrophone();
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 1500,
      });
    }
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        // console.log("Send data to deepgram via websocket: ", e.data);
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const content = utteranceText(data);
      // console.log("onTranscript data: ", data);
      // console.log("onTranscript content: ", content);

      if (content !== "") {
        addTranscriptPart({
          is_final: data.is_final,
          speech_final: data.speech_final,
          text: content,
        });
      }
    };

    const onInput = () => {
      if (audioSourceRef.current) {
        const stream = audioSourceRef.current.mediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    if (connectionState === SOCKET_STATES.open) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onInput); // Stop the audio input stream, but only after the data has been sent to Deepgram
    }

    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onInput);
      // clearTimeout(captionTimeout.current);
    };
  }, [connectionState]);

  const sendMessageTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!microphone || !connection) return;

    const parts = getCurrentUtterance();
    const last = parts[parts.length - 1];
    const content = parts
      .map(({ text }) => text)
      .join(" ")
      .trim();

    setCurrentUtterance(content);
    props.setInputValue(content);
    setIsFinalUtterance(last?.speech_final || false);
  }, [getCurrentUtterance]);

  useEffect(() => {
    if (currentUtterance === undefined) return;

    if (sendMessageTimeout.current) {
      clearTimeout(sendMessageTimeout.current);
    }

    if (currentUtterance !== "") {
      sendMessageTimeout.current = setTimeout(() => {
        props.handleSendMessage();
        clearTranscriptParts();
        setCurrentUtterance("");

        sendMessageTimeout.current = null;
      }, 1500);
    }
  }, [currentUtterance, isFinalUtterance]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === SOCKET_STATES.open
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }
    }

    return () => {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }
    };
  }, [microphoneState, connectionState]);

  const toggleMic = () => {
    if (connectionState != SOCKET_STATES.open) {
      return;
    }

    if (!props.isMicOn) {
      if (microphone?.state !== "recording") {
        console.log("start microphone");
        startMicrophone();
      }
    } else {
      if (microphone?.state === "recording") {
        console.log("stop microphone");
        stopMicrophone();
      }
    }
    props.setIsMicOn(!props.isMicOn);
    clearTranscriptParts();
    setCurrentUtterance("");

    sendMessageTimeout.current = null;

    console.log("Before clearing, transcriptParts:", transcriptParts);
  };

  useEffect(() => {
    console.log("connectionState: ", connectionState);
  }, [connectionState]);

  useEffect(() => {
    if (props.toggleMicFunction) {
      props.toggleMicFunction = toggleMic;
    }
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        onClick={toggleMic}
        className="flex items-center justify-center"
        disabled={getCurrentUtterance().length > 0}
      >
        {connectionState !== SOCKET_STATES.open ? (
          <Loader2 className="animate-spin" />
        ) : props.isMicOn ? (
          <Mic />
        ) : (
          <MicOff />
        )}
      </Button>
    </>
  );
}

export function MicButton(props: BaseMicButtonProps) {
  return (
    <DeepgramContextProvider>
      <MicrophoneContextProvider>
        <BaseMicButton {...props} />
      </MicrophoneContextProvider>
    </DeepgramContextProvider>
  );
}
