# AutoSort - Downloads Folder Organizer

A cross-platform desktop application that automatically organizes your Downloads folder by sorting files into categorized subfolders.

## Features

- **Automatic File Watching**: Monitors your Downloads folder for new files
- **Smart Sorting Rules**: Built-in rules for common file types (Images, Documents, Archives, etc.)
- **Custom Rules**: Create your own sorting rules with flexible conditions
- **Grace Period**: Configurable delay before moving files, with option to cancel or move immediately
- **Undo Support**: Easily restore files to their original location
- **System Tray**: Runs quietly in the background
- **Dark Mode**: Beautiful light and dark themes
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Default Categories

| Category | File Types |
|----------|------------|
| Images | jpg, jpeg, png, gif, webp, svg, bmp, ico, tiff, raw, heic |
| Documents | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, odt, csv, epub |
| Installers | exe, msi, dmg, pkg, deb, rpm, appimage, snap |
| Archives | zip, rar, 7z, tar, gz, bz2, xz, tgz |
| Audio | mp3, wav, flac, aac, ogg, m4a, wma, opus |
| Video | mp4, mkv, avi, mov, wmv, webm, flv, m4v |
| Code | js, ts, py, rs, go, java, cpp, c, h, cs, rb, php, swift, kt |

## Tech Stack

- **Backend**: Rust + Tauri 2.0
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **File Watching**: notify crate

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

```
autosort/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and Tauri bindings
│   └── styles/             # CSS styles
├── src-tauri/              # Rust backend
│   └── src/
│       ├── commands/       # Tauri IPC commands
│       ├── config/         # Configuration management
│       ├── engine/         # Sorting logic
│       └── watcher/        # File system watcher
└── package.json
```

## Configuration

Configuration is stored in:
- **Windows**: `%APPDATA%\autosort\config.json`
- **macOS**: `~/Library/Application Support/autosort/config.json`
- **Linux**: `~/.config/autosort/config.json`

## License

MIT
