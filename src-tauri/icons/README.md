# Application Icons

This directory should contain the application icons for different platforms.

## Required Icons

Tauri requires icons in the following formats:

- `32x32.png` - Windows taskbar icon
- `128x128.png` - macOS dock icon
- `128x128@2x.png` - macOS Retina display icon
- `icon.icns` - macOS icon set
- `icon.ico` - Windows icon

## Generating Icons

You can use the Tauri CLI to generate all required icons from a single source image:

```bash
npm install -g @tauri-apps/cli
cargo tauri icon path/to/your-icon.png
```

The source image should be:
- At least 1024x1024 pixels
- PNG format with transparency
- Square aspect ratio

## Placeholder Icons

For development, you can use placeholder icons. The build will fail if these icons are missing.

## Design Guidelines

- Use a simple, recognizable design
- Ensure the icon works at small sizes (32x32)
- Use appropriate colors for both light and dark themes
- Avoid fine details that won't be visible at small sizes
- Test the icon on different backgrounds

## Current Status

Icons are not yet created. This will cause the build to fail until proper icons are added.

## Quick Fix for Development

To quickly generate placeholder icons:

1. Create a simple icon image (1024x1024) using any image editor
2. Run: `cargo tauri icon your-icon.png`
3. Icons will be automatically generated in this directory
