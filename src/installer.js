/**
 * ⛺ Basecamp - Modern Laravel Installer
 * 
 * Main Entry Point. Orchestrates the modular installation steps.
 */

import { spinner } from '@clack/prompts';
import { getArgValue, hasFlag } from './lib/utils.js';
import { printLogo } from './lib/logo.js';
import { performSetup } from './steps/setup.js';
import { performConfig } from './steps/config.js';
import { performInstallation } from './steps/install.js';
import { performFinish } from './steps/finish.js';

async function main() {
    // Print the beautiful ASCII logo
    printLogo();

    // Collect all command line arguments
    const args = {
        isVerbose: hasFlag('--verbose'),
        isNonInteractive: hasFlag('--non-interactive') || hasFlag('--yes') || hasFlag('-y'),
        forceOverwrite: hasFlag('--force'),
        argName: getArgValue('--name'),
        argDb: getArgValue('--db'),
        argMode: getArgValue('--mode'),
        argTemplate: getArgValue('--template'),
        argPackages: getArgValue('--packages')
    };

    /**
     * STEP 1: SETUP
     * Handles naming, directory checks, and mode/template selection.
     */
    const setupData = await performSetup(args);

    /**
     * STEP 2: CONFIGURATION
     * Gathers DB, flags, and package choices based on template and overrides.
     */
    const configData = await performConfig(args, setupData);

    const s = spinner();

    /**
     * STEP 3: INSTALLATION
     * The heavy lifting: Laravel core, composer packages, and initial setup.
     */
    await performInstallation(args, setupData, configData, s);

    /**
     * STEP 4: FINISH
     * Post-install steps like migrations, user creation, build and summary.
     */
    await performFinish(args, setupData, configData, s);
}

// Global error handler
main().catch((error) => {
    console.error('\n❌ A critical error occurred during setup:');
    console.error(error.message || error);
    process.exit(1);
});
