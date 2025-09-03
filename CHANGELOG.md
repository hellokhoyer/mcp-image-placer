# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-03

### Added
- Initial release of MCP Image Placeholder server
- Support for placehold.co provider for solid color placeholders
- Support for lorem-picsum provider for realistic photo placeholders
- Image size validation (1-10000 pixels for width and height)
- MCP protocol compliance with proper tool registration
- TypeScript implementation with full type safety
- Simple configuration for MCP clients

### Features
- Returns direct URL strings to placeholder images
- No external dependencies beyond MCP SDK
- Fast response times for all image requests

### Technical
- Built with TypeScript and MCP SDK
- Follows MCP server protocol specifications
- Supports both development and production environments
- Compatible with Claude, Warp, and other MCP clients
- Comprehensive input validation and error handling
- 100% test coverage

[1.0.0]: https://github.com/username/mcp-image-placeholder/releases/tag/v1.0.0
