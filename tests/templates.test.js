import { describe, it, expect } from 'vitest';
import { templates } from '../src/lib/templates.js';

describe('Basecamp Templates', () => {
    it('should have all required templates', () => {
        const expectedTemplates = ['basecamp', 'minimal', 'ai', 'full', 'custom'];
        expectedTemplates.forEach(key => {
            expect(templates).toHaveProperty(key);
        });
    });

    it('each template should have a label and hint', () => {
        Object.values(templates).forEach(template => {
            expect(template).toHaveProperty('label');
            expect(typeof template.label).toBe('string');
            expect(template.label.length).toBeGreaterThan(0);

            expect(template).toHaveProperty('hint');
            expect(typeof template.hint).toBe('string');
        });
    });

    it('each template (except custom) should have flags and packages arrays', () => {
        Object.entries(templates).forEach(([key, template]) => {
            expect(Array.isArray(template.flags)).toBe(true);
            expect(Array.isArray(template.packages)).toBe(true);
        });
    });

    it('full template should contain many packages', () => {
        expect(templates.full.packages.length).toBeGreaterThan(10);
        expect(templates.full.packages).toContain('filament');
        expect(templates.full.packages).toContain('horizon');
    });

    it('minimal template should be lean', () => {
        expect(templates.minimal.packages.length).toBe(0);
        expect(templates.minimal.flags).not.toContain('--boost');
    });
});
