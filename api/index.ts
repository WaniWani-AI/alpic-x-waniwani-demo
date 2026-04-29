import "dotenv/config";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "../server/src/app.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res, next) => {
	try {
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => crypto.randomUUID(),
		});
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
