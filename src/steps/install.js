/**
 * ⛺ Basecamp - Step 3: Installation
 * 
 * Orchestrates the Laravel installation, package requirements, and initial setup.
 */

import pc from 'picocolors';
import { run } from '../lib/utils.js';

export async function performInstallation(args, setupData, configData, s) {
    const { isVerbose, isNonInteractive } = args;
    const { project } = setupData;
    const { db, extraFlags, packagesToInstall } = configData;

    /**
     * LARAVEL CORE INSTALL
     */
    const installMsg = `Creating Laravel project "${project}"... ${pc.dim('(This may take a few minutes)')}`;
    if (!isVerbose) s.start(installMsg);
    else console.log(pc.blue(`\n[Basecamp] STEP 4: Creating Laravel project "${project}"... ${pc.dim('(Downloading Laravel, please wait)')}`));
    
    const flags = (extraFlags || []).join(' ');
    let installationSuccessful = false;

    try {
        await run(`laravel new ${project} --database=${db} ${flags} --no-interaction`, '.', isVerbose);
        installationSuccessful = true;
    } catch (error) {
        if (!isVerbose) s.stop(pc.yellow('Warning: "laravel new" failed. Falling back to basic composer installation...'));
        else console.warn(pc.yellow('\n[Basecamp] Warning: "laravel new" failed. Falling back to basic composer installation...'));

        try {
            await run(`composer create-project laravel/laravel ${project} --prefer-dist`, '.', isVerbose);
            installationSuccessful = true;
            if (extraFlags.includes('--git')) { try { await run(`git init`, project, isVerbose); } catch (e) {} }
        } catch (e) {
            if (!isVerbose) s.stop('Failed to create Laravel project.');
            console.error(pc.red(e.message));
            process.exit(1);
        }
    }
    
    if (installationSuccessful && !isVerbose) s.stop(`Laravel project created successfully!`);
    else if (installationSuccessful && isVerbose) console.log(pc.green(`[Basecamp] Laravel project created successfully!`));

    /**
     * PACKAGE INSTALLATION
     */
    if (packagesToInstall.length > 0) {
        if (!isVerbose) s.start(`Installing packages: ${pc.cyan(packagesToInstall.join(', '))}...`);
        else console.log(pc.blue(`\n[Basecamp] STEP 5: Installing selected packages (${packagesToInstall.join(', ')})...`));
        
        let reqs = [];
        let devReqs = [];
        
        // Mapping
        if (packagesToInstall.includes('filament')) reqs.push('filament/filament:"^5.0" -W');
        if (packagesToInstall.includes('laravel-ai')) reqs.push('laravel/ai');
        if (packagesToInstall.includes('openai')) reqs.push('openai-php/laravel');
        if (packagesToInstall.includes('permission')) reqs.push('spatie/laravel-permission');
        if (packagesToInstall.includes('pennant')) reqs.push('laravel/pennant');
        if (packagesToInstall.includes('pulse')) reqs.push('laravel/pulse');
        if (packagesToInstall.includes('horizon')) reqs.push('laravel/horizon');
        if (packagesToInstall.includes('socialite')) reqs.push('laravel/socialite');
        if (packagesToInstall.includes('volt')) reqs.push('livewire/volt');
        if (packagesToInstall.includes('backup')) reqs.push('spatie/laravel-backup');
        if (packagesToInstall.includes('medialibrary')) reqs.push('spatie/laravel-medialibrary');
        if (packagesToInstall.includes('activitylog')) reqs.push('spatie/laravel-activitylog');

        if (packagesToInstall.includes('telescope')) devReqs.push('laravel/telescope');
        if (packagesToInstall.includes('debugbar')) devReqs.push('barryvdh/laravel-debugbar');
        if (packagesToInstall.includes('ide-helper')) devReqs.push('barryvdh/laravel-ide-helper');

        try {
            if (reqs.length > 0) await run(`composer require ${reqs.join(' ')} -W`, project, isVerbose);
            if (devReqs.length > 0) {
                try { await run(`composer require ${devReqs.join(' ')} --dev -W`, project, isVerbose); }
                catch (e) { if (isVerbose) console.warn(pc.yellow(`\nWarning: Some dev packages failed.`)); }
            }

            // Post-install artisan commands
            if (packagesToInstall.includes('filament')) try { await run(`php artisan filament:install --panels -n`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('telescope')) try { await run(`php artisan telescope:install`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('pennant')) try { await run(`php artisan vendor:publish --provider="Laravel\\Pennant\\PennantServiceProvider"`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('pulse')) try { await run(`php artisan pulse:install`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('horizon')) try { await run(`php artisan horizon:install`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('volt')) try { await run(`php artisan volt:install`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('openai')) try { await run(`php artisan vendor:publish --provider="OpenAI\\Laravel\\ServiceProvider"`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('laravel-ai')) try { await run(`php artisan vendor:publish --tag="ai-config"`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('backup')) try { await run(`php artisan vendor:publish --provider="Spatie\\Backup\\BackupServiceProvider"`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('medialibrary')) try { await run(`php artisan vendor:publish --provider="Spatie\\MediaLibrary\\MediaLibraryServiceProvider" --tag="migrations"`, project, isVerbose); } catch(e){}
            if (packagesToInstall.includes('activitylog')) try { await run(`php artisan vendor:publish --provider="Spatie\\Activitylog\\ActivitylogServiceProvider" --tag="activitylog-migrations"`, project, isVerbose); } catch(e){}

            // Final Setup (Boost)
            if (extraFlags.includes('--boost')) {
                try {
                    if (isNonInteractive) {
                        await run(`php artisan boost:install -n`, project, isVerbose);
                        if (!isVerbose) s.stop(pc.yellow('Boost installed! Run manually later for 3rd party skills.'));
                    } else {
                        if (!isVerbose) s.stop('Preparing interactive Boost skill selection...');
                        
                        // We use a custom run with inherit for the interactive part
                        await new Promise((res, rej) => {
                            const child = require('node:child_process').spawn(`php artisan boost:install`, {
                                cwd: project,
                                stdio: 'inherit',
                                shell: true
                            });
                            child.on('close', (code) => code === 0 ? res() : rej());
                        });

                        if (!isVerbose) s.start('Finalizing setup...');
                    }
                } catch (e) {}
            }
            
            if (!isVerbose) s.stop('Packages installed successfully!');
            else console.log(pc.green(`[Basecamp] Package installation completed!`));
        } catch (error) {
            if (!isVerbose) s.stop('Warning: Package installation had errors.');
            console.error(pc.red(error.message));
        }
    }
}
