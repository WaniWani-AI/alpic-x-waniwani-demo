# Alpic x WaniWani Demo

A demo app showcasing [Alpic](https://alpic.ai/) and [WaniWani](https://waniwani.com/) working together to build a rich, interactive ski lesson booking experience inside ChatGPT.

The app uses an MCP server with guided conversation flows and interactive widgets — letting users browse lesson plans, pick an instructor, and receive a confirmed ski pass, all within the chat.

## Getting Started

### Prerequisites

- Node.js 24+
- HTTP tunnel such as [ngrok](https://ngrok.com/download) or [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide)

### Setup

```bash
git clone git@github.com:WaniWani-AI/alpic-x-waniwani-demo.git
cd alpic-x-waniwani-demo
cp .env.example .env   # add your WaniWani API key (https://docs.waniwani.ai/setup/api-key)
npm install
```

### Local Development

Start the development server:

```bash
npm run dev
```

- DevTools: http://localhost:3000/
- MCP server: http://localhost:3000/mcp

### Connect to ChatGPT

1. Expose your server publicly:
```bash
ngrok http 3000
```
2. In ChatGPT, go to **Settings → Connectors → Create** and add the ngrok URL suffixed with `/mcp` (e.g. `https://abc123.ngrok-free.app/mcp`)

## Deploy to Production

Use [Alpic](https://alpic.ai/) to deploy to production:

[![Deploy on Alpic](https://assets.alpic.ai/button.svg)](https://app.alpic.ai/new/clone?repositoryUrl=https%3A%2F%2Fgithub.com%2FWaniWani-AI%2Falpic-x-waniwani-demo)

Then add your MCP server URL in ChatGPT under **Settings → Connectors → Create** (e.g. `https://your-app.alpic.live`).

## Resources

- [Alpic Documentation](https://docs.alpic.ai/)
- [WaniWani Documentation](https://docs.waniwani.ai/introduction)
- [Skybridge Documentation](https://docs.skybridge.tech)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
