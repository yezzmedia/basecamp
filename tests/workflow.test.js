import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performSetup } from '../src/steps/setup.js';
import { templates } from '../src/lib/templates.js';

// Mock clack prompts
vi.mock('@clack/prompts', () => ({
    select: vi.fn(),
    text: vi.fn(),
    confirm: vi.fn(),
    isCancel: vi.fn(() => false),
    outro: vi.fn(),
    spinner: vi.fn(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        message: ''
    }))
}));

// Mock node:fs
vi.mock('node:fs', () => ({
    existsSync: vi.fn(() => false),
    rmSync: vi.fn(),
    readFileSync: vi.fn(() => 'APP_KEY=base64:abc')
}));

import { select, text, confirm } from '@clack/prompts';
import { existsSync } from 'node:fs';

describe('Basecamp Workflow: Setup Step', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly handle non-interactive auto mode', async () => {
        const args = {
            isNonInteractive: true,
            argTemplate: 'ai',
            argName: 'test-ai-app'
        };

        const result = await performSetup(args);

        expect(result.project).toBe('test-ai-app');
        expect(result.selectedTemplate).toEqual(templates.ai);
        expect(result.shouldCustomize).toBe(false);
        expect(result.mode).toBe('auto');
        
        expect(select).not.toHaveBeenCalled();
        expect(text).not.toHaveBeenCalled();
    });

    it('should prompt for template in interactive mode', async () => {
        const args = { isNonInteractive: false, argName: 'my-custom-app' };
        
        select.mockResolvedValue('minimal');

        const result = await performSetup(args);

        expect(result.project).toBe('my-custom-app');
        expect(result.selectedTemplate).toEqual(templates.minimal);
        expect(result.shouldCustomize).toBe(false);
        
        expect(select).toHaveBeenCalled();
    });

    it('should detect existing directory and handle overwrite confirmation', async () => {
        const args = { isNonInteractive: false, argName: 'existing-dir' };
        
        // Setup: directory exists initially
        existsSync.mockReturnValueOnce(true);
        
        // User action: choose to overwrite
        select.mockResolvedValueOnce('overwrite');
        // User action: confirm ABSOLUTELY sure
        confirm.mockResolvedValue(true);
        // User action: choose template after directory is cleared
        select.mockResolvedValueOnce('basecamp');

        const result = await performSetup(args);

        expect(result.project).toBe('existing-dir');
        expect(confirm).toHaveBeenCalled();
    });
});
