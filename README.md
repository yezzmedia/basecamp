# ⛺ Basecamp

Basecamp is a modern, single-file cross-platform terminal installer for rapidly bootstrapping Laravel projects. It features an embedded Node.js runtime to provide a beautiful, interactive CLI experience while remaining a portable Bash script.

**Official Website & Documentation:** [https://yezzmedia.github.io/basecamp/](https://yezzmedia.github.io/basecamp/)

## 🚀 Quick Start

Run Basecamp directly from the terminal without downloading anything manually:

```bash
curl -fsSL https://yezzmedia.github.io/basecamp/install | bash
```

### Features
- **Cross-Platform**: Runs on Linux, macOS, and Windows (via Git Bash / WSL).
- **Interactive UI**: Beautiful prompts powered by `@clack/prompts`.
- **Zero Dependencies**: Requires only PHP, Composer, Node.js, and Git. The script handles everything else.
- **Batteries Included**: Easily add Filament Admin, Laravel Debugbar, and IDE Helper during setup.

## 🛠️ Development

Basecamp uses a "build" approach. The interactive logic is written in modern Node.js and bundled via `esbuild` into a single, executable Bash script.

### Prerequisites
- Node.js (v18+)
- npm

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yezzmedia/basecamp.git
   cd basecamp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Building the Script
To compile `src/installer.js` and inject it into `src/wrapper.sh`:
```bash
npm run build
```
This will generate the final, distributable file at `dist/basecamp.sh`.

### Testing Locally
You can run the built script locally:
```bash
./dist/basecamp.sh
```

## 📝 Roadmap & Phases
- [x] Initial Scaffolding and Build Process
- [x] Core Laravel Installer Logic
- [ ] Landing Page Setup (Website)
- [ ] GitHub Actions (CI/CD to build and publish the `.sh` file)

## 📄 License
MIT License
