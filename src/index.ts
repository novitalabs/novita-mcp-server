import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {  registerAllTools } from "./tools.js";

async function runServer() {
    if (!process.env.NOVITA_API_KEY) {
        console.error("NOVITA_API_KEY environment variable is required");
        process.exit(1);
    }

    // Create an MCP server
    const server = new McpServer({
        name: "novitalabs/novita-mcp-server",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });

    registerAllTools(server);

    const transport = new StdioServerTransport();
    server.connect(transport);
}

// Start receiving messages on stdin and sending messages on stdout
runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
