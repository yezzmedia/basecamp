# AGENTS

These rules extend Laravel Boost defaults.
If a rule conflicts, these project-specific rules take precedence.

## Allowed Access

### Read Allowed

- `./` (the current project root and its contents)
- Additional approved directories: none

### Write Allowed

- `./packages/**` for implementation code and package-owned files
- Additional approved directories: none

### Forbidden Access

- Any path not explicitly listed in `Read Allowed` or `Write Allowed`
- Any host application path
- Any sibling project, home, system, temporary, vendor, external, or mounted path unless explicitly added first
- `./vendor/**`
- `./node_modules/**`
- `./storage/framework/**`
- `./bootstrap/cache/**`
- `./.git/**`

### Enforcement

- If a path is not explicitly listed in `Read Allowed` or `Write Allowed`, do not search, read, create, edit, move, or delete anything inside it.
- Write operations are allowed only inside `Write Allowed`.
- Implementation code must only be written inside `./packages/**`.

## Scope and Modularity

- Work only within the allowed access rules defined above.
- Write all implementation code in Composer package paths for maximum modularity.
- The host application is read-only by default and must remain untouched unless explicitly requested.
- If host integration is required, provide explicit manual steps instead of auto-applying changes.
- Do not install, remove, or update dependencies without explicit approval.

## UI Architecture

- Use Filament for backend interfaces only.
- Do not build standalone Livewire UI flows.
- Do not add custom CSS unless explicitly requested.
- Do not add custom HTML structures only for styling.
- Build UI sections (for example hero, navigation, and similar elements) as separate reusable components.

## Reuse and Data

- Use existing project data sources first (models, services, DTOs, repositories).
- Do not invent new schemas, contracts, or fake datasets unless explicitly requested.
- Do not duplicate code; reuse existing components, services, and utilities.
- Extract repeated logic into shared components or package-level abstractions.

## Identity and Language

- Default package vendor is `yezzmedia`.
- Default package contact email is `info@yezzmedia.com`.
- All code, tests, comments, documentation, commit messages, and generated package content must be written in English.
- Only direct communication with the user may be in German.
- Prefix every user-facing response with `RE: `.

## Git Workflow

- Never commit directly to `main`.
- For every new topic, feature, or test task, create and switch to a dedicated branch from the latest `main` first.
- Use the branch format `<type>/<package>-<short-kebab-summary>`.
- Allowed branch types are `feature`, `fix`, `test`, `chore`, `docs`, `refactor`, and `release`.
- If no specific package slug exists, use `core` as the package segment.
- Keep one topic per branch and do not reuse old branches for new topics.
- Do not create commits automatically; ask first.
- After every completed change, explicitly offer to create a git commit.
- When a new feature starts, first ask whether previous work should be committed to close it.
- After a feature is completed and committed, ask whether to continue with GitHub flow (PR, merge strategy, release, and branch cleanup).
- Do not merge without explicit user confirmation.

## Required Verification Commands

- Code style: `./vendor/bin/pint`
- Pest test suite: `php artisan test --compact`
- Static analysis (PHPStan / Larastan): `./vendor/bin/phpstan analyse --memory-limit=1G`
- Browser tests: `php artisan dusk`
- Smoke tests: `php artisan test --compact --group=smoke`
- Frontend build verification when UI or assets change: `npm run build`

## Definition of Done

- A feature is complete only when implementation, tests, and quality checks are all finished.
- Run all relevant checks from `Required Verification Commands`.
- If a required tool is not installed or not configured, report that explicitly instead of silently skipping it.
- Do not mark work as complete while any required check is failing.
- Do not finalize completion until required CI checks are green.

## Release and API Stability

- Follow SemVer for package releases.
- Breaking changes require a major version bump and clear migration notes.
- New backward-compatible features require a minor version bump.
- Backward-compatible fixes require a patch version bump.
- Treat public package APIs as stable contracts.
- Avoid breaking public signatures or behavior unless explicitly approved.
- Keep release notes concise and user-focused.
