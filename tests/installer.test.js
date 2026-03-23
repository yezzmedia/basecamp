import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performInstallation } from '../src/steps/install.js';

// Mock utils
vi.mock('../src/lib/utils.js', () => ({
    run: vi.fn()
}));

// Mock clack
vi.mock('@clack/prompts', () => ({
    spinner: vi.fn(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        message: ''
    }))
}));

import { run } from '../src/lib/utils.js';

describe('Basecamp Workflow: Installation Step', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should execute the correct laravel new command', async () => {
        const args = { isVerbose: false, isNonInteractive: true };
        const setupData = { project: 'test-app' };
        const configData = { 
            db: 'sqlite', 
            extraFlags: ['--pest', '--git'], 
            packagesToInstall: [] 
        };
        const s = { start: vi.fn(), stop: vi.fn() };

        await performInstallation(args, setupData, configData, s);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('laravel new test-app --database=sqlite --pest --git --no-interaction'),
            '.',
            false
        );
    });

    it('should install selected packages via composer', async () => {
        const args = { isVerbose: true, isNonInteractive: true };
        const setupData = { project: 'pkg-app' };
        const configData = { 
            db: 'mysql', 
            extraFlags: [], 
            packagesToInstall: ['filament', 'pulse'] 
        };
        const s = { start: vi.fn(), stop: vi.fn() };

        await performInstallation(args, setupData, configData, s);

        // Check for composer require
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('composer require'),
            'pkg-app',
            true
        );
        
        // Check for specific package setup commands
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('php artisan filament:install'),
            'pkg-app',
            true
        );
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('php artisan pulse:install'),
            'pkg-app',
            true
        );
    });
});
