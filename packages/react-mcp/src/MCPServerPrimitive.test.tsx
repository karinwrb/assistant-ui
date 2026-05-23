import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MCPServerPrimitive, useMCPServer } from "./MCPServerPrimitive";

function StatusDisplay() {
  const { status, error, url, toolNames } = useMCPServer();
  return (
    <div>
      <span data-testid="url">{url}</span>
      <span data-testid="status">{status}</span>
      <span data-testid="error">{error?.message ?? ""}</span>
      <span data-testid="tool-count">{toolNames.length}</span>
    </div>
  );
}

describe("MCPServerPrimitive", () => {
  it("renders children and transitions to connected for valid URL", async () => {
    render(
      <MCPServerPrimitive.Root url="http://localhost:3000" toolNames={["tool_a", "tool_b"]}>
        <StatusDisplay />
      </MCPServerPrimitive.Root>
    );

    expect(screen.getByTestId("status").textContent).toBe("connecting");

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("connected");
    });

    expect(screen.getByTestId("url").textContent).toBe("http://localhost:3000");
    expect(screen.getByTestId("tool-count").textContent).toBe("2");
    expect(screen.getByTestId("error").textContent).toBe("");
  });

  it("transitions to error for invalid URL", async () => {
    render(
      <MCPServerPrimitive.Root url="invalid-url">
        <StatusDisplay />
      </MCPServerPrimitive.Root>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("error");
    });

    expect(screen.getByTestId("error").textContent).toContain("Invalid MCP server URL");
  });

  it("renders ServerUrl component", async () => {
    render(
      <MCPServerPrimitive.Root url="http://example.com">
        <MCPServerPrimitive.ServerUrl />
      </MCPServerPrimitive.Root>
    );
    expect(screen.getByText("http://example.com")).toBeTruthy();
  });

  it("throws when useMCPServer used outside Root", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<StatusDisplay />)).toThrow(
      "useMCPServer must be used within MCPServerPrimitive.Root"
    );
    consoleError.mockRestore();
  });
});
