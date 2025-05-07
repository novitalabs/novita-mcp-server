# Novita AI MCP Server

`novita-mcp-server` is a Model Context Protocol (MCP) server that provides seamless interaction with Novita AI platform resources. We recommend accessing this server through [Claude Desktop](https://claude.ai/download), [Cursor](https://www.cursor.com/), or any other compatible MCP client.

## Features

> ⚠️ **Beta Notice**: `novita-mcp-server` is currently in beta and only supports GPU instance management. Additional resource types will be supported in future releases.

Currently, `novita-mcp-server` enables management the resources of [GPU instances product](https://novita.ai/gpus-console). 

Supported operations are as follows:
- Cluster(/Region): List;
- Product: List;
- GPU Instance: List, Get, Create, Start, Stop, Delete, Restart;
- Template: List, Get, Create, Delete;
- Container Registry Auth: List, Create, Delete;
- Network Storage: List, Create, Update, Delete;

## Installation

You can install the package using either npm, mcp-get, or Smithery:

Using npm:
```bash
npm install -g @novitalabs/novita-mcp-server
```

## Configuration to use novita-mcp-server

First, you need to get your Novita API key from the [Novita AI Key Management](https://novita.ai/settings/key-management).

And next, you can use the following configuration for both Claude Desktop and Cursor:

> 📌 **Tips**
> 
> For Claude Desktop, you can refer to the [Claude Desktop MCP Quickstart](https://modelcontextprotocol.io/quickstart/user) guide to learn how to configure the MCP server.
> 
> For Cursor, you can refer to the [Cursor MCP Quickstart](https://docs.cursor.com/context/model-context-protocol) guide to learn how to configure the MCP server.

```json
{
  "mcpServers": {
    "@novitalabs/novita-mcp-server": {
      "command": "npx",
      "args": ["-y", "@novitalabs/novita-mcp-server"],
      "env": {
        "NOVITA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Testing

This project uses Jest for testing. The tests are located in the src/__tests__ directory.

You can run the tests using one of the following commands:

```bash
npm test
```
