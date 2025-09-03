# MCP Image Placeholder

MCP server for generating placeholder images using placehold.co and picsum.photos.

## Installation

```bash
npm install -g mcp-image-placeholder
```

## Warp Configuration

Add this configuration to your Warp MCP settings:

```json
{
  "image-placeholder": {
    "command": "mcp-image-placeholder",
    "args": [],
    "env": {},
    "working_directory": null
  }
}
```

### How to Configure in Warp

1. Open **Warp** → **Settings** (Cmd+,)
2. Go to **Features** → **AI** → **Model Context Protocol**
3. Add the JSON configuration above
4. Save and restart Warp

## Usage

Once configured in Warp, you can use the `image_placeholder` tool in your AI conversations:

### Available Tool

**`image_placeholder`** - Generate placeholder images for testing and development

**Parameters:**
- `provider` (string): Either "placehold" or "lorem-picsum"
- `width` (number): Image width in pixels (1-10000)
- `height` (number): Image height in pixels (1-10000)

**Returns:** URL string for the generated placeholder image

### Examples

```javascript
// Using placehold.co (solid color placeholders)
image_placeholder("placehold", 300, 200)
// Returns: https://placehold.co/300x200

// Using Lorem Picsum (random photos)
image_placeholder("lorem-picsum", 400, 300)
// Returns: https://picsum.photos/400/300
```

### Use Cases

- **Web Development**: Generate placeholder images for mockups and prototypes
- **Testing**: Create test images with specific dimensions
- **Documentation**: Add placeholder images to examples and demos
- **Design**: Quick placeholder content for layouts

## Troubleshooting

### "Connection closed" Error

If you see this error in Warp:
1. Ensure you have the latest version: `npm update -g mcp-image-placeholder`
2. Verify the configuration matches exactly (including the `working_directory: null`)
3. Restart Warp completely

### Package Not Found

If the command isn't recognized:
1. Check global installation: `npm list -g mcp-image-placeholder`
2. Verify it's in your PATH: `which mcp-image-placeholder`
3. Try reinstalling: `npm uninstall -g mcp-image-placeholder && npm install -g mcp-image-placeholder`

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/hellokhoyer/mcp-image-placer.git
cd mcp-image-placer

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Testing the MCP Server

```bash
# Test the CLI directly
node dist/cli/index.js

# Send a test MCP request
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/cli/index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.
