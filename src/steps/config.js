/**
 * ⛺ Basecamp - Step 2: Configuration
 * 
 * Handles manual configuration overrides for DB, flags, and packages.
 * Only runs if the user requested customization.
 */

import { select, multiselect, text, isCancel, outro } from '@clack/prompts';

export async function performConfig(args, setupData) {
    const { isNonInteractive, argDb, argPackages } = args;
    const { selectedTemplate, shouldCustomize } = setupData;

    // Default settings based on the selected template
    let db = argDb || 'sqlite';
    let extraFlags = [...selectedTemplate.flags];
    let packagesToInstall = [...selectedTemplate.packages];
    
    // Merge extra packages from command line (always applies)
    if (argPackages) {
        const extraPkgs = argPackages.split(',').map(p => p.trim().toLowerCase());
        packagesToInstall = [...new Set([...packagesToInstall, ...extraPkgs])];
    }

    let adminEmail = 'admin@example.com';
    let adminPassword = 'password';

    // Manual overrides - only if shouldCustomize is true and not in non-interactive mode
    if (shouldCustomize && !isNonInteractive) {
        /**
         * DB SELECTION
         */
        db = await select({
            message: 'Which database do you want to use?',
            options: [
                { value: 'sqlite', label: 'SQLite', hint: 'Default, recommended for local dev' },
                { value: 'mysql', label: 'MySQL' },
                { value: 'pgsql', label: 'PostgreSQL' },
            ],
        });
        if (isCancel(db)) { outro('Setup cancelled.'); process.exit(0); }

        /**
         * FLAGS
         */
        extraFlags = await multiselect({
            message: 'Select Laravel starter flags:',
            options: [
                { value: '--git', label: 'Git Init', hint: 'Initialize a git repository', selected: extraFlags.includes('--git') },
                { value: '--pest', label: 'Pest', hint: 'Install Pest testing framework', selected: extraFlags.includes('--pest') },
                { value: '--boost', label: 'Boost', hint: 'Install Laravel Boost for speed', selected: extraFlags.includes('--boost') },
                { value: '--livewire', label: 'Livewire', hint: 'Starter kit with Livewire', selected: extraFlags.includes('--livewire') },
                { value: '--npm', label: 'NPM', hint: 'Run npm install after project creation', selected: extraFlags.includes('--npm') },
                { value: '--breeze', label: 'Breeze', hint: 'Install Laravel Breeze (Starter Kit)', selected: extraFlags.includes('--breeze') },
                { value: '--dev', label: 'Dev Branch', hint: 'Install the latest develop branch of Laravel', selected: extraFlags.includes('--dev') },
            ],
            required: false,
        });
        if (isCancel(extraFlags)) { outro('Setup cancelled.'); process.exit(0); }

        /**
         * PACKAGES
         */
        const selectedPackages = await multiselect({
            message: 'Which extra packages do you want to install?',
            options: [
                { value: 'filament', label: 'Filament v5', hint: 'Admin Panel, Forms, Tables', selected: packagesToInstall.includes('filament') },
                { value: 'laravel-ai', label: 'Laravel AI SDK', hint: 'Official Laravel AI SDK (Unified API)', selected: packagesToInstall.includes('laravel-ai') },
                { value: 'debugbar', label: 'Laravel Debugbar', hint: 'Developer Toolbar', selected: packagesToInstall.includes('debugbar') },
                { value: 'ide-helper', label: 'Laravel IDE Helper', hint: 'Better IDE Autocompletion', selected: packagesToInstall.includes('ide-helper') },
                { value: 'openai', label: 'Laravel AI (OpenAI)', hint: 'OpenAI PHP integration', selected: packagesToInstall.includes('openai') },
                { value: 'permission', label: 'Permissions (Spatie)', hint: 'Manage roles and permissions', selected: packagesToInstall.includes('permission') },
                { value: 'telescope', label: 'Telescope', hint: 'Elegant debug assistant', selected: packagesToInstall.includes('telescope') },
                { value: 'pennant', label: 'Pennant', hint: 'Feature flag management', selected: packagesToInstall.includes('pennant') },
                { value: 'pulse', label: 'Pulse', hint: 'Real-time application monitoring', selected: packagesToInstall.includes('pulse') },
                { value: 'horizon', label: 'Horizon', hint: 'Beautiful dashboard for Redis queues', selected: packagesToInstall.includes('horizon') },
                { value: 'socialite', label: 'Socialite', hint: 'OAuth authentication (Google, GitHub, etc.)', selected: packagesToInstall.includes('socialite') },
                { value: 'volt', label: 'Volt', hint: 'Single-file Livewire components', selected: packagesToInstall.includes('volt') },
                { value: 'backup', label: 'Backup (Spatie)', hint: 'Backup your app and database', selected: packagesToInstall.includes('backup') },
                { value: 'medialibrary', label: 'Media Library (Spatie)', hint: 'Associate files with Eloquent models', selected: packagesToInstall.includes('medialibrary') },
                { value: 'activitylog', label: 'Activity Log (Spatie)', hint: 'Log activity inside your app', selected: packagesToInstall.includes('activitylog') },
            ],
            required: false,
        });
        if (isCancel(selectedPackages)) { outro('Setup cancelled.'); process.exit(0); }
        packagesToInstall = selectedPackages || [];

        /**
         * FILAMENT CREDENTIALS
         */
        if (packagesToInstall.includes('filament')) {
            adminEmail = await text({
                message: 'Enter Filament Admin Email:',
                placeholder: 'admin@example.com',
                initialValue: 'admin@example.com',
                validate(value) { if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format.'; }
            });
            if (isCancel(adminEmail)) { outro('Setup cancelled.'); process.exit(0); }

            adminPassword = await text({
                message: 'Enter Filament Admin Password:',
                placeholder: 'password',
                initialValue: 'password',
                validate(value) { if (value.length < 8) return 'Password must be at least 8 characters.'; }
            });
            if (isCancel(adminPassword)) { outro('Setup cancelled.'); process.exit(0); }
        }
    }

    return { db, extraFlags, packagesToInstall, adminEmail, adminPassword };
}
