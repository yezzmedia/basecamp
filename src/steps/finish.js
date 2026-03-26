/**
 * ⛺ Basecamp - Step 4: Finish & Health Checks
 * 
 * Handles migrations, user creation, frontend builds, and the final summary.
 */

import pc from 'picocolors';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { intro, outro } from '@clack/prompts';
import { run } from '../lib/utils.js';

export async function performFinish(args, setupData, configData, s) {
    const { isVerbose, isNonInteractive, argGuidelines } = args;
    const { project, mode, selectedTemplate } = setupData;
    const { db, extraFlags, packagesToInstall, adminEmail, adminPassword } = configData;

    /**
     * DATABASE MIGRATION
     */
    if (!isVerbose) s.start('Migrating database...');
    else console.log(pc.blue(`\n[Basecamp] STEP 6: Migrating database...`));

    let migrationSuccessful = false;
    try {
        await run(`php artisan migrate --force`, project, isVerbose);
        if (!isVerbose) s.message = 'Database migrated!';
        migrationSuccessful = true;
    } catch (e) {
        if (!isVerbose) s.message = pc.yellow('Migration skipped (check DB config).');
    }

    /**
     * FILAMENT ADMIN CREATION
     */
    if (migrationSuccessful && packagesToInstall.includes('filament')) {
        if (!isVerbose) s.message = 'Creating Filament Admin user...';
        else console.log(pc.blue(`\n[Basecamp] STEP 6.5: Creating Filament Admin user...`));
        try {
            await run(`php artisan make:filament-user --name=Admin --email="${adminEmail}" --password="${adminPassword}"`, project, isVerbose);
        } catch (e) {}
    }

    /**
     * FRONTEND BUILD
     */
    if (!isVerbose) s.message = 'Running frontend build...';
    else console.log(pc.blue(`\n[Basecamp] STEP 7: Running frontend build...`));
    try {
        await run(`npm install`, project, isVerbose);
        await run(`npm run build`, project, isVerbose);
    } catch (e) {}

    /**
     * AI GUIDELINES INTEGRATION
     */
    if (argGuidelines) {
        if (!isVerbose) s.message = 'Downloading AI guidelines...';
        else console.log(pc.blue(`\n[Basecamp] STEP 7.5: Downloading AI guidelines...`));

        try {
            let url = argGuidelines;
            // Convert GitHub blob URL to raw URL if needed
            if (url.includes('github.com') && url.includes('/blob/')) {
                url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch guidelines: ${response.statusText}`);
            
            const content = await response.text();
            const boostDir = `${project}/resources/boost/guidelines`;
            if (!existsSync(boostDir)) {
                mkdirSync(boostDir, { recursive: true });
            }
            // We save it as .blade.php as per Boost convention
            writeFileSync(`${boostDir}/core.blade.php`, content);
            
            if (!isVerbose) s.message = 'AI Guidelines integrated!';
        } catch (e) {
            if (!isVerbose) s.message = pc.yellow('Failed to download guidelines (skipping).');
            else if (isVerbose) console.error(pc.red(`[Basecamp] Error downloading guidelines: ${e.message}`));
        }
    }

    /**
     * HEALTH CHECKS
     */
    if (!isVerbose) s.message = 'Performing post-install health checks...';
    else console.log(pc.blue(`\n[Basecamp] STEP 8: Performing post-install health checks...`));
    
    try { await run(`chmod -R 775 storage bootstrap/cache`, project, isVerbose); } catch (e) {}
    try { await run(`php artisan storage:link`, project, isVerbose); } catch (e) {}

    const hasEnv = existsSync(`${project}/.env`);
    let hasKey = false;
    if (hasEnv) {
        try {
            const envContent = readFileSync(`${project}/.env`, 'utf-8');
            hasKey = envContent.includes('APP_KEY=base64:');
        } catch (e) {}
    }

    const hasGit = existsSync(`${project}/.git`);
    let gitCommitted = false;
    if (hasGit) {
        if (!isVerbose) s.message = 'Creating initial Git commit...';
        try {
            await run(`git add .`, project, isVerbose);
            await run(`git commit -m "chore: initial project setup via basecamp"`, project, isVerbose);
            gitCommitted = true;
        } catch (e) {}
    }

    const hasVite = existsSync(`${project}/public/build/manifest.json`);
    let artisanHealthy = false;
    try {
        if (!isVerbose) s.message = 'Verifying Artisan health...';
        await run(`php artisan about`, project, isVerbose);
        artisanHealthy = true;
    } catch (e) {}

    if (!isVerbose) s.stop('All post-install steps completed!');

    /**
     * VERSION RETRIEVAL
     */
    const getVersionSync = (cmd, cwd = project) => {
        try {
            // Version retrieval still uses sync because it's nearly instant and needs to return a string
            const out = execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf-8' });
            return out.split('\n')[0].trim();
        } catch (e) { return null; }
    };

    const laravelRaw = getVersionSync('php artisan --version');
    const laravelVersion = laravelRaw ? laravelRaw.replace(/[^\d.]/g, '') : 'Unknown';
    const phpRaw = getVersionSync('php -v');
    const phpVersion = phpRaw ? phpRaw.split(' ')[1] : 'Unknown';
    const composerRaw = getVersionSync('composer --version');
    const composerVersion = composerRaw ? (composerRaw.match(/(\d+\.\d+\.\d+)/) || [null, 'Unknown'])[1] : 'Unknown';
    
    let filamentVersion = null;
    if (packagesToInstall.includes('filament')) {
        try {
            const lockPath = `${project}/composer.lock`;
            if (existsSync(lockPath)) {
                const composerLock = JSON.parse(readFileSync(lockPath, 'utf-8'));
                const filamentPkg = (composerLock.packages || []).find(p => p.name === 'filament/filament');
                filamentVersion = filamentPkg ? filamentPkg.version : 'v5.x (Latest)';
            }
        } catch (e) { filamentVersion = 'v5.x'; }
    }

    /**
     * FINAL SUMMARY
     */
    console.clear();
    intro(pc.bgGreen(pc.black(' ⛺ Basecamp - Installation Successful! ')));

    const summaryData = [
        ['Project Name', project],
        ['Template', selectedTemplate.label],
        ['Installation Mode', (mode || 'auto').toUpperCase()],
        ['Database', db],
        ['', ''],
        [pc.bold('Versions'), ''],
        ['Laravel', pc.green(`v${laravelVersion}`)],
        ['PHP', pc.dim(phpVersion)],
        ['Composer', pc.dim(composerVersion)],
    ];

    if (filamentVersion) summaryData.push(['Filament', pc.green(filamentVersion)]);

    summaryData.push(
        ['', ''],
        [pc.bold('Status'), ''],
        ['Vite Build', hasVite ? pc.green('SUCCESS') : pc.red('NOT FOUND')],
        ['Artisan Health', artisanHealthy ? pc.green('HEALTHY') : pc.red('ERRORS')],
        ['.env File', hasEnv ? pc.green('EXISTS') : pc.red('MISSING')],
        ['Application Key', hasKey ? pc.green('SET') : pc.red('MISSING')],
        ['Git Repository', hasGit ? (gitCommitted ? pc.green('INITIALIZED & COMMITTED') : pc.yellow('INITIALIZED')) : pc.red('NOT FOUND')],
    );

    if (packagesToInstall.includes('filament')) {
        summaryData.push(['Admin Email', adminEmail]);
        summaryData.push(['Admin Password', adminPassword]);
    }

    console.log(pc.bold('Project Summary:'));
    summaryData.forEach(([label, value]) => {
        const displayValue = (typeof value === 'string' && value.includes('\u001b[')) ? value : pc.cyan(value);
        console.log(`  ${pc.dim(label.padEnd(20, '.'))} ${displayValue}`);
    });

    console.log(`\n${pc.bold('Next Steps:')}`);
    console.log(`  1. ${pc.cyan(`cd ${project}`)}`);
    console.log(`  2. ${pc.cyan('composer run dev')}`);
    
    if (packagesToInstall.includes('filament')) {
        console.log(`\n${pc.bold('Filament Admin:')}`);
        console.log(`  - URL: ${pc.cyan('/admin')}`);
    }

    outro(pc.green('Happy coding with Basecamp! 🚀'));
    process.exit(0);
}
