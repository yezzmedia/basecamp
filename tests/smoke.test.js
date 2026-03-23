import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

describe('Basecamp Smoke Test (Real Run)', () => {
    const testAppName = 'basecamp-smoke-test-app';
    const projectPath = path.resolve(process.cwd(), testAppName);
    const scriptPath = path.resolve(process.cwd(), 'dist/basecamp.sh');

    // Ensure we start clean and have the latest build
    beforeAll(() => {
        if (existsSync(projectPath)) {
            rmSync(projectPath, { recursive: true, force: true });
        }
        // We assume 'npm run build' has been called or we call it here
        execSync('node build.js');
    });

    // Cleanup after test
    afterAll(() => {
        if (existsSync(projectPath)) {
            // Un-comment the line below if you want to keep the app for manual inspection
            rmSync(projectPath, { recursive: true, force: true });
        }
    });

    /**
     * This test actually executes the full shell script.
     * We use a VERY long timeout (10 minutes) because composer/npm can be slow.
     */
    it('should successfully complete a full installation (Minimal Template)', async () => {
        console.log('🚀 Starting real-world smoke test. This may take a few minutes...');
        
        // Execute the script in non-interactive mode with the minimal template for speed
        const command = `${scriptPath} --yes --template=minimal --name=${testAppName} --verbose`;
        
        try {
            execSync(command, { stdio: 'inherit' });
        } catch (error) {
            throw new Error(`Script execution failed: ${error.message}`);
        }

        // Verify key results
        expect(existsSync(projectPath)).toBe(true);
        expect(existsSync(path.join(projectPath, 'artisan'))).toBe(true);
        expect(existsSync(path.join(projectPath, '.env'))).toBe(true);
        expect(existsSync(path.join(projectPath, '.git'))).toBe(true);
        
        // Verify if Laravel is actually bootable
        const artisanAbout = execSync(`php artisan about`, { cwd: projectPath }).toString();
        expect(artisanAbout).toContain('Laravel Version');
        
        console.log('✅ Smoke test passed! Real-world installation successful.');
    }, 600000); // 10 minute timeout
});
