import React, { createContext, useContext, useState, useEffect } from "react";

export type MCPServerStatus = "connecting" | "connected" | "disconnected" | "error";

export interface MCPServerContextValue {
  url: string;
  status: MCPServerStatus;
  error: Error | null;
  toolNames: string[];
}

const MCPServerContext = createContext<MCPServerContextValue | null>(null);

export function useMCPServer(): MCPServerContextValue {
  const ctx = useContext(MCPServerContext);
  if (!ctx) {
    throw new Error("useMCPServer must be used within MCPServerPrimitive.Root");
  }
  return ctx;
}

interface RootProps {
  url: string;
  toolNames?: string[];
  children: React.ReactNode;
}

function Root({ url, toolNames = [], children }: RootProps) {
  const [status, setStatus] = useState<MCPServerStatus>("connecting");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("connecting");
    setError(null);

    const timeout = setTimeout(() => {
      if (!cancelled) {
        try {
          if (!url || !url.startsWith("http")) {
            throw new Error(`Invalid MCP server URL: ${url}`);
          }
          setStatus("connected");
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      setStatus("disconnected");
    };
  }, [url]);

  return (
    <MCPServerContext.Provider value={{ url, status, error, toolNames }}>
      {children}
    </MCPServerContext.Provider>
  );
}

function ServerUrl() {
  const { url } = useMCPServer();
  return <span>{url}</span>;
}

function ServerStatus() {
  const { status } = useMCPServer();
  return <span data-status={status}>{status}</span>;
}

function ToolCount() {
  const { toolNames } = useMCPServer();
  return <span>{toolNames.length}</span>;
}

export const MCPServerPrimitive = { Root, ServerUrl, ServerStatus, ToolCount };
