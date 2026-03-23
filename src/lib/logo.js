/**
 * ⛺ Basecamp - ASCII Art Logo
 */

import pc from 'picocolors';

export const printLogo = () => {
    const logo = `
   ${pc.blue('   /\\')}
   ${pc.blue('  /  \\')}
   ${pc.blue(' /    \\')}      ${pc.white(pc.bold('BASECAMP'))}
   ${pc.blue('/______\\')}     ${pc.dim('Modern Laravel Installer')}
  ${pc.blue('/ /    \\ \\')}    ${pc.dim('v1.0.0')}
 ${pc.blue('/_/______\\_\\')}
    `;

    const bigLogo = `
${pc.blue('      _BASE_')}
${pc.blue('     /      \\')}
${pc.blue('    /        \\')}      ${pc.white(pc.bold('BASECAMP'))}
${pc.blue('   /    /\\    \\')}     ${pc.dim('The Modern Laravel Installer')}
${pc.blue('  /    /  \\    \\')}    ${pc.dim('v0.1.0')}
${pc.blue(' /____/____\\____\\')}
${pc.blue(' \\____\\____/____/')}
    `;

    console.log(bigLogo);
};
