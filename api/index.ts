import "dotenv/config";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "../server/src/app.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res, next) => {
	try {
		const incomingSessionId = req.headers["mcp-session-id"] as string | undefined;
		const sessionId = incomingSessionId || crypto.randomUUID();

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
