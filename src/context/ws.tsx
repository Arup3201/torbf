import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

interface WSHook {
  url: string;
}

function useWebSocket({ url }: WSHook) {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {};
    socket.onmessage = () => {};
    socket.onerror = () => {};
    socket.onclose = () => {};
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close(1000, "hook cleanup");
    };
  }, [connect]);

  return { wsRef };
}

interface WSProvider {
  url: string;
  children: React.ReactNode;
}

interface WSContext {
  wsRef: React.RefObject<WebSocket | null>;
}

const WebSocketContext = createContext<WSContext | null>(null);

const WebSocketProvider: React.FC<WSProvider> = ({ url, children }) => {
  const ws = useWebSocket({ url });

  return (
    <WebSocketContext.Provider value={{ ...ws }}>
      {children}
    </WebSocketContext.Provider>
  );
};

function useSocket() {
  return useContext(WebSocketContext);
}

export { WebSocketProvider, useSocket };
