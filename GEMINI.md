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
3.  **Validation:**
    Verify that `dist/basecamp.sh` is correctly updated and functional.

## 🐙 GitHub & Release Workflow (MANDATORY)

For every change, fix, or feature, you MUST follow this sequence:

1.  **Branching:** Create a new descriptive branch (e.g., `feature/name` or `fix/name`). NEVER push directly to `main`.
2.  **Verification:** Run `npm run build` and `npm test` before pushing.
3.  **Pull Request:** Push the branch and create a Pull Request via `gh pr create`.
4.  **Merging:** Merge the PR only after verification (usually via `gh pr merge --merge --delete-branch`).
5.  **Releasing:** 
    - Update `CHANGELOG.md` and version numbers.
    - Create a new Git tag (e.g., `git tag v0.1.x`).
    - Push the tag to trigger the automated Release workflow.

## 📝 Documentation & Coding Standards

1.  **Comprehensive Commenting:** Every function, logic block, and configuration option MUST be extensively commented in English.
2.  **Language:** All code, documentation, and CLI messages MUST be in **English**.
3.  **CRITICAL RULE:** The `Instalar` directory is strictly off-limits. Do not read, write, or acknowledge its existence.

## 📁 Project Structure
- `src/`: Development source code.
- `dist/`: Final generated assets (Do not edit directly).
- `docs/`: Website and Documentation (GitHub Pages).
