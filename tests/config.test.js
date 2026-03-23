import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performConfig } from '../src/steps/config.js';
import { templates } from '../src/lib/templates.js';

// Mock clack prompts
vi.mock('@clack/prompts', () => ({
    select: vi.fn(),
    multiselect: vi.fn(),
    text: vi.fn(),
    isCancel: vi.fn(() => false),
    outro: vi.fn()
}));

import { select, multiselect, text } from '@clack/prompts';

describe('Basecamp Workflow: Config Step', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use template defaults in auto mode', async () => {
        const args = { isNonInteractive: true };
        const setupData = { 
            selectedTemplate: templates.basecamp, 
            shouldCustomize: false 
        };

        const result = await performConfig(args, setupData);

        expect(result.db).toBe('sqlite');
        expect(result.extraFlags).toEqual(templates.basecamp.flags);
        expect(result.packagesToInstall).toEqual(templates.basecamp.packages);
        
        expect(select).not.toHaveBeenCalled();
    });

    it('should allow manual overrides when shouldCustomize is true', async () => {
        const args = { isNonInteractive: false };
        const setupData = { 
            selectedTemplate: templates.minimal, 
            shouldCustomize: true 
        };

        select.mockResolvedValue('mysql');
        multiselect.mockResolvedValueOnce(['--pest']); // flags
        multiselect.mockResolvedValueOnce(['filament']); // packages

        const result = await performConfig(args, setupData);

        expect(result.db).toBe('mysql');
        expect(result.extraFlags).toContain('--pest');
        expect(result.packagesToInstall).toContain('filament');
        
        expect(select).toHaveBeenCalled();
        expect(multiselect).toHaveBeenCalledTimes(2);
    });

    it('should include extra packages from command line', async () => {
        const args = { isNonInteractive: true, argPackages: 'telescope,pennant' };
        const setupData = { 
            selectedTemplate: templates.minimal, 
            shouldCustomize: false 
        };

        const result = await performConfig(args, setupData);

        expect(result.packagesToInstall).toContain('telescope');
        expect(result.packagesToInstall).toContain('pennant');
    });
});
