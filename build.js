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
     */
    await esbuild.build({
        entryPoints: ['src/installer.js'],
        bundle: true,
        platform: 'node',
        target: 'node18',
        format: 'esm',
        outfile: 'dist/installer.bundle.mjs',
        minify: true,
    });

    /**
     * STEP 2: ENCODING
     * Read the bundled JavaScript file and convert it to a Base64 string.
     */
    const bundledJs = fs.readFileSync('dist/installer.bundle.mjs');
    const base64Js = bundledJs.toString('base64');

    /**
     * STEP 3: WRAPPING
     * Read the Bash wrapper (src/wrapper.sh).
     */
    const wrapper = fs.readFileSync('src/wrapper.sh', 'utf-8');

    /**
     * STEP 4: ASSEMBLING
     * Replace the {{PAYLOAD}} placeholder with the base64 string.
     */
    const finalScript = wrapper.replace('{{PAYLOAD}}', base64Js);

    /**
     * STEP 5: WRITING & PERMISSIONS
     * Save the final script to 'dist/basecamp.sh' and make it executable.
     */
    fs.writeFileSync('dist/basecamp.sh', finalScript, { mode: 0o755 });

    console.log('Build complete! Output: dist/basecamp.sh');
}

build().catch(console.error);
