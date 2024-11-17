"use client";

import {
  createClient,
  LiveClient,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
} from "react";

interface DeepgramContextType {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(
  undefined
);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  const response = await fetch("/api/authenticate-deepgram", {
    cache: "no-store",
  });
  const result = await response.json();
  return result.key;
};

const DeepgramContextProvider: FunctionComponent<
  DeepgramContextProviderProps
> = ({ children }) => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(
    SOCKET_STATES.closed
  );

  const connectToDeepgram = async (options: LiveSchema, endpoint?: string) => {
    const key = await getApiKey();
    const deepgram = createClient(key);

    const conn = deepgram.listen.live(options, endpoint);

    conn.addListener(LiveTranscriptionEvents.Open, () => {
      setConnectionState(SOCKET_STATES.open);
    });

    conn.addListener(LiveTranscriptionEvents.Close, () => {
      setConnectionState(SOCKET_STATES.closed);
    });

    setConnection(conn);
  };

  const disconnectFromDeepgram = async () => {
    if (connection) {
      connection.finish();
      setConnection(null);
    }
  };

  return (
    <DeepgramContext.Provider
      value={{
        connection,
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error(
      "useDeepgram must be used within a DeepgramContextProvider"
    );
  }
  return context;
}

export {
  DeepgramContextProvider,
  useDeepgram,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
};
