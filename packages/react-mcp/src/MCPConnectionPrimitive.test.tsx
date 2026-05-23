import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MCPConnectionPrimitive, useMCPConnection } from "./MCPConnectionPrimitive";

function StatusDisplay() {
  const { status, serverCount, activeServerCount } = useMCPConnection();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="server-count">{serverCount}</span>
      <span data-testid="active-count">{activeServerCount}</span>
    </div>
  );
}

function Wrapper({ urls }: { urls: string[] }) {
  return (
    <MCPConnectionPrimitive.Root serverUrls={urls}>
      <StatusDisplay />
    </MCPConnectionPrimitive.Root>
  );
}

describe("MCPConnectionPrimitive", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("starts connecting when serverUrls provided", () => {
    render(<Wrapper urls={["http://localhost:3001"]} />);
    expect(screen.getByTestId("status").textContent).toBe("connecting");
  });

  it("transitions to connected after timeout", async () => {
    render(<Wrapper urls={["http://localhost:3001"]} />);
    act(() => jest.advanceTimersByTime(600));
    expect(screen.getByTestId("status").textContent).toBe("connected");
  });

  it("reports correct server count", () => {
    render(<Wrapper urls={["http://a.com", "http://b.com"]} />);
    expect(screen.getByTestId("server-count").textContent).toBe("2");
  });

  it("shows active count only when connected", async () => {
    render(<Wrapper urls={["http://a.com", "http://b.com"]} />);
    expect(screen.getByTestId("active-count").textContent).toBe("0");
    act(() => jest.advanceTimersByTime(600));
    expect(screen.getByTestId("active-count").textContent).toBe("2");
  });

  it("starts disconnected with no urls", () => {
    render(<Wrapper urls={[]} />);
    expect(screen.getByTestId("status").textContent).toBe("disconnected");
  });

  it("throws when used outside Root", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<StatusDisplay />)).toThrow(
      "useMCPConnection must be used within MCPConnectionPrimitive.Root"
    );
    spy.mockRestore();
  });

  it("calls onStatusChange callback", () => {
    const onStatusChange = jest.fn();
    render(
      <MCPConnectionPrimitive.Root serverUrls={["http://localhost:3001"]} onStatusChange={onStatusChange}>
        <div />
      </MCPConnectionPrimitive.Root>
    );
    expect(onStatusChange).toHaveBeenCalledWith("connecting");
    act(() => jest.advanceTimersByTime(600));
    expect(onStatusChange).toHaveBeenCalledWith("connected");
  });
});
