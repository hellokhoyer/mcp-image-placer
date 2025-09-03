/**
 * MCP Server handler with proper error handling and protocol compliance
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { PlaceholderGenerator } from './placeholderGenerator.js';
import { ImagePlaceholderParams, ServerConfig, Logger } from '../types/index.js';
import { ImagePlaceholderError, ServerError } from '../errors/index.js';

export class MCPImagePlaceholderServer {
  private server: Server;
  private generator: PlaceholderGenerator;
  private config: ServerConfig;
  private logger: Logger;

  constructor(generator: PlaceholderGenerator, config: ServerConfig, logger: Logger) {
    this.generator = generator;
    this.config = config;
    this.logger = logger;

    this.server = new Server({
      name: config.name,
      version: config.version,
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Sets up MCP protocol handlers
   */
  private setupHandlers(): void {
    // Register the list tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.debug('Handling list tools request');

      return {
        tools: [
          {
            name: 'image_placeholder',
            description:
              'Generate a placeholder image based on a provider, width, and height. Use this tool to generate a placeholder image for testing or development purposes.',
            inputSchema: {
              type: 'object',
              properties: {
                provider: {
                  type: 'string',
                  enum: this.generator.getSupportedProviders(),
                  description: `The provider to use for the image, must be one of: ${this.generator.getSupportedProviders().join(', ')}.`,
                },
                width: {
                  type: 'number',
                  description:
                    'The width of the image, must be a positive integer between 1 and 10000.',
                },
                height: {
                  type: 'number',
                  description:
                    'The height of the image, must be a positive integer between 1 and 10000.',
                },
              },
              required: ['provider', 'width', 'height'],
            },
          },
        ],
      };
    });

    // Register the call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const toolName = request.params.name;
      this.logger.debug('Handling tool call request', { toolName, params: request.params });

      if (toolName === 'image_placeholder') {
        try {
          const params = request.params.arguments as unknown as ImagePlaceholderParams;
          const result = await this.generator.generatePlaceholder(params);

          this.logger.info('Tool call completed successfully', {
            toolName,
            provider: params.provider,
            dimensions: `${params.width}x${params.height}`,
          });

          return {
            content: [
              {
                type: 'text',
                text: result.url,
              },
            ],
          };
        } catch (error) {
          this.logger.error('Tool call failed', error as Error, {
            toolName,
            params: request.params,
          });

          if (error instanceof ImagePlaceholderError) {
            // Re-throw application errors for proper MCP error handling
            throw error;
          }

          // Wrap unexpected errors
          throw new ServerError(
            `Unexpected error during ${toolName} execution: ${(error as Error).message}`,
            { toolName, originalError: (error as Error).name }
          );
        }
      }

      const errorMessage = `Unknown tool: ${toolName}`;
      this.logger.error(errorMessage, undefined, {
        toolName,
        availableTools: ['image_placeholder'],
      });
      throw new ServerError(errorMessage, { toolName });
    });
  }

  /**
   * Sets up global error handling for the process
   */
  private setupErrorHandling(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      this.logger.error('Uncaught exception occurred', error, {
        processEvent: 'uncaughtException',
      });

      // Give logger time to flush before exiting
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled promise rejection', reason as Error, {
        processEvent: 'unhandledRejection',
        promise: promise.toString(),
      });

      // Give logger time to flush before exiting
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.logger.info('Received SIGINT, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.logger.info('Received SIGTERM, shutting down gracefully');
      process.exit(0);
    });
  }

  /**
   * Starts the MCP server with stdio transport
   *
   * @returns Promise that resolves when server is running
   * @throws {ServerError} When server fails to start
   */
  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      this.logger.info('MCP Image Placeholder server started successfully', {
        serverName: this.config.name,
        version: this.config.version,
        environment: this.config.environment,
        supportedProviders: this.generator.getSupportedProviders(),
      });

      // Log to stderr so it doesn't interfere with MCP protocol on stdout
      console.error('Image placeholder MCP server running on stdio');
    } catch (error) {
      this.logger.error('Failed to start MCP server', error as Error);
      throw new ServerError(`Failed to start MCP server: ${(error as Error).message}`, {
        originalError: (error as Error).name,
      });
    }
  }

  /**
   * Gets the underlying server instance (mainly for testing)
   *
   * @returns The MCP Server instance
   */
  getServer(): Server {
    return this.server;
  }
}
