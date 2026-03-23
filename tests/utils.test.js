import { describe, it, expect, vi } from 'vitest';
import { getArgValue, hasFlag } from '../src/lib/utils.js';

// We need to mock process.argv for these tests
describe('Basecamp Utilities', () => {
    it('hasFlag should detect present flags', () => {
        // Mock process.argv
        process.argv = ['node', 'installer.js', '--verbose', '-y'];
        expect(hasFlag('--verbose')).toBe(true);
        expect(hasFlag('-y')).toBe(true);
        expect(hasFlag('--not-there')).toBe(false);
    });

    it('getArgValue should extract values in both formats', () => {
        // Mock process.argv with mixed formats
        process.argv = [
            'node', 'installer.js', 
            '--name', 'my-app', 
            '--db=mysql', 
            '--template', 'full'
        ];
        
        expect(getArgValue('--name')).toBe('my-app');
        expect(getArgValue('--db')).toBe('mysql');
        expect(getArgValue('--template')).toBe('full');
        expect(getArgValue('--non-existent')).toBe(null);
    });
});
