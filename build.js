/**
 * ⛺ Basecamp - Build Tool
 * 
 * This script bundles the 'src/installer.js' (and its npm dependencies) 
 * into a single base64-encoded payload and embeds it into 'src/wrapper.sh' 
 * to create the final distributable 'dist/basecamp.sh' file.
 */

import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

async function build() {
    console.log('Building Basecamp...');

    /**
     * STEP 1: BUNDLING
     * Use 'esbuild' to bundle 'src/installer.js' into a single file.
     * This also minifies the code and resolves all '@clack/prompts' 
     * and 'picocolors' imports into the bundle.
     */
    await esbuild.build({
        entryPoints: ['src/installer.js'],
        bundle: true,
        platform: 'node',
        target: 'node18', // Ensure compatibility with current Node.js versions
        format: 'esm',    // Bundled as an ECMAScript Module
        outfile: 'dist/installer.bundle.mjs',
        minify: true,     // Reduces the size of the final .sh file
    });

    /**
     * STEP 2: ENCODING
     * Read the bundled JavaScript file and convert it to a Base64 string.
     * This allows us to safely embed the code inside a Bash script.
     */
    const bundledJs = fs.readFileSync('dist/installer.bundle.mjs');
    const base64Js = bundledJs.toString('base64');

    /**
     * STEP 3: WRAPPING
     * Read the Bash wrapper (src/wrapper.sh) which contains the 
     * extraction and execution logic.
     */
    const wrapper = fs.readFileSync('src/wrapper.sh', 'utf-8');

    /**
     * STEP 4: ASSEMBLING
     * Concatenate the wrapper script and the base64-encoded payload.
     * The payload starts after the '__ARCHIVE__' marker in the wrapper.
     */
    const finalScript = `${wrapper}\n${base64Js}\n`;

    /**
     * STEP 5: WRITING & PERMISSIONS
     * Save the final script to 'dist/basecamp.sh' and make it executable (chmod +x).
     */
    fs.writeFileSync('dist/basecamp.sh', finalScript, { mode: 0o755 });

    console.log('Build complete! Output: dist/basecamp.sh');
}

// Execute the build process and catch errors
build().catch(console.error);
