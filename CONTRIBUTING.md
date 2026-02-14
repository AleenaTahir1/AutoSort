# Contributing to AutoSort

First off, thank you for considering contributing to AutoSort! It's people like you that make AutoSort such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g., Windows 11]
 - AutoSort Version: [e.g., 0.1.0]
 - Watch Folder: [e.g., Downloads]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** and ensure they follow our coding style
4. **Test your changes**: `npm run tauri dev`
5. **Update documentation** if needed
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+ (or Bun)
- Rust 1.70+
- Tauri CLI

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/AutoSort.git
cd AutoSort

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Project Structure

```
AutoSort/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI components
│   │   ├── Dashboard/      # Main dashboard with stats
│   │   ├── Rules/          # Rule management
│   │   ├── Settings/       # App configuration
│   │   └── common/         # Shared components (Sidebar, TitleBar)
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and types
├── src-tauri/              # Backend (Rust)
│   └── src/
│       ├── commands/       # Tauri IPC commands
│       ├── config/         # Configuration management
│       ├── engine/         # Sorting rules and file mover
│       └── watcher/        # File system watcher
└── package.json
```

## Coding Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Use React hooks for state management

### Rust

- Follow Rust naming conventions
- Use `Result` for error handling
- Document public functions with `///` comments
- Keep functions small and focused

### CSS

- Use Tailwind CSS utility classes
- Follow the Neo-Brutalist design system
- Use the color palette defined in `tailwind.config.js`
- Maintain dark mode support

### Commits

- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Reference issues when applicable: "Fix #123"

**Examples:**
```
Add support for custom file patterns
Fix file moving on network drives
Update rule editor UI
Remove deprecated sorting method
```

## Testing

Before submitting a PR:

1. Ensure the app builds: `npm run build`
2. Test in development: `npm run tauri dev`
3. Test the production build: `npm run tauri build`
4. Test with various file types and rules

## Getting Help

- Open an issue for questions
- Join discussions in GitHub Discussions
- Check the README for usage instructions

## Recognition

Contributors will be recognized in:
- The README.md file
- Release notes
- The app's About section

Thank you for contributing to AutoSort!
