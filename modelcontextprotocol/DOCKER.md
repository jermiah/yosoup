# Docker Setup

This document explains how to build and run the Perplexity MCP Server using Docker.

## Prerequisites

- Docker installed on your system
- A Perplexity API key from the [API Portal](https://www.perplexity.ai/account/api/group)

## Building the Docker Image

Build the Docker image from the project root:

```bash
docker build -t perplexity-mcp-server .
```

## Running the Container

### Basic Usage

Run the container with your API key:

```bash
docker run --rm -e PERPLEXITY_API_KEY=your_key_here perplexity-mcp-server
```

### With Custom Timeout

Set a custom timeout for requests (default is 5 minutes):

```bash
docker run --rm \
  -e PERPLEXITY_API_KEY=your_key_here \
  -e PERPLEXITY_TIMEOUT_MS=600000 \
  perplexity-mcp-server
```

### With Proxy Support

If you're behind a corporate proxy, configure it:

```bash
docker run --rm \
  -e PERPLEXITY_API_KEY=your_key_here \
  -e PERPLEXITY_PROXY=https://your-proxy-host:8080 \
  perplexity-mcp-server
```

Or with authentication:

```bash
docker run --rm \
  -e PERPLEXITY_API_KEY=your_key_here \
  -e PERPLEXITY_PROXY=https://username:password@your-proxy-host:8080 \
  perplexity-mcp-server
```

### Using Environment File

Create a `.env` file:

```bash
PERPLEXITY_API_KEY=your_key_here
PERPLEXITY_TIMEOUT_MS=600000
PERPLEXITY_PROXY=https://your-proxy-host:8080
```

Then run:

```bash
docker run --rm --env-file .env perplexity-mcp-server
```

## Integration with MCP Clients

When using Docker with MCP clients, configure them to run the Docker container. For example, in Cursor/VS Code's `mcp.json`:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "PERPLEXITY_API_KEY=your_key_here",
        "perplexity-mcp-server"
      ]
    }
  }
}
```

> **Note**: Docker-based MCP server configuration may have limitations compared to direct `npx` usage. For most use cases, the `npx` method documented in the main README is recommended.

