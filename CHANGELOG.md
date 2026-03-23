# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial setup script scaffolding (`Basecamp`) to replace legacy `Instalar`.
- Embedded Node.js runtime inside a single-file Bash script for cross-platform compatibility.
- Interactive prompts for Project Name, Database Type, and Optional Packages (Filament, Debugbar, IDE Helper).
- Build process using `esbuild` to minify and bundle the Node script.
