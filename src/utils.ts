#!/usr/bin/env node

import fetch from "node-fetch";

export function clearSensitiveInfo(data: any) {
    if (data && data.instances) {
        data.instances = data.instances.map((instance: any) => ({
            ...instance,
            sshPassword: undefined
        }));
    }
}

// Helper function to make authenticated API requests to Novita AI
export async function novitaRequest(
    endpoint: string,
    method: string = "GET",
    body: any = null
) {
    // Base URL for Novita AI API
    const API_BASE_URL = "https://api.novita.ai/gpu-instance/openapi/v1";
    // Get API key from environment variable
    const API_KEY = process.env.NOVITA_API_KEY;

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
    };
    const options: any = {
        method,
        headers,
    };

    if (body && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Novita AI API Error: ${response.status} - ${errorText}`);
        }
        // Some endpoints might not return JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        return { success: true, status: response.status };
    }
    catch (error) {
        console.error("Error calling Novita AI API:", error);
        throw error;
    }
}
