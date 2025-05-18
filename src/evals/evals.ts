//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const listClustersEval: EvalFunction = {
    name: "list-clusters Tool Evaluation",
    description: "Evaluates the functionality of listing clusters",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Can you list the clusters in the system?");
        return JSON.parse(result);
    }
};

const listProductsEval: EvalFunction = {
    name: 'List Products Tool Evaluation',
    description: 'Evaluates listing products functionality with optional cluster ID and product name filters',
    run: async () => {
        const result = await grade(openai("gpt-4"), "List all products from cluster ID 'c-123' filtered by the product name 'widget'.");
        return JSON.parse(result);
    }
};

const listGpuInstancesEval: EvalFunction = {
    name: 'list-gpu-instances Evaluation',
    description: 'Evaluates the functionality of listing GPU instances with various filters',
    run: async () => {
        const result = await grade(openai("gpt-4"), "List the GPU instances that are currently running with name containing 'test' and page size 2.");
        return JSON.parse(result);
    }
};

const getGpuInstanceEval: EvalFunction = {
    name: 'get-gpu-instance Evaluation',
    description: 'Evaluates the GPU instance retrieval tool',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please retrieve the GPU instance details for the ID gpux-12345.");
        return JSON.parse(result);
    }
};

const createGpuInstanceEval: EvalFunction = {
    name: 'create-gpu-instance Tool Evaluation',
    description: 'Evaluates the create-gpu-instance tool functionality',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please create a GPU instance named 'mygpu-01' using product ID 'prod-123gpu' of type 'gpu' with 1 GPU, a root filesystem size of 10 GB, and the Docker image 'docker.io/nginx:latest'.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [listClustersEval, listProductsEval, listGpuInstancesEval, getGpuInstanceEval, createGpuInstanceEval]
};
  
export default config;
  
export const evals = [listClustersEval, listProductsEval, listGpuInstancesEval, getGpuInstanceEval, createGpuInstanceEval];