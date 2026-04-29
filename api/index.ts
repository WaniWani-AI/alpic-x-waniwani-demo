import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "../server/src/app.js";

/**
 * Derive a stable session ID for MCP clients that don't send back Mcp-Session-Id.
 * Claude.ai's proxy strips session headers, so we fall back to a deterministic
 * hash of the client IP + user-agent. This gives a stable ID per-client.
 * Proper MCP clients (Claude Code, MCP Tool Jam) send the header and bypass this.
 */
function deriveSessionId(req: express.Request): string {
	const ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "unknown";
	const ua = req.headers["user-agent"] || "unknown";
	return crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex").slice(0, 32);
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res, next) => {
	try {

		console.log("HEADERS ARE", req.headers);

		// Use Mcp-Session-Id if the client sends it (spec-compliant clients).
		// Otherwise derive a stable ID from request fingerprint (for Claude.ai).
		const incomingSessionId = req.headers["mcp-session-id"] as string | undefined;
		const sessionId = incomingSessionId || deriveSessionId(req);

		console.log("SESSION ID IS", sessionId);

		// Use sessionIdGenerator: undefined to skip session validation entirely
		// (in serverless each request is a fresh transport, so validation always fails).
		// Then manually inject the session ID so that:
		//   1. extra.sessionId is populated for tool handlers (WaniWani flows need it)
		//   2. Mcp-Session-Id header is included in responses (so clients send it back)
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
		});
		// biome-ignore lint/suspicious/noExplicitAny: accessing internal to inject session ID in serverless context
		(transport as any)._webStandardTransport.sessionId = sessionId;

		res.setHeader("Mcp-Session-Id", sessionId);
		res.setHeader("X-Waniwani-Session-Id", sessionId);

		res.on("close", () => {
			transport.close();
		});
		await server.connect(transport);
		req.url = req.originalUrl;
		await transport.handleRequest(req, res, req.body);
	} catch (error) {
		next(error);
	}
});

app.use("/mcp", ((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error("Error handling MCP request:", err);
	if (!res.headersSent) {
		res.status(500).json({
			jsonrpc: "2.0",
			error: { code: -32603, message: "Internal server error" },
			id: null,
		});
	}
}) as express.ErrorRequestHandler);

export default app;
