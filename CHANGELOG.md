# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-09-03

### Changed
- **Documentation**: Enhanced README with comprehensive Warp MCP configuration guide
- **Setup Instructions**: Added step-by-step Warp integration instructions with visual guidance
- **Troubleshooting**: Expanded troubleshooting section with solutions for common installation and configuration issues
- **Usage Examples**: Improved examples showing both placehold.co and Lorem Picsum providers
- **User Experience**: Better formatting and organization of documentation for easier setup

### Documentation
- Updated Warp MCP configuration format with correct JSON structure
- Added comprehensive troubleshooting guide for "connection closed" errors
- Enhanced development and testing sections
- Improved contributing guidelines and project structure documentation

## [1.0.1] - 2025-09-03

### Fixed
- **Critical**: Fixed CLI entry point module detection logic that prevented server startup in global npm installations
- **Warp Integration**: Resolved "connection closed: initialize response" error in Warp MCP configuration
- Server now starts correctly when installed via `npm install -g mcp-image-placeholder`

### Changed
- Simplified module detection logic to always start server when CLI is executed
- Updated README with correct Warp MCP configuration
- Added comprehensive troubleshooting guide

### Technical
- Removed complex `import.meta.url` comparison that failed in npm global bin directory
- Added debug logging capability for future troubleshooting (`DEBUG_MCP=1`)
- Improved error handling and logging for startup issues

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

[1.0.2]: https://github.com/hellokhoyer/mcp-image-placer/releases/tag/v1.0.2
[1.0.1]: https://github.com/hellokhoyer/mcp-image-placer/releases/tag/v1.0.1
[1.0.0]: https://github.com/hellokhoyer/mcp-image-placer/releases/tag/v1.0.0
