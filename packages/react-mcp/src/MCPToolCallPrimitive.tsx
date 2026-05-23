import React, { createContext, useContext, type ReactNode } from "react";

export type MCPToolCallStatus = "pending" | "running" | "success" | "error";

export interface MCPToolCallState {
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: MCPToolCallStatus;
  error?: string;
}

const MCPToolCallContext = createContext<MCPToolCallState | null>(null);

export function useMCPToolCall(): MCPToolCallState {
  const ctx = useContext(MCPToolCallContext);
  if (!ctx) {
    throw new Error(
      "useMCPToolCall must be used within a MCPToolCallPrimitive.Root"
    );
  }
  return ctx;
}

function Root({
  children,
  ...state
}: MCPToolCallState & { children: ReactNode }) {
  return (
    <MCPToolCallContext.Provider value={state}>
      {children}
    </MCPToolCallContext.Provider>
  );
}

function ToolName() {
  const { toolName } = useMCPToolCall();
  return <span data-mcp-tool-name>{toolName}</span>;
}

function Status() {
  const { status } = useMCPToolCall();
  return <span data-mcp-status={status}>{status}</span>;
}

function Args({
  render,
}: {
  render?: (args: Record<string, unknown>) => ReactNode;
}) {
  const { args } = useMCPToolCall();
  if (render) return <>{render(args)}</>;
  return <pre data-mcp-args>{JSON.stringify(args, null, 2)}</pre>;
}

function Result({
  render,
}: {
  render?: (result: unknown) => ReactNode;
}) {
  const { result, status } = useMCPToolCall();
  if (status !== "success" || result === undefined) return null;
  if (render) return <>{render(result)}</>;
  return <pre data-mcp-result>{JSON.stringify(result, null, 2)}</pre>;
}

function ErrorMessage() {
  const { error, status } = useMCPToolCall();
  if (status !== "error" || !error) return null;
  return <span data-mcp-error>{error}</span>;
}

export const MCPToolCallPrimitive = {
  Root,
  ToolName,
  Status,
  Args,
  Result,
  ErrorMessage,
};
