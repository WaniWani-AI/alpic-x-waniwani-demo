import "dotenv/config";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "../server/src/app.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res, next) => {
	try {
		// Stateless session management: reuse incoming session ID or generate a new one.
		// Transport's own session validation is disabled (serverless = no shared state),
		// so we handle the header manually.
		const incomingSessionId =
			(req.headers["mcp-session-id"] as string) ||
			(req.headers["x-waniwani-session-id"] as string);

		console.log("INCOMING SESSION ID IS", incomingSessionId);
		console.log("REQUEST HEADERS ARE", req.headers);
		const sessionId = incomingSessionId || crypto.randomUUID();

		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
		});
		res.on("close", () => {
			transport.close();
		});
		console.log("YOUR SESSION ID IS", sessionId);
		// Echo session ID back on both headers so the client and SDK can pick it up
		res.setHeader("Mcp-Session-Id", sessionId);
		res.setHeader("X-Waniwani-Session-Id", sessionId);
		await server.connect(transport);
		req.url = req.originalUrl;
		await transport.handleRequest(req, res, req.body);
	} catch (error) {
		console.error("ERROR HANDLING MCP REQUEST", error);
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
