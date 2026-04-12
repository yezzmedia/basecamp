/**
 * ⛺ Basecamp - Template Definitions
 * 
 * Defines the available project templates and their default configurations.
 */

export const templates = {
    basecamp: {
        label: 'Basecamp (Standard)',
        hint: 'The balanced default: Filament, Pest, Boost, Git, Livewire',
        flags: ['--pest', '--git', '--boost', '--livewire', '--npm'],
        packages: ['filament', 'debugbar']
    },
    minimal: {
        label: 'Minimal',
        hint: 'Barebones Laravel: Pest, Git, NPM only',
        flags: ['--pest', '--git', '--npm'],
        packages: []
    },
    yezzmedia: {
        label: 'Yezzmedia',
        hint: 'Basecamp Standard + Yezzmedia Suite',
        flags: ['--pest', '--git', '--boost', '--livewire', '--npm'],
        packages: [
            'filament',
            'debugbar',
            'yezzmedia-foundation',
            'yezzmedia-access',
            'yezzmedia-ops',
            'yezzmedia-ops-infrastructure',
            'yezzmedia-ops-security',
            'yezzmedia-ops-sites',
            'yezzmedia-ops-analytics',
            'yezzmedia-ops-backups'
        ]
    },
    ai: {
        label: 'AI Expert',
        hint: 'Basecamp + Official Laravel AI SDK and Feature Flags',
        flags: ['--pest', '--git', '--boost', '--livewire', '--npm'],
        packages: ['filament', 'laravel-ai', 'openai', 'pennant']
    },
    full: {
        label: 'Full Stack Ops',
        hint: 'The kitchen sink: AI, Monitoring, Backups, Permissions, Socialite',
        flags: ['--pest', '--git', '--boost', '--livewire', '--npm'],
        packages: [
            'filament', 'laravel-ai', 'openai', 'debugbar', 'ide-helper', 'permission', 
            'telescope', 'pennant', 'pulse', 'horizon', 'socialite', 
            'volt', 'backup', 'medialibrary', 'activitylog'
        ]
    },
    custom: {
        label: 'Custom (Manual)',
        hint: 'Configure everything from scratch',
        flags: ['--git', '--npm'],
        packages: []
    }
};
