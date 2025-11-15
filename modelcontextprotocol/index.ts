#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { fetch as undiciFetch, ProxyAgent } from "undici";

/**
 * Definition of the Perplexity Ask Tool.
 * This tool accepts an array of messages and returns a chat completion response
 * from the Perplexity API, with citations appended to the message if provided.
 */
const PERPLEXITY_ASK_TOOL: Tool = {
  name: "perplexity_ask",
  title: "Ask Perplexity",
  description:
    "Engages in a conversation using the Sonar API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a ask completion response from the Perplexity model.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
    },
    required: ["messages"],
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
};

/**
 * Definition of the Perplexity Research Tool.
 * This tool performs deep research queries using the Perplexity API.
 */
const PERPLEXITY_RESEARCH_TOOL: Tool = {
  name: "perplexity_research",
  title: "Deep Research",
  description:
    "Performs deep research using the Perplexity API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a comprehensive research response with citations.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      strip_thinking: {
        type: "boolean",
        description: "If true, removes <think>...</think> tags and their content from the response to save context tokens. Default is false.",
      },
    },
    required: ["messages"],
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
};

/**
 * Definition of the Perplexity Reason Tool.
 * This tool performs reasoning queries using the Perplexity API.
 */
const PERPLEXITY_REASON_TOOL: Tool = {
  name: "perplexity_reason",
  title: "Advanced Reasoning",
  description:
    "Performs reasoning tasks using the Perplexity API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a well-reasoned response using the sonar-reasoning-pro model.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      strip_thinking: {
        type: "boolean",
        description: "If true, removes <think>...</think> tags and their content from the response to save context tokens. Default is false.",
      },
    },
    required: ["messages"],
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
};

/**
 * Definition of the Perplexity Search Tool.
 * This tool performs web search using the Perplexity Search API.
 */
const PERPLEXITY_SEARCH_TOOL: Tool = {
  name: "perplexity_search",
  title: "Search the Web",
  description:
    "Performs web search using the Perplexity Search API. " +
    "Returns ranked search results with titles, URLs, snippets, and metadata. " +
    "Perfect for finding up-to-date facts, news, or specific information.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query string",
      },
      max_results: {
        type: "number",
        description: "Maximum number of results to return (1-20, default: 10)",
        minimum: 1,
        maximum: 20,
      },
      max_tokens_per_page: {
        type: "number",
        description: "Maximum tokens to extract per webpage (default: 1024)",
        minimum: 256,
        maximum: 2048,
      },
      country: {
        type: "string",
        description: "ISO 3166-1 alpha-2 country code for regional results (e.g., 'US', 'GB')",
      },
    },
    required: ["query"],
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
};

// Retrieve the Perplexity API key from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is required");
  process.exit(1);
}

/**
 * Gets the proxy URL from environment variables.
 * Checks PERPLEXITY_PROXY, HTTPS_PROXY, HTTP_PROXY in order.
 * 
 * @returns {string | undefined} The proxy URL if configured, undefined otherwise
 */
function getProxyUrl(): string | undefined {
  return process.env.PERPLEXITY_PROXY || 
         process.env.HTTPS_PROXY || 
         process.env.HTTP_PROXY || 
         undefined;
}

/**
 * Creates a proxy-aware fetch function.
 * Uses undici with ProxyAgent when a proxy is configured, otherwise uses native fetch.
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
async function proxyAwareFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const proxyUrl = getProxyUrl();
  
  if (proxyUrl) {
    // Use undici with ProxyAgent when proxy is configured
    const proxyAgent = new ProxyAgent(proxyUrl);
    const response = await undiciFetch(url, {
      ...options,
      dispatcher: proxyAgent,
    } as any);
    // Cast to native Response type for compatibility
    return response as unknown as Response;
  } else {
    // Use native fetch when no proxy is configured
    return fetch(url, options);
  }
}

/**
 * Validates an array of message objects for chat completion tools.
 * Ensures each message has a valid role and content field.
 *
 * @param {any} messages - The messages to validate
 * @param {string} toolName - The name of the tool calling this validation (for error messages)
 * @throws {Error} If messages is not an array or if any message is invalid
 */
function validateMessages(messages: any, toolName: string): void {
  if (!Array.isArray(messages)) {
    throw new Error(`Invalid arguments for ${toolName}: 'messages' must be an array`);
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') {
      throw new Error(`Invalid message at index ${i}: must be an object`);
    }
    if (!msg.role || typeof msg.role !== 'string') {
      throw new Error(`Invalid message at index ${i}: 'role' must be a string`);
    }
    if (msg.content === undefined || msg.content === null || typeof msg.content !== 'string') {
      throw new Error(`Invalid message at index ${i}: 'content' must be a string`);
    }
  }
}

/**
 * Strips thinking tokens (content within <think>...</think> tags) from the response.
 * This helps reduce context usage when the thinking process is not needed.
 *
 * @param {string} content - The content to process
 * @returns {string} The content with thinking tokens removed
 */
function stripThinkingTokens(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

/**
 * Performs a chat completion by sending a request to the Perplexity API.
 * Appends citations to the returned message content if they exist.
 *
 * @param {Array<{ role: string; content: string }>} messages - An array of message objects.
 * @param {string} model - The model to use for the completion.
 * @param {boolean} stripThinking - If true, removes <think>...</think> tags from the response.
 * @returns {Promise<string>} The chat completion result with appended citations.
 * @throws Will throw an error if the API request fails.
 */
export async function performChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = "sonar-pro",
  stripThinking: boolean = false
): Promise<string> {
  // Read timeout fresh each time to respect env var changes
  const TIMEOUT_MS = parseInt(process.env.PERPLEXITY_TIMEOUT_MS || "300000", 10);

  // Construct the API endpoint URL and request body
  const url = new URL("https://api.perplexity.ai/chat/completions");
  const body = {
    model: model, // Model identifier passed as parameter
    messages: messages,
    // Additional parameters can be added here if required (e.g., max_tokens, temperature, etc.)
    // See the Sonar API documentation for more details:
    // https://docs.perplexity.ai/api-reference/chat-completions
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await proxyAwareFetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity API did not respond within ${TIMEOUT_MS}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  // Check for non-successful HTTP status
  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  // Attempt to parse the JSON response from the API
  let data;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response from Perplexity API: ${jsonError}`);
  }

  // Validate response structure
  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    throw new Error("Invalid API response: missing or empty choices array");
  }

  const firstChoice = data.choices[0];
  if (!firstChoice.message || typeof firstChoice.message.content !== 'string') {
    throw new Error("Invalid API response: missing message content");
  }

  // Directly retrieve the main message content from the response
  let messageContent = firstChoice.message.content;

  // Strip thinking tokens if requested
  if (stripThinking) {
    messageContent = stripThinkingTokens(messageContent);
  }

  // If citations are provided, append them to the message content
  if (data.citations && Array.isArray(data.citations) && data.citations.length > 0) {
    messageContent += "\n\nCitations:\n";
    data.citations.forEach((citation: string, index: number) => {
      messageContent += `[${index + 1}] ${citation}\n`;
    });
  }

  return messageContent;
}

/**
 * Formats search results from the Perplexity Search API into a readable string.
 *
 * @param {any} data - The search response data from the API.
 * @returns {string} Formatted search results.
 */
export function formatSearchResults(data: any): string {
  if (!data.results || !Array.isArray(data.results)) {
    return "No search results found.";
  }

  let formattedResults = `Found ${data.results.length} search results:\n\n`;
  
  data.results.forEach((result: any, index: number) => {
    formattedResults += `${index + 1}. **${result.title}**\n`;
    formattedResults += `   URL: ${result.url}\n`;
    if (result.snippet) {
      formattedResults += `   ${result.snippet}\n`;
    }
    if (result.date) {
      formattedResults += `   Date: ${result.date}\n`;
    }
    formattedResults += `\n`;
  });

  return formattedResults;
}

/**
 * Performs a web search using the Perplexity Search API.
 *
 * @param {string} query - The search query string.
 * @param {number} maxResults - Maximum number of results to return (1-20).
 * @param {number} maxTokensPerPage - Maximum tokens to extract per webpage.
 * @param {string} country - Optional ISO country code for regional results.
 * @returns {Promise<string>} The formatted search results.
 * @throws Will throw an error if the API request fails.
 */
export async function performSearch(
  query: string,
  maxResults: number = 10,
  maxTokensPerPage: number = 1024,
  country?: string
): Promise<string> {
  // Read timeout fresh each time to respect env var changes
  const TIMEOUT_MS = parseInt(process.env.PERPLEXITY_TIMEOUT_MS || "300000", 10);

  const url = new URL("https://api.perplexity.ai/search");
  const body: any = {
    query: query,
    max_results: maxResults,
    max_tokens_per_page: maxTokensPerPage,
  };

  if (country) {
    body.country = country;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await proxyAwareFetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity Search API did not respond within ${TIMEOUT_MS}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity Search API: ${error}`);
  }

  // Check for non-successful HTTP status
  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity Search API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response from Perplexity Search API: ${jsonError}`);
  }

  return formatSearchResults(data);
}

// Initialize the server with tool metadata and capabilities
const server = new Server(
  {
    name: "io.github.perplexityai/mcp-server",
    version: "0.4.1",
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: `You are the Perplexity MCP Server. Use these tools appropriately:

- perplexity_search: For quick web searches when you need current information or facts. Returns ranked search results.

- perplexity_ask: For general questions and conversational queries with real-time web search using the sonar-pro model.

- perplexity_research: For deep, comprehensive research requiring thorough analysis using the sonar-deep-research model. Use this for complex topics that require detailed investigation.

- perplexity_reason: For complex analytical tasks requiring advanced reasoning using the sonar-reasoning-pro model. Use this for logical problems, analysis, and decision-making.

When using perplexity_research or perplexity_reason, consider setting strip_thinking=true to save context tokens if the reasoning process isn't needed in the final output.`,
  }
);

/**
 * Registers a handler for listing available tools.
 * When the client requests a list of tools, this handler returns all available Perplexity tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [PERPLEXITY_ASK_TOOL, PERPLEXITY_RESEARCH_TOOL, PERPLEXITY_REASON_TOOL, PERPLEXITY_SEARCH_TOOL],
}));

/**
 * Registers a handler for calling a specific tool.
 * Processes requests by validating input and invoking the appropriate tool.
 *
 * @param {object} request - The incoming tool call request.
 * @returns {Promise<object>} The response containing the tool's result or an error.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error("No arguments provided");
    }
    switch (name) {
      case "perplexity_ask": {
        validateMessages(args.messages, "perplexity_ask");
        const messages = args.messages as Array<{ role: string; content: string }>;
        const result = await performChatCompletion(messages, "sonar-pro");
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_research": {
        validateMessages(args.messages, "perplexity_research");
        const messages = args.messages as Array<{ role: string; content: string }>;
        const stripThinking = typeof args.strip_thinking === "boolean" ? args.strip_thinking : false;
        const result = await performChatCompletion(messages, "sonar-deep-research", stripThinking);
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_reason": {
        validateMessages(args.messages, "perplexity_reason");
        const messages = args.messages as Array<{ role: string; content: string }>;
        const stripThinking = typeof args.strip_thinking === "boolean" ? args.strip_thinking : false;
        const result = await performChatCompletion(messages, "sonar-reasoning-pro", stripThinking);
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_search": {
        if (typeof args.query !== "string") {
          throw new Error("Invalid arguments for perplexity_search: 'query' must be a string");
        }
        const { query, max_results, max_tokens_per_page, country } = args;
        const maxResults = typeof max_results === "number" ? max_results : undefined;
        const maxTokensPerPage = typeof max_tokens_per_page === "number" ? max_tokens_per_page : undefined;
        const countryCode = typeof country === "string" ? country : undefined;
        
        const result = await performSearch(
          query,
          maxResults,
          maxTokensPerPage,
          countryCode
        );
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      default:
        // Respond with an error if an unknown tool is requested
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    // Return error details in the response
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Initializes and runs the server using standard I/O for communication.
 * Logs an error and exits if the server fails to start.
 */
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Perplexity MCP Server running on stdio with Ask, Research, Reason, and Search tools");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

// Start the server and catch any startup errors
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
