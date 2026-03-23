/**
 * ⛺ Basecamp - Utilities
 * 
 * Shared helper functions and command-line argument parsing.
 */

import { spawn } from 'node:child_process';
import pc from 'picocolors';

/**
 * Check if a specific flag is present in the arguments.
 */
export const hasFlag = (flag) => process.argv.slice(2).includes(flag);

/**
 * Extract values from key-value arguments (e.g., --name my-app OR --name=my-app)
 */
export const getArgValue = (key) => {
    const args = process.argv.slice(2);
    
    // Check for --key=value format
    const eqFormat = args.find(a => a.startsWith(`${key}=`));
    if (eqFormat) return eqFormat.split('=')[1];

    // Check for --key value format
    const index = args.indexOf(key);
    return (index !== -1 && args[index + 1] && !args[index + 1].startsWith('-')) ? args[index + 1] : null;
};

/**
 * Helper to run shell commands asynchronously.
 * This allows the event loop to stay active so spinners can animate.
 */
export const run = (cmd, projectDir, isVerbose) => {
    return new Promise((resolve, reject) => {
        if (isVerbose) {
            console.log(pc.dim(`\n[Basecamp] Executing: ${cmd}`));
        }

        // Use shell: true to handle complex commands and pipes
        const child = spawn(cmd, {
            cwd: projectDir,
            stdio: isVerbose ? 'inherit' : 'pipe',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(true);
            } else {
                if (isVerbose) {
                    console.error(pc.red(`\n[Basecamp] Command failed with exit code ${code}: ${cmd}`));
                }
                reject(new Error(`Command failed: ${cmd}`));
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
};
