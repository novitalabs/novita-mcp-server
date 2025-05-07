#!/usr/bin/env node

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { novitaRequest, clearSensitiveInfo } from "./utils.js";

export function registerAllTools(server: McpServer) {
    registerClusterTools(server);
    registerProductTools(server);
    registerGPUInstanceTools(server);
    registerNetworkStorageTools(server);
    registerRegistryAuthTools(server);
    registerTemplateTools(server);
}

function registerClusterTools(server: McpServer) {
    server.tool("list-clusters", {}, async () => {
        const result = await novitaRequest("/clusters");
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });
}

function registerProductTools(server: McpServer) {
    server.tool("list-products", {
        clusterId: z
            .string()
            .optional()
            .describe("ID of the cluster to list products from. You can use the `list-clusters` tool to get the cluster ID."),
        productName: z
            .string()
            .optional()
            .describe("Name of the product to filter by."),
    }, async (params) => {
        const queryParams = new URLSearchParams();
        if (params.clusterId)
            queryParams.append("clusterId", params.clusterId);
        if (params.productName)
            queryParams.append("productName", params.productName);
        const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";
        const result = await novitaRequest(`/products${queryString}`);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });
}

function registerGPUInstanceTools(server: McpServer) {
    server.tool("list-gpu-instances", {
        pageSize: z
            .number()
            .min(0)
            .default(10)
            .optional()
            .describe("Number of instances to return, "),
        pageNumber: z
            .number()
            .min(0)
            .default(1)
            .optional()
            .describe("Page number to return, start from "),
        name: z
            .string()
            .max(1024)
            .optional()
            .describe("Filter by the instance name"),
        productName: z
            .string()
            .optional()
            .describe("Filter by the product name"),
        status: z
            .enum(["running", "pulling", "exited", "resetting", "removed", "migrating", "freezing"])
            .optional()
            .describe("Filter by the instance status"),
    }, async (params) => {
        // Construct query parameters
        const queryParams = new URLSearchParams();
        if (params.pageSize)
            queryParams.append("pageSize", params.pageSize.toString());
        if (params.pageNumber)
            queryParams.append("pageNumber", params.pageNumber.toString());
        if (params.name)
            queryParams.append("name", params.name);
        if (params.productName)
            queryParams.append("productName", params.productName);
        if (params.status)
            queryParams.append("status", params.status);
        const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";
        const result = await novitaRequest(`/gpu/instances${queryString}`);
        clearSensitiveInfo(result);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("get-gpu-instance", {
        instanceId: z
            .string()
            .describe("ID of the instance to retrieve"),
    }, async (params) => {
        // Construct query parameters
        const queryParams = new URLSearchParams();
        queryParams.append("instanceId", params.instanceId);
        const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";
        const result = await novitaRequest(`/gpu/instance${queryString}`);
        clearSensitiveInfo(result);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("create-gpu-instance", {
        name: z
            .string()
            .max(255)
            .trim()
            .describe("Name for the instance. Must contain only numbers, letters, and hyphens"),
        productId: z
            .string()
            .nonempty()
            .describe("ID of the product used to deploy the instance. The availableGpuNumber of the product must be greater than 0. You can use the `list-products` tool to get or check the product ID if needed. Before calling the MCP tool, MUST show me the details of the product to help me identify it, including name, price, etc."),
        kind: z
            .enum(["gpu"])
            .default("gpu")
            .describe("Type of the instance"),
        gpuNum: z
            .number()
            .min(1)
            .describe("Number of GPUs allocated to the instance. The availableGpuNumber of the product must be greater than or equal to the gpuNum."),
        rootfsSize: z
            .number()
            .min(10)
            .describe("Root filesystem size (container disk size) in GB. Free tier includes 60GB."),
        imageUrl: z
            .string()
            .trim()
            .nonempty()
            .max(500)
            .describe("Docker image URL to initialize the instance"),
        imageAuthId: z
            .string()
            .optional()
            .describe("ID of the container registry auth. Required only when the imageUrl is private. You can use the `list-container-registry-auths` tool to check the ID if you're not sure."),
        command: z
            .string()
            .max(2048)
            .optional()
            .describe("Container start command to run when the instance starts"),
        ports: z
            .string()
            .optional()
            .describe("Ports to expose (e.g., '8888/http', '22/tcp'), separated by commas if multiple. Maximum of 10 ports."),
        env: z
            .array(z.object({
                key: z.string().nonempty().max(2048).describe("Environment variable key"),
                value: z.string().max(2048).describe("Environment variable value"),
            }))
            .optional()
            .describe("Environment variables"),
        networkStorages: z
            .array(z.object({
                Id: z.string().nonempty().describe("ID of the network storage to mount. You can use the `list-network-storage` tool to get or check the ID if needed. The network storage's cluster must match the product's cluster."),
                mountPoint: z.string().nonempty().describe("Path to mount the network storage"),
            }))
            .optional()
            .describe("Network storages to mount"),
    }, async (params) => {
        const result = await novitaRequest("/gpu/instance/create", "POST", params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("start-gpu-instance", {
        instanceId: z
            .string()
            .describe("ID of the instance to start"),
    }, async (params) => {
        const result = await novitaRequest(`/gpu/instance/start`, "POST", {
            instanceId: params.instanceId,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("stop-gpu-instance", {
        instanceId: z
            .string()
            .describe("ID of the instance to stop. Before calling the MCP tool to stop the instance, MUST show me the details of the instance to help me identify it, including id, name, etc."),
    }, async (params) => {
        const result = await novitaRequest(`/gpu/instance/stop`, "POST", {
            instanceId: params.instanceId,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("delete-gpu-instance", {
        instanceId: z
            .string()
            .describe("ID of the instance to delete. Before calling the MCP tool to delete the instance, MUST show me the details of the instance to help me identify it, including id, name, etc."),
    }, async (params) => {
        const result = await novitaRequest(`/gpu/instance/delete`, "POST", {
            instanceId: params.instanceId,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("restart-gpu-instance", {
        instanceId: z
            .string()
            .describe("ID of the instance to restart. Before calling the MCP tool to restart the instance, MUST show me the details of the instance to help me identify it, including id, name, etc."),
    }, async (params) => {
        const result = await novitaRequest(`/gpu/instance/restart`, "POST", {
            instanceId: params.instanceId,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });
}

function registerTemplateTools(server: McpServer) {
    server.tool("list-templates", {
        pageSize: z
            .number()
            .min(0)
            .default(20)
            .optional()
            .describe("Number of templates to return in each page"),
        pageNum: z
            .number()
            .min(0)
            .default(1)
            .optional()
            .describe("Page number to return, start from 1"),
        type: z
            .enum(["instance", "serverless"])
            .optional()
            .describe("Type of template to return"),
        channel: z
            .enum(["private", "community", "official"])
            .array()
            .optional()
            .describe("Channels of template to return"),
    }, async (params) => {
        const queryParams = new URLSearchParams();
        if (params.pageSize)
            queryParams.append("pageSize", params.pageSize.toString());
        if (params.pageNum)
            queryParams.append("pageNum", params.pageNum.toString());
        if (params.type)
            queryParams.append("type", params.type);
        if (params.channel)
            queryParams.append("channel", params.channel.join(","));
        const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";
        const result = await novitaRequest(`/templates${queryString}`);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("get-template", {
        templateId: z
            .string()
            .describe("ID of the template to retrieve"),
    }, async (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append("templateId", params.templateId);
        const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";
        const result = await novitaRequest(`/template${queryString}`);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("create-template", {
        template: z.object({
            name: z
                .string()
                .min(2)
                .nonempty()
                .trim()
                .describe("Name for the template, must be unique."),
            readme: z
                .string()
                .max(20480)
                .optional()
                .describe("Template README content (in Markdown format)"),
            type: z
                .enum(["instance", "serverless"])
                .default("instance")
                .describe("Type of template"),
            channel: z
                .enum(["private", "community"])
                .default("private")
                .describe("Channel for the template"),
            image: z
                .string()
                .nonempty()
                .max(500)
                .trim()
                .describe("Docker image address for instance startup"),
            imageAuth: z
                .string()
                .trim()
                .optional()
                .describe("ID of the container registry auth. Required only when the channel is private, or else keep it empty. You can use the `list-container-registry-auths` tool to check the ID if you're not sure."),
            startCommand: z
                .string()
                .max(2047)
                .optional()
                .describe("Command to run when the instance starts"),
            rootfsSize: z
                .number()
                .min(10)
                .describe("Root filesystem size (/Container disk size) in GB"),
            ports: z
                .array(z.object({
                    type: z.enum(["http", "udp", "tcp"]).describe("Type of exposed port"),
                    ports: z.array(
                        z.number()
                            .min(1)
                            .max(65535)
                            .describe("Exposed port numbers, maximum of 10")
                    ).max(10).describe("Exposed port numbers, maximum of 10"),
                }))
                .describe("Ports to expose"),
            env: z
                .array(z.object({
                    key: z.string().nonempty().describe("Environment variable key").max(2048),
                    value: z.string().describe("Environment variable value").max(2048),
                }))
                .optional()
                .describe("Environment variables"),
        }),
    }, async (params) => {
        const result = await novitaRequest("/template/create", "POST", params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("delete-template", {
        templateId: z
            .string()
            .nonempty()
            .describe("ID of the template to delete. Please ensure it exists before deleting. Before calling the MCP tool, please show me the name to help identify it. You can use the `get-template` tool to check the ID if needed."),
    }, async (params) => {
        const result = await novitaRequest(`/template/delete`, "POST", {
            templateId: params.templateId,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });
}

function registerRegistryAuthTools(server: McpServer) {
    server.tool("list-container-registry-auths", {}, async () => {
        const result = await novitaRequest("/repository/auths", "GET");
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("create-container-registry-auth", {
        name: z
            .string()
            .nonempty()
            .max(255)
            .describe("Name for the container registry auth."),
        username: z
            .string()
            .nonempty()
            .max(511)
            .describe("Registry username."),
        password: z
            .string()
            .nonempty()
            .max(1024)
            .describe("Registry password."),
    }, async (params) => {
        const result = await novitaRequest("/repository/auth/save", "POST", params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    // Delete Container Registry Auth
    server.tool("delete-container-registry-auth", {
        id: z
            .string()
            .nonempty()
            .describe("ID of the container registry auth to delete. Please ensure it exists before deleting. Before calling the MCP tool, please show me the name to help identify it. You can use the `list-container-registry-auths` tool to check the ID if needed."),
    }, async (params) => {
        const result = await novitaRequest(`/repository/auth/delete`, "POST", {
            id: params.id,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });
}

function registerNetworkStorageTools(server: McpServer) {
    server.tool("create-network-storage", {
        clusterId: z
            .string()
            .describe("The ID of the cluster to create network storage. Must be from the `list-clusters` tool result, and the cluster must have supportNetworkStorage set to true"),
        storageName: z
            .string()
            .nonempty()
            .trim()
            .describe("Name for the network storage. Use only letters, numbers, and hyphens"),
        storageSize: z
            .number()
            .min(10)
            .describe("Size of the network storage in GB"),
    }, async (params) => {
        const result = await novitaRequest("/networkstorage/create", "POST", params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("list-network-storage", {
        pageNo: z
            .number()
            .min(0)
            .default(1)
            .optional()
            .describe("Page number"),
        pageSize: z
            .number()
            .min(0)
            .default(10)
            .optional()
            .describe("Page size"),
        storageName: z
            .string()
            .optional()
            .describe("Name for the network storage"),
        storageId: z
            .string()
            .optional()
            .describe("ID for the network storage"),
    }, async (params) => {
        const queryParams = new URLSearchParams();
        if (params.pageNo)
            queryParams.append("pageNo", params.pageNo.toString());
        if (params.pageSize)
            queryParams.append("pageSize", params.pageSize.toString());
        if (params.storageName)
            queryParams.append("storageName", params.storageName);
        if (params.storageId)
            queryParams.append("storageId", params.storageId);
        const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";
        const result = await novitaRequest(`/networkstorages/list${queryString}`);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    server.tool("update-network-storage", {
        storageId: z
            .string()
            .nonempty()
            .describe("The unique ID of the network storage to update. Please ensure it exists before updating."),
        storageName: z
            .string()
            .optional()
            .describe("New name for the network storage. This is optional, if not provided, the name will not be changed. Use only letters, numbers, and hyphens"),
        storageSize: z
            .number()
            .min(10)
            .describe("New size in GB (must be larger than current size). You can use the `list-network-storage` tool to get the current size if you don't know it."),
    }, async (params) => {
        const result = await novitaRequest(`/networkstorage/update`, "POST", params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });

    // Delete Network Storage
    server.tool("delete-network-storage", {
        storageId: z
            .string()
            .nonempty()
            .describe("The unique ID of the network storage to delete. Please ensure it exists before updating."),
    }, async (params) => {
        const result = await novitaRequest(`/networkstorage/delete`, "POST", params);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    });
}
