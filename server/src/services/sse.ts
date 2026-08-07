import { Response } from "express";

/** Equivalent of app.api.v1.admin.SSEManager — broadcasts JSON events to all connected SSE clients. */
class SSEManager {
  private connections = new Set<Response>();

  connect(res: Response): void {
    this.connections.add(res);
  }

  disconnect(res: Response): void {
    this.connections.delete(res);
  }

  broadcast(data: Record<string, unknown>): void {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of this.connections) {
      res.write(payload);
    }
  }
}

export const sseManager = new SSEManager();

// Heartbeat every 30s, matching the 30s asyncio.wait_for timeout -> heartbeat behavior.
setInterval(() => {
  sseManager.broadcast({ type: "heartbeat" });
}, 30_000);
