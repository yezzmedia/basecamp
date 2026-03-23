/**
 * ⛺ Basecamp - Step 1: Project Setup
 * 
 * Handles project naming and template selection.
 */

import { select, text, confirm, isCancel, outro, spinner } from '@clack/prompts';
import pc from 'picocolors';
import { existsSync, rmSync } from 'node:fs';
import { templates } from '../lib/templates.js';

export async function performSetup(args) {
    const { isNonInteractive, argTemplate, argName, forceOverwrite } = args;

    /**
     * PROJECT NAME & DIRECTORY CHECK
     */
    let project = argName || '';
    while (true) {
        if (!project && !isNonInteractive) {
            project = await text({
                message: 'What is your project named?',
                placeholder: 'basecamp-app',
                validate(value) {
                    const val = value || '';
                    if (val.length > 0) {
                        if (!/^[a-z0-9-_]+$/.test(val)) return 'Use only lowercase letters, numbers, hyphens, and underscores.';
                    }
                },
            });
            if (isCancel(project)) { outro('Setup cancelled.'); process.exit(0); }
        }

        if (!project) project = 'basecamp-app';

        if (existsSync(project)) {
            if (forceOverwrite) {
                const s_delete = spinner();
                s_delete.start(`Force deleting existing directory "${project}"...`);
                try {
                    rmSync(project, { recursive: true, force: true });
                    s_delete.stop(`Deleted "${project}".`);
                    break; 
                } catch (e) {
                    s_delete.stop(pc.red(`Failed to delete "${project}".`));
                    process.exit(1);
                }
            }

            if (isNonInteractive) {
                outro(pc.red(`Error: Directory "${project}" already exists. Use --force to overwrite.`));
                process.exit(1);
            }

            const action = await select({
                message: pc.yellow(`Directory "${project}" already exists. How do you want to proceed?`),
                options: [
                    { value: 'overwrite', label: 'Delete and overwrite', hint: pc.red('Warning: This will permanently delete the existing folder!') },
                    { value: 'rename', label: 'Provide a different name' },
                    { value: 'cancel', label: 'Cancel setup' },
                ],
            });

            if (isCancel(action) || action === 'cancel') { outro('Setup cancelled.'); process.exit(0); }

            if (action === 'overwrite') {
                const confirmed = await confirm({
                    message: pc.red(`Are you ABSOLUTELY sure? All data in "${project}" will be PERMANENTLY deleted.`),
                    initialValue: false,
                });

                if (isCancel(confirmed) || !confirmed) {
                    project = ''; 
                    continue;
                }

                const s_delete = spinner();
                s_delete.start(`Deleting existing directory "${project}"...`);
                try {
                    rmSync(project, { recursive: true, force: true });
                    s_delete.stop(`Deleted "${project}".`);
                    break;
                } catch (e) {
                    s_delete.stop(pc.red(`Failed to delete "${project}".`));
                    project = '';
                }
            } else {
                project = '';
            }
        } else {
            break; 
        }
    }

    /**
     * TEMPLATE SELECTION
     * Standard templates proceed immediately. "Custom" goes to configuration.
     */
    let templateKey = argTemplate || 'basecamp';

    if (!isNonInteractive && !argTemplate) {
        templateKey = await select({
            message: 'Select a project template:',
            options: Object.entries(templates).map(([key, t]) => ({
                value: key,
                label: t.label,
                hint: t.hint
            }))
        });
        if (isCancel(templateKey)) { outro('Setup cancelled.'); process.exit(0); }
    }

    const selectedTemplate = templates[templateKey] || templates.basecamp;
    // We only want to customize (manual mode) if the user explicitly chose the "custom" template
    const shouldCustomize = (templateKey === 'custom');
    const mode = shouldCustomize ? 'manual' : 'auto';

    return { project, selectedTemplate, shouldCustomize, mode };
}
