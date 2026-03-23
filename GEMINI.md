# ⛺ Basecamp - Gemini CLI Project Mandates

This project follows a "Source-to-Distribution" build architecture. All development happens in the `src/` directory, and the final executable is generated in `dist/`.

## 🛠️ Build Mandate (CRITICAL)

**ALWAYS** execute the build command after modifying any source file to ensure the distribution script is synchronized:

1.  **Source Files:**
    - `src/installer.js`
    - `src/wrapper.sh`
    - `build.js`
2.  **Build Command:**
    ```bash
    npm run build
    ```
3.  **Verification:**
    Verify that `dist/basecamp.sh` is correctly updated and functional.

## 📝 Documentation & Coding Standards

1.  **Comprehensive Commenting:** Every function, logic block, and configuration option MUST be extensively commented. Explain the "Why" and the "How" for future maintainability.
2.  **Language:** All code, comments, documentation (`README.md`, `CHANGELOG.md`, `GEMINI.md`), and CLI messages MUST be in **English** for international open-source compatibility.
3.  **Cross-Platform Awareness:** Always ensure that changes remain compatible with Linux, macOS, and Windows (via WSL/Git Bash).
4.  **Error Handling:** Every `execSync` call should be wrapped in robust error handling to provide helpful feedback to the user.

## 📁 Project Structure
- `src/`: Development source code (Edit here).
- `dist/`: Final generated assets (NEVER edit directly).
- `build.js`: The compiler/bundler logic.
- `package.json`: Dependency management and build scripts.
