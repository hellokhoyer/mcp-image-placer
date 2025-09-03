#!/usr/bin/env node

/**
 * CLI entry point for MCP Image Placeholder server
 */

import { MCPImagePlaceholderServer } from '../core/mcpServer.js';
import { PlaceholderGenerator } from '../core/placeholderGenerator.js';
import { PlaceholderValidator } from '../core/validator.js';
import {
  createConfig,
  createValidationConstraints,
  createProviderConfig,
} from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import { ServerError } from '../errors/index.js';

/**
 * Initializes and starts the MCP Image Placeholder server
 */
async function startServer(): Promise<void> {
  try {
    // Load configuration
    const config = createConfig();
    const constraints = createValidationConstraints();
    const providerConfig = createProviderConfig();

    // Initialize logger with config
    const logger = createLogger(config.logLevel, config.environment);

    logger.info('Initializing MCP Image Placeholder server', {
      version: config.version,
      environment: config.environment,
      logLevel: config.logLevel,
    });

    // Initialize core components
    const validator = new PlaceholderValidator(constraints);
    const generator = new PlaceholderGenerator(validator, providerConfig, logger);
    const server = new MCPImagePlaceholderServer(generator, config, logger);

    // Start the server
    await server.start();
  } catch (error) {
    // Use console.error for startup errors since logger might not be initialized
    console.error('Failed to start MCP Image Placeholder server:', error);

    if (error instanceof ServerError) {
      console.error('Server error details:', error.context);
    }

    process.exit(1);
  }
}

// Start the server if this file is run directly
// Check both import.meta.url and process.argv[1] for better compatibility with MCP clients
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('dist/cli/index.js') ||
  process.argv[1]?.endsWith('src/cli/index.ts');

// Debug logging for module detection (can be removed after fix)
if (process.env.DEBUG_MCP === '1') {
  console.error(`DEBUG: import.meta.url = ${import.meta.url}`);
  console.error(`DEBUG: process.argv[1] = ${process.argv[1]}`);
  console.error(`DEBUG: file://${process.argv[1]} = file://${process.argv[1]}`);
  console.error(`DEBUG: isMainModule = ${isMainModule}`);
}

if (isMainModule) {
  startServer().catch(error => {
    console.error('Unexpected error during server startup:', error);
    process.exit(1);
  });
}
