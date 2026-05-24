import React from "react";
import { render, screen } from "@testing-library/react";
import {
  MCPToolCallPrimitive,
  useMCPToolCall,
  type MCPToolCallState,
} from "./MCPToolCallPrimitive";

const defaultState: MCPToolCallState = {
  toolName: "search_web",
  toolCallId: "call_abc123",
  args: { query: "assistant-ui" },
  status: "success",
  result: { hits: 42 },
};

function Wrapper({
  state,
  children,
}: {
  state?: Partial<MCPToolCallState>;
  children: React.ReactNode;
}) {
  return (
    <MCPToolCallPrimitive.Root {...defaultState} {...state}>
      {children}
    </MCPToolCallPrimitive.Root>
  );
}

describe("MCPToolCallPrimitive", () => {
  it("renders ToolName", () => {
    render(
      <Wrapper>
        <MCPToolCallPrimitive.ToolName />
      </Wrapper>
    );
    expect(screen.getByText("search_web")).toBeInTheDocument();
  });

  it("renders Status", () => {
    render(
      <Wrapper>
        <MCPToolCallPrimitive.Status />
      </Wrapper>
    );
    expect(screen.getByText("success")).toBeInTheDocument();
  });

  it("renders Result when status is success", () => {
    render(
      <Wrapper>
        <MCPToolCallPrimitive.Result />
      </Wrapper>
    );
    expect(screen.getByText(/hits/)).toBeInTheDocument();
  });

  it("does not render Result when status is pending", () => {
    render(
      <Wrapper state={{ status: "pending", result: undefined }}>
        <MCPToolCallPrimitive.Result />
      </Wrapper>
    );
    expect(screen.queryByTestId("mcp-result")).toBeNull();
  });

  // Also verify that result is not rendered when status is "running",
  // since a tool call in progress shouldn't expose partial results.
  it("does not render Result when status is running", () => {
    render(
      <Wrapper state={{ status: "running", result: undefined }}>
        <MCPToolCallPrimitive.Result />
      </Wrapper>
    );
    expect(screen.queryByTestId("mcp-result")).toBeNull();
  });

  it("renders ErrorMessage when status is error", () => {
    render(
      <Wrapper state={{ status: "error", error: "Tool not found" }}>
        <MCPToolCallPrimitive.ErrorMessage />
      </Wrapper>
    );
    expect(screen.getByText("Tool not found")).toBeInTheDocument();
  });

  it("throws when useMCPToolCall used outside Root", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    function Bad() {
      useMCPToolCall();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(
      "useMCPToolCall must be used within a MCPToolCallPrimitive.Root"
    );
    spy.mockRestore();
  });
});
