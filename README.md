# MCP Image Placeholder

MCP server for generating placeholder images using placehold.co and
picsum.photos.

## Install

```bash
npm i -g mcp-image-placeholder
```

## Usage

```json
{
  "mcp-image-placeholder": {
    "command": "npx",
    "args": ["mcp-image-placeholder"]
  }
}
```

**Params:** `provider` ("placehold"|"lorem-picsum"), `width` (1-10000), `height`
(1-10000) **Returns:** URL string

```js
image_placeholder('placehold', 300, 200); // → https://placehold.co/300x200
image_placeholder('lorem-picsum', 400, 300); // → https://picsum.photos/400/300
```
