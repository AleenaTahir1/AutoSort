# AutoSort — Downloads Folder Organizer

A detailed project plan for building a Tauri + React desktop application that automatically organizes your Downloads folder.

---

## Project Overview

**Goal**: Build a cross-platform desktop app that watches the Downloads folder and automatically sorts files into categorized subfolders based on file type, with custom rules and a grace period before moving.

**Tech Stack**:
- **Backend**: Rust + Tauri (file system operations, watcher, system tray)
- **Frontend**: React + TypeScript (settings UI, file preview, rules management)
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Context
- **File Watching**: `notify` crate (Rust)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │   Rules     │  │     Settings        │  │
│  │  (pending   │  │   Editor    │  │  (folders, grace    │  │
│  │   files)    │  │             │  │   period, startup)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ Tauri IPC Commands
┌─────────────────────────┴───────────────────────────────────┐
│                      Rust Backend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   File      │  │   Rules     │  │    File Mover       │  │
│  │   Watcher   │  │   Engine    │  │    (with grace      │  │
│  │  (notify)   │  │             │  │     period)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Config    │  │   System    │  │    Undo/History     │  │
│  │   Manager   │  │   Tray      │  │    Manager          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Breakdown

### Phase 1: Core Foundation

#### 1.1 Project Setup
- [x] Initialize Tauri project with React + TypeScript template
- [x] Configure Tailwind CSS
- [x] Set up project structure (separate Rust modules, React components)
- [x] Configure build scripts for Windows/macOS/Linux

#### 1.2 Configuration System
- [x] Design config schema (JSON/TOML)
- [x] Implement config file read/write in Rust
- [x] Default configuration with sensible defaults
- [x] Config location: `~/.config/autosort/` or platform-appropriate

**Config Structure**:
```rust
struct Config {
    watch_folder: PathBuf,           // Default: ~/Downloads
    destination_root: PathBuf,       // Default: ~/Downloads
    grace_period_seconds: u64,       // Default: 30
    rules: Vec<SortRule>,
    run_on_startup: bool,
    minimize_to_tray: bool,
    show_notifications: bool,
}

struct SortRule {
    id: Uuid,
    name: String,
    enabled: bool,
    priority: i32,
    conditions: Vec<Condition>,
    destination_folder: String,
}

enum Condition {
    Extension(Vec<String>),          // e.g., ["pdf", "doc", "docx"]
    NameContains(String),
    NameRegex(String),
    SizeGreaterThan(u64),
    SizeLessThan(u64),
}
```

#### 1.3 File System Watcher
- [x] Implement watcher using `notify` crate
- [x] Debounce rapid file events (downloads in progress)
- [x] Handle edge cases: partial downloads, locked files
- [x] Event queue for pending files

---

### Phase 2: Sorting Engine

#### 2.1 Default Rules (Built-in)
- [x] **Images**: `jpg, jpeg, png, gif, webp, svg, bmp, ico, tiff` → `Images/`
- [x] **Documents**: `pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, odt` → `Documents/`
- [x] **Installers**: `exe, msi, dmg, pkg, deb, rpm, appimage` → `Installers/`
- [x] **Archives**: `zip, rar, 7z, tar, gz, bz2` → `Archives/`
- [x] **Audio**: `mp3, wav, flac, aac, ogg, m4a` → `Audio/`
- [x] **Video**: `mp4, mkv, avi, mov, wmv, webm` → `Video/`
- [x] **Code**: `js, ts, py, rs, go, java, cpp, c, h` → `Code/`
- [ ] **Misc**: Catch-all for unmatched files (optional)

#### 2.2 Rules Engine
- [x] Rule matching with priority ordering
- [x] Multiple conditions per rule (AND/OR logic)
- [x] Custom destination folders
- [x] Rule enable/disable toggle

#### 2.3 Grace Period System
- [x] Timer-based delay before moving files
- [x] Visual countdown in UI
- [x] Cancel/skip grace period per file
- [x] "Move Now" instant action
- [x] Pause all pending moves

---

### Phase 3: User Interface

#### 3.1 Main Dashboard
- [x] Pending files list with countdown timers
- [x] Recent activity log (last 50 moves)
- [x] Quick stats (files sorted today/week/total)
- [x] Pause/Resume watcher toggle

#### 3.2 Rules Management
- [x] List all rules with drag-to-reorder priority
- [x] Add/Edit/Delete custom rules
- [ ] Rule preview (test against sample filenames)
- [ ] Import/Export rules

#### 3.3 Settings Panel
- [x] Watch folder selector
- [x] Destination root folder selector
- [x] Grace period slider (0-300 seconds)
- [ ] Startup options
- [x] Notification preferences
- [x] Theme toggle (light/dark)

#### 3.4 System Tray
- [ ] Minimize to tray
- [ ] Tray icon with status indicator
- [ ] Quick actions menu (Pause, Open, Quit)
- [ ] Notification on file sorted

---

### Phase 4: Advanced Features

#### 4.1 Undo System
- [x] Track last N moves (configurable, default 100)
- [x] One-click undo last move
- [ ] Bulk undo (restore all from session)
- [x] History viewer with restore options

#### 4.2 Conflict Resolution
- [x] Handle duplicate filenames
- [x] Options: rename with number, skip, overwrite, ask
- [x] Configurable default behavior

#### 4.3 Exclusions
- [ ] Ignore patterns (glob/regex)
- [ ] Ignore files by name
- [ ] Temporary exclusion list

#### 4.4 Folder Watching Expansion
- [ ] Watch multiple folders
- [ ] Different rules per watched folder

---

### Phase 5: Polish & Distribution

#### 5.1 Quality of Life
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop file to manually sort
- [ ] Right-click context menu integration (optional, platform-specific)
- [ ] First-run wizard/onboarding

#### 5.2 Performance
- [ ] Efficient handling of large folders (initial scan)
- [ ] Lazy loading for history
- [ ] Minimal memory footprint when idle

#### 5.3 Distribution
- [ ] Windows installer (MSI/NSIS)
- [ ] macOS DMG
- [ ] Linux AppImage/deb
- [ ] Auto-updater (optional)

---

## File Structure

```
autosort/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── lib.rs               # Module exports
│   │   ├── commands/            # Tauri IPC commands
│   │   │   └── mod.rs           # Config, watcher, rules, files, system
│   │   ├── watcher/
│   │   │   ├── mod.rs
│   │   │   └── handler.rs       # File event handling
│   │   ├── engine/
│   │   │   ├── mod.rs
│   │   │   ├── rules.rs         # Rule matching logic
│   │   │   ├── mover.rs         # File moving with grace period
│   │   │   └── history.rs       # Move history tracking
│   │   ├── config/
│   │   │   ├── mod.rs
│   │   │   └── schema.rs        # Config structs & defaults
│   │   └── utils/
│   │       └── mod.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── index.tsx
│   │   │   ├── PendingFiles.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── Stats.tsx
│   │   ├── Rules/
│   │   │   ├── index.tsx
│   │   │   ├── RulesList.tsx
│   │   │   └── RuleEditor.tsx
│   │   ├── Settings/
│   │   │   └── index.tsx
│   │   └── common/
│   │       ├── Sidebar.tsx
│   │       └── FileIcon.tsx
│   ├── hooks/
│   │   ├── useConfig.ts
│   │   ├── useWatcher.ts
│   │   └── useHistory.ts
│   ├── lib/
│   │   ├── tauri.ts             # Tauri invoke wrappers
│   │   └── types.ts             # TypeScript types
│   └── styles/
│       └── globals.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Key Rust Dependencies

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-dialog = "2"
tauri-plugin-notification = "2"
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
notify = "7"                    # File system watcher
tokio = { version = "1", features = ["full"] }
uuid = { version = "1", features = ["v4", "serde"] }
dirs = "5"                      # Platform directories
regex = "1"
glob = "0.3"
chrono = { version = "0.4", features = ["serde"] }
thiserror = "2"
log = "0.4"
env_logger = "0.11"
parking_lot = "0.12"
```

---

## Key React Dependencies

```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.2.0",
    "@tauri-apps/plugin-notification": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.469.0",
    "zustand": "^5.0.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.2.0",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.0"
  }
}
```

---

## Tauri IPC Commands

| Command | Description |
|---------|-------------|
| `get_config` | Retrieve current configuration |
| `save_app_config` | Save configuration changes |
| `start_watcher` | Begin watching folder |
| `stop_watcher` | Stop watching folder |
| `pause_watcher` | Pause the watcher |
| `resume_watcher` | Resume the watcher |
| `get_watcher_status` | Check if watcher is active/paused |
| `get_pending_files` | List files in grace period |
| `move_file_now` | Skip grace period, move immediately |
| `cancel_pending_file` | Cancel a pending file move |
| `get_rules` | Get all sorting rules |
| `add_rule` | Create new rule |
| `update_rule` | Modify existing rule |
| `delete_rule` | Remove a rule |
| `reorder_rules` | Change rule priorities |
| `test_rule` | Test rule against filename |
| `get_history` | Get move history |
| `get_recent_history` | Get recent move history |
| `get_history_stats` | Get history statistics |
| `undo_file_move` | Restore file to original location |
| `clear_history` | Clear move history |
| `get_default_downloads_folder` | Get system downloads path |
| `folder_exists` | Check if folder exists |

---

## Development Milestones

### Milestone 1: Walking Skeleton ✅
- Basic Tauri app launches
- Can watch a folder and detect new files
- Console logs file events
- **Deliverable**: Proof of concept

### Milestone 2: Core Sorting ✅
- Files auto-sort by extension
- Default rules implemented
- Basic React UI shows activity
- **Deliverable**: Functional MVP

### Milestone 3: Grace Period ✅
- Timer before moving files
- UI shows pending files with countdown
- Cancel/move now actions work
- **Deliverable**: Usable daily driver

### Milestone 4: Custom Rules ✅
- Full rules editor UI
- Create/edit/delete custom rules
- Rule priority ordering
- **Deliverable**: Power user features

### Milestone 5: Polish (In Progress)
- System tray integration
- Undo functionality ✅
- Settings persistence ✅
- Notifications
- **Deliverable**: Release candidate

### Milestone 6: Distribution
- Platform installers
- Documentation
- **Deliverable**: Public release

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| File locked during download | Retry with exponential backoff; detect `.crdownload`, `.part` files |
| Permission errors | Clear error messages; request permissions on macOS |
| Large folder initial scan | Progress indicator; background processing |
| Race conditions in watcher | Debounce events; queue-based processing |
| Config corruption | Backup config; validate on load; reset to defaults option |

---

## Success Metrics

- **Reliability**: Zero data loss (files never deleted, only moved)
- **Performance**: <1% CPU when idle, <50MB RAM
- **UX**: New file sorted within grace period + 2 seconds
- **Adoption**: Works out-of-box with zero configuration

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Configuration Location

- **Windows**: `%APPDATA%\autosort\config.json`
- **macOS**: `~/Library/Application Support/autosort/config.json`
- **Linux**: `~/.config/autosort/config.json`

---

## Future Enhancements

1. **Cloud Sync**: Sync rules across devices
2. **Smart Categorization**: ML-based file categorization
3. **Scheduled Cleaning**: Auto-delete old files in certain folders
4. **Statistics Dashboard**: Detailed analytics on file organization
5. **Browser Extension**: Direct download to categorized folders
6. **Mobile Companion**: View/manage from phone

---

## License

MIT
