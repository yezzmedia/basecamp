import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { performInstallation } from '../src/steps/install.js';
import { performFinish } from '../src/steps/finish.js';

// Mock utils
vi.mock('../src/lib/utils.js', () => ({
    run: vi.fn(),
}));

// Mock clack
vi.mock('@clack/prompts', () => ({
    intro: vi.fn(),
    outro: vi.fn(),
    spinner: vi.fn(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        message: '',
    })),
}));

const { run } = await import('../src/lib/utils.js');

function createSpinner() {
    return {
        start: vi.fn(),
        stop: vi.fn(),
        message: '',
    };
}

function createTempProject(name) {
    const path = join(tmpdir(), `basecamp-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);

    return {
        cleanup() {
            rmSync(path, { recursive: true, force: true });
        },
        path,
    };
}

function writeProjectFile(projectPath, relativePath, content) {
    const path = join(projectPath, relativePath);

    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content);

    return path;
}

describe('Basecamp Workflow: Installation Step', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        run.mockResolvedValue(undefined);
    });

    it('should execute the correct laravel new command', async () => {
        const args = { isVerbose: false, isNonInteractive: true };
        const setupData = { project: 'test-app' };
        const configData = {
            db: 'sqlite',
            extraFlags: ['--pest', '--git'],
            packagesToInstall: [],
        };

        await performInstallation(args, setupData, configData, createSpinner());

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('laravel new test-app --database=sqlite --pest --git --no-interaction'),
            '.',
            false,
        );
    });

    it('should install selected packages via composer', async () => {
        const args = { isVerbose: true, isNonInteractive: true };
        const setupData = { project: 'pkg-app' };
        const configData = {
            db: 'mysql',
            extraFlags: [],
            packagesToInstall: ['filament', 'pulse'],
        };

        await performInstallation(args, setupData, configData, createSpinner());

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('composer require'),
            'pkg-app',
            true,
        );

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('php artisan filament:install'),
            'pkg-app',
            true,
        );

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('php artisan pulse:install'),
            'pkg-app',
            true,
        );
    });

    it('uses the current yezzmedia package constraints instead of the legacy wildcard range', async () => {
        const args = { isVerbose: true, isNonInteractive: true };
        const setupData = { project: 'yezz-app' };
        const configData = {
            db: 'sqlite',
            extraFlags: [],
            packagesToInstall: [
                'yezzmedia-foundation',
                'yezzmedia-access',
                'yezzmedia-ops',
                'yezzmedia-ops-analytics',
                'yezzmedia-ops-backups',
                'yezzmedia-ops-security',
                'yezzmedia-ops-sites',
            ],
        };

        await performInstallation(args, setupData, configData, createSpinner());

        const requireCall = run.mock.calls.find(([command, cwd]) => command.includes('composer require') && cwd === 'yezz-app');

        expect(requireCall).toBeDefined();

        const [command] = requireCall;

        expect(command).toContain('"yezzmedia/laravel-foundation:^0.1.1"');
        expect(command).toContain('"yezzmedia/laravel-access:^0.2"');
        expect(command).toContain('"yezzmedia/laravel-ops:^0.1.1"');
        expect(command).toContain('"yezzmedia/laravel-ops-analytics:^0.1.4"');
        expect(command).toContain('"yezzmedia/laravel-ops-backups:^0.1.1"');
        expect(command).toContain('"yezzmedia/laravel-ops-security:^0.1.3"');
        expect(command).toContain('"yezzmedia/laravel-ops-sites:^0.1.1"');
        expect(command).not.toContain('"yezzmedia/laravel-access:^0.1"');
    });

    it('marks the generated admin panel provider as default', async () => {
        const project = createTempProject('install-default-panel');

        try {
            const providersPath = join(project.path, 'bootstrap/providers.php');
            const panelProviderPath = join(project.path, 'app/Providers/Filament/AdminPanelProvider.php');

            writeProjectFile(project.path, 'bootstrap/providers.php', '<?php\n\nreturn [\n];\n');
            writeProjectFile(project.path, 'app/Providers/Filament/AdminPanelProvider.php', `<?php

namespace App\\Providers\\Filament;

use Filament\\Panel;
use Filament\\PanelProvider;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->path('admin');
    }
}
            `);

            await performInstallation(
                { isVerbose: true, isNonInteractive: true },
                { project: project.path },
                { db: 'sqlite', extraFlags: [], packagesToInstall: ['filament'] },
                createSpinner(),
            );

            expect(readFileSync(providersPath, 'utf8')).toContain('App\\Providers\\Filament\\AdminPanelProvider::class');
            expect(readFileSync(panelProviderPath, 'utf8')).toContain("->default()\n            ->id('admin')");
        } finally {
            project.cleanup();
        }
    });

    it('does not duplicate an existing default panel marker', async () => {
        const project = createTempProject('install-existing-default');

        try {
            const providersPath = join(project.path, 'bootstrap/providers.php');
            const panelProviderPath = join(project.path, 'app/Providers/Filament/AdminPanelProvider.php');
            const originalContent = `<?php

namespace App\\Providers\\Filament;

use Filament\\Panel;
use Filament\\PanelProvider;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin');
    }
}
`;

            writeProjectFile(project.path, 'bootstrap/providers.php', '<?php\n\nreturn [\n    App\\Providers\\Filament\\AdminPanelProvider::class,\n];\n');
            writeProjectFile(project.path, 'app/Providers/Filament/AdminPanelProvider.php', originalContent);

            await performInstallation(
                { isVerbose: true, isNonInteractive: true },
                { project: project.path },
                { db: 'sqlite', extraFlags: [], packagesToInstall: ['filament'] },
                createSpinner(),
            );

            expect(readFileSync(panelProviderPath, 'utf8')).toBe(originalContent);
        } finally {
            project.cleanup();
        }
    });
});

describe('Basecamp Workflow: Finish Step', () => {
    const originalConsoleClear = console.clear;
    const originalProcessExit = process.exit;

    beforeEach(() => {
        vi.clearAllMocks();
        run.mockResolvedValue(undefined);
        console.clear = vi.fn();
        process.exit = vi.fn();
    });

    afterEach(() => {
        console.clear = originalConsoleClear;
        process.exit = originalProcessExit;
    });

    it('creates the filament user before granting ops access', async () => {
        const project = createTempProject('finish-order');

        try {
            writeProjectFile(project.path, 'app/Providers/Filament/AdminPanelProvider.php', '<?php\n');
            writeProjectFile(project.path, '.env', 'APP_KEY=base64:test\n');
            writeProjectFile(project.path, 'public/build/manifest.json', '{}');

            await performFinish(
                { isVerbose: false, isNonInteractive: true, argGuidelines: null },
                { project: project.path, mode: 'auto', selectedTemplate: { label: 'Test' } },
                {
                    adminEmail: 'admin@example.com',
                    adminPassword: 'password',
                    db: 'sqlite',
                    extraFlags: [],
                    packagesToInstall: ['filament', 'yezzmedia-ops'],
                },
                createSpinner(),
            );

            const commands = run.mock.calls.map(([command]) => command);
            const createUserIndex = commands.indexOf('php artisan make:filament-user --name=Admin --email="admin@example.com" --password="password"');
            const grantOpsAccessIndex = commands.indexOf('php artisan website:assign-super-admin "admin@example.com" --no-interaction');

            expect(createUserIndex).toBeGreaterThan(-1);
            expect(grantOpsAccessIndex).toBeGreaterThan(-1);
            expect(createUserIndex).toBeLessThan(grantOpsAccessIndex);
        } finally {
            project.cleanup();
        }
    });

    it('runs the normal website install before syncing permissions and the audit install after seeding roles', async () => {
        const project = createTempProject('finish-yezzmedia-order');

        try {
            writeProjectFile(project.path, 'app/Providers/Filament/AdminPanelProvider.php', '<?php\n');
            writeProjectFile(project.path, '.env', 'APP_KEY=base64:test\n');
            writeProjectFile(project.path, 'public/build/manifest.json', '{}');

            await performFinish(
                { isVerbose: false, isNonInteractive: true, argGuidelines: null },
                { project: project.path, mode: 'auto', selectedTemplate: { label: 'Test' } },
                {
                    adminEmail: 'admin@example.com',
                    adminPassword: 'password',
                    db: 'sqlite',
                    extraFlags: [],
                    packagesToInstall: ['filament', 'yezzmedia-ops'],
                },
                createSpinner(),
            );

            const commands = run.mock.calls.map(([command]) => command);
            const websiteInstallIndex = commands.indexOf('php artisan website:install --migrate --configure-http-middleware-bridge --no-interaction');
            const syncPermissionsIndex = commands.indexOf('php artisan website:sync-permissions --no-interaction');
            const seedRolesIndex = commands.indexOf('php artisan website:seed-roles --no-interaction');
            const auditInstallIndex = commands.indexOf('php artisan website:install --configure-audit --audit-package=all --no-interaction');
            const grantOpsAccessIndex = commands.indexOf('php artisan website:assign-super-admin "admin@example.com" --no-interaction');

            expect(websiteInstallIndex).toBeGreaterThan(-1);
            expect(syncPermissionsIndex).toBeGreaterThan(-1);
            expect(seedRolesIndex).toBeGreaterThan(-1);
            expect(auditInstallIndex).toBeGreaterThan(-1);
            expect(grantOpsAccessIndex).toBeGreaterThan(-1);

            expect(websiteInstallIndex).toBeLessThan(syncPermissionsIndex);
            expect(syncPermissionsIndex).toBeLessThan(seedRolesIndex);
            expect(seedRolesIndex).toBeLessThan(auditInstallIndex);
            expect(auditInstallIndex).toBeLessThan(grantOpsAccessIndex);
        } finally {
            project.cleanup();
        }
    });

    it('skips filament user creation when the admin panel provider is missing', async () => {
        const project = createTempProject('finish-missing-provider');

        try {
            writeProjectFile(project.path, '.env', 'APP_KEY=base64:test\n');
            writeProjectFile(project.path, 'public/build/manifest.json', '{}');

            await performFinish(
                { isVerbose: true, isNonInteractive: true, argGuidelines: null },
                { project: project.path, mode: 'auto', selectedTemplate: { label: 'Test' } },
                {
                    adminEmail: 'admin@example.com',
                    adminPassword: 'password',
                    db: 'sqlite',
                    extraFlags: [],
                    packagesToInstall: ['filament'],
                },
                createSpinner(),
            );

            expect(run.mock.calls.map(([command]) => command)).not.toContain(
                'php artisan make:filament-user --name=Admin --email="admin@example.com" --password="password"',
            );
        } finally {
            project.cleanup();
        }
    });
});
