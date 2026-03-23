import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

describe('Basecamp Distribution', () => {
    const distPath = path.resolve(__dirname, '../dist/basecamp.sh');

    it('dist/basecamp.sh should exist', () => {
        expect(existsSync(distPath)).toBe(true);
    });

    it('dist/basecamp.sh should contain the bash shebang', () => {
        const content = readFileSync(distPath, 'utf-8');
        expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    });

    it('dist/basecamp.sh should contain the payload marker', () => {
        const content = readFileSync(distPath, 'utf-8');
        expect(content.includes('BASECAMP_PAYLOAD')).toBe(true);
    });

    it('dist/basecamp.sh should have execute permissions', () => {
        // This check works on Unix-like systems
        const stats = execSync(`ls -l ${distPath}`).toString();
        expect(stats.startsWith('-rwx')).toBe(true);
    });
});
