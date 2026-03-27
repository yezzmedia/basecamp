# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.7] - 2026-03-27

### Added
- **Modern Redesign:** Completely redesigned landing page and documentation with yezzmedia branding, glassmorphism, and improved aesthetics.
- **Vendor Integration:** Added "by yezzmedia" branding to CLI and Website.

### Fixed
- **CI Stability:** Fixed `/dev/tty` error in GitHub Actions environments by implementing robust TTY detection that respects the `CI` environment variable.
- **Placeholders:** Removed hardcoded `your-username` placeholders from documentation.

## [0.1.6] - 2026-03-26

### Added
- Added `--guidelines` argument to specify a GitHub URL for AI guidelines, which are automatically downloaded and stored in `resources/boost/guidelines/core.blade.php`.

### Fixed
- Improved terminal re-attachment and piped execution robustness.
- Fixed `y: command not found` error during piped installation by correctly handling interactive prompts and TTY detection.
- Prevented script body consumption from pipe during interactive checks.

## [0.1.5] - 2026-03-23

### Fixed
- Fixed interactive prompts automatically skipping/aborting when the script is executed via pipe (`curl ... | bash`) by correctly reattaching `stdin` to the terminal (`/dev/tty`).

## [0.1.4] - 2026-03-23

### Added
- New shortened installation URL via GitHub Pages: `https://yezzmedia.github.io/basecamp/install`.
- Modified `build.js` to automatically sync the distribution script to `docs/install`.

### Changed
- Updated landing page, documentation, and README to reflect the new shorter URL.

## [0.1.3] - 2026-03-23

### Added
- "Copy to Clipboard" functionality for the quickstart command on the website.
- Official website and documentation links to the README.

### Fixed
- Corrected copyright holder in MIT License to "Yezz-Media (yezzmedia.com)".

### Security
- Enhanced `GEMINI.md` with strict branching and release mandates.

## [0.1.2] - 2026-03-23

### Fixed
- Fixed `tail` error during piped execution by enforcing disk-based execution.
- Added explicit check for `__ARCHIVE__` marker in the wrapper script.

### Changed
- Updated official installation command to use `-o basecamp.sh` for better reliability and interactivity.
- Improved documentation with clearer CLI examples and platform requirements.

## [0.1.0] - 2026-03-23
