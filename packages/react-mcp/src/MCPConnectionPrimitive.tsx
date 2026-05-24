import React, { createContext, useContext, useEffect, useState } from "react";

export type MCPConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface MCPConnectionState {
  status: MCPConnectionStatus;
  serverCount: number;
  activeServerCount: number;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

const MCPConnectionContext = createContext<MCPConnectionState | null>(null);

export function useMCPConnection(): MCPConnectionState {
  const ctx = useContext(MCPConnectionContext);
  if (!ctx) throw new Error("useMCPConnection must be used within MCPConnectionPrimitive.Root");
  return ctx;
}

export interface RootProps {
  serverUrls: string[];
  children: React.ReactNode;
  onStatusChange?: (status: MCPConnectionStatus) => void;
  /** Delay in ms before transitioning from "connecting" to "connected". Defaults to 500. */
  connectDelay?: number;
}

function Root({ serverUrls, children, onStatusChange, connectDelay = 500 }: RootProps) {
  const [status, setStatus] = useState<MCPConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  const updateStatus = (next: MCPConnectionStatus) => {
    setStatus(next);
    onStatusChange?.(next);
  };

  const connect = () => {
    updateStatus("connecting");
    setError(null);
    setTimeout(() => updateStatus("connected"), connectDelay);
  };

  const disconnect = () => {
    updateStatus("disconnected");
  };

  useEffect(() => {
    if (serverUrls.length > 0) connect();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrls.join(",")]);

  const value: MCPConnectionState = {
    status,
    serverCount: serverUrls.length,
    activeServerCount: status === "connected" ? serverUrls.length : 0,
    error,
    connect,
    disconnect,
  };

  return (
    <MCPConnectionContext.Provider value={value}>
      {children}
    </MCPConnectionContext.Provider>
  );
}

function ConnectionStatus() {
  const { status } = useMCPConnection();
  return <span data-status={status}>{status}</span>;
}

function ServerCount() {
  const { serverCount } = useMCPConnection();
  return <span>{serverCount}</span>;
}

function ActiveServerCount() {
  const { activeServerCount } = useMCPConnection();
  return <span>{activeServerCount}</span>;
}

function ErrorMessage() {
  const { error } = useMCPConnection();
  if (!error) return null;
  return <span role="alert">{error}</span>;
}

export const MCPConnectionPrimitive = { Root, ConnectionStatus, ServerCount, ActiveServerCount, ErrorMessage };
