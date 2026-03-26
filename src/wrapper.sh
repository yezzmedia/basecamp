#!/usr/bin/env bash
# ⛺ Basecamp - Cross-Platform Laravel Installer
#
# This is the Bash entrypoint for the installer. It performs system checks,
# checks for updates, audits security, and executes the embedded Node.js payload.

# Wrap everything in a function to prevent partial execution when piped
main() {
    # Exit immediately if a command exits with a non-zero status.
    set -e

    # --- CONFIGURATION ---
    MIN_PHP_VERSION="8.2"
    MIN_NODE_VERSION="18"

    # Check for flags
    ARGS="$@"
    AUTO_UPDATE=0
    VERBOSE=0
    if [[ "$ARGS" == *"--yes"* ]] || [[ "$ARGS" == *"-y"* ]]; then
        AUTO_UPDATE=1
    fi
    if [[ "$ARGS" == *"--verbose"* ]]; then
        VERBOSE=1
    fi

    # Detect if we have a usable TTY for interactive prompts
    # We check if stdout is a TTY and if /dev/tty exists and is readable.
    # We also respect the CI environment variable to stay non-interactive.
    IS_INTERACTIVE=0
    if [ -t 1 ] && [ -c /dev/tty ] && [ -r /dev/tty ] && [ -z "${CI}" ]; then
        IS_INTERACTIVE=1
    fi

    echo "⛺ Basecamp - Starting system check..."
    echo "------------------------------------------------"

    # --- UPDATE HELPER ---
    update_tool() {
        local cmd=$1
        echo "🔄 Updating $cmd..."
        case $cmd in
            composer)
                if composer self-update || sudo composer self-update; then
                    return 0
                fi
                ;;
            laravel)
                echo "🚀 Updating Laravel environment via php.new..."
                if /bin/bash -c "$(curl -fsSL https://php.new/install/linux)"; then
                    return 0
                fi
                ;;
            npm)
                if npm install -g npm || sudo npm install -g npm; then
                    return 0
                fi
                ;;
        esac
        echo "❌ Failed to update $cmd."
        return 1
    }

    # --- SYSTEM CHECK HELPER ---
    check_dependency() {
        local cmd=$1
        local version_flag=$2
        local optional=$3
        
        printf "  %-12s " "Checking $cmd..."
        
        if command -v "$cmd" &> /dev/null; then
            local version_info
            version_info=$("$cmd" "$version_flag" 2>&1 | head -n 1)
            echo "✅ Found ($version_info)"
            
            # --- ALWAYS PERFORM UPDATE CHECKS ---
            case $cmd in
                composer)
                    local latest
                    latest=$(curl -s https://api.github.com/repos/composer/composer/releases/latest | grep -oE '"tag_name": "[^"]+"' | cut -d'"' -f4 || echo "")
                    if [ ! -z "$latest" ]; then
                        local current
                        current=$("$cmd" "$version_flag" 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
                        if [[ "$latest" != "$current" ]]; then
                            echo "     💡 Update available: $current -> $latest"
                            UPDATES_AVAILABLE=1
                            CAN_AUTO_UPDATE_LIST="$CAN_AUTO_UPDATE_LIST composer"
                        elif [[ "$VERBOSE" -eq 1 ]]; then
                            echo "     ✨ Composer is up to date."
                        fi
                    fi
                    ;;
                npm)
                    local latest
                    latest=$(npm view npm version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1 || echo "")
                    if [ ! -z "$latest" ]; then
                        local current
                        current=$("$cmd" "$version_flag" 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
                        if [[ "$latest" != "$current" ]]; then
                            echo "     💡 Update available: $current -> $latest"
                            UPDATES_AVAILABLE=1
                            CAN_AUTO_UPDATE_LIST="$CAN_AUTO_UPDATE_LIST npm"
                        elif [[ "$VERBOSE" -eq 1 ]]; then
                            echo "     ✨ npm is up to date."
                        fi
                    fi
                    ;;
                laravel)
                    local latest
                    latest=$(composer global show laravel/installer --latest 2>/dev/null | grep 'latest' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1 || echo "")
                    if [ ! -z "$latest" ]; then
                        local current
                        current=$("$cmd" "$version_flag" 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
                        if [[ "$latest" != "$current" ]]; then
                            echo "     💡 Update available: $current -> $latest"
                            UPDATES_AVAILABLE=1
                            CAN_AUTO_UPDATE_LIST="$CAN_AUTO_UPDATE_LIST laravel"
                        elif [[ "$VERBOSE" -eq 1 ]]; then
                            echo "     ✨ Laravel installer is up to date."
                        fi
                    elif [[ "$VERBOSE" -eq 1 ]]; then
                        echo "     ✨ Laravel installer is up to date."
                    fi
                    ;;
            esac

        else
            if [ "$optional" = "optional" ]; then
                echo "⚠️  NOT FOUND (Optional)"
            else
                echo "❌ NOT FOUND"
                MISSING_DEPS=1
            fi
        fi
    }

    # Track status
    MISSING_DEPS=0
    UPDATES_AVAILABLE=0
    CAN_AUTO_UPDATE_LIST=""

    # --- PREREQUISITES ---
    check_dependency "php" "-v"
    check_dependency "composer" "--version"
    check_dependency "laravel" "--version" "optional"
    check_dependency "node" "-v"
    check_dependency "npm" "-v"
    check_dependency "git" "--version"
    check_dependency "base64" "--version"

    # --- SECURITY AUDIT ---
    if command -v "composer" &> /dev/null; then
        printf "  %-12s " "Auditing..."
        if composer global audit --no-dev -q 2>/dev/null; then
            echo "✅ No global vulnerabilities found."
        else
            echo "⚠️  Vulnerabilities found in global packages!"
            echo "     💡 Run 'composer global update' to fix them."
        fi
    fi

    echo "------------------------------------------------"

    # Handle Missing Dependencies
    if [ "$MISSING_DEPS" -ne 0 ]; then
        echo "❌ Error: Some required dependencies are missing."
        exit 1
    fi

    # Handle Available Updates
    if [ "$UPDATES_AVAILABLE" -ne 0 ]; then
        DID_UPDATE=0
        if [ "$AUTO_UPDATE" -eq 1 ]; then
            for tool in $CAN_AUTO_UPDATE_LIST; do
                if update_tool "$tool"; then
                    DID_UPDATE=1
                fi
            done
        else
            echo "💡 Some tools have updates available."
            # Only prompt if we are interactive
            if [ "$IS_INTERACTIVE" -eq 1 ]; then
                printf "Do you want to update them now? (y/N): "
                # Read specifically from terminal to avoid consuming the script body
                read -r response < /dev/tty
                if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
                    for tool in $CAN_AUTO_UPDATE_LIST; do
                        if update_tool "$tool"; then
                            DID_UPDATE=1
                        fi
                    done
                fi
            else
                echo "     💡 Use --yes or -y to auto-update tools in non-interactive mode."
            fi
        fi

        # RESTART SCRIPT ONLY IF SUCCESSFUL AND RUNNING FROM DISK
        if [ "$DID_UPDATE" -eq 1 ]; then
            echo "✅ Updates applied successfully."
            # We only restart if $0 is a regular file. 
            if [ -f "$0" ]; then
                echo "🔄 Restarting Basecamp to apply changes..."
                echo ""
                sleep 1
                hash -r
                exec "$0" "$@"
            else
                echo "💡 Changes applied to your environment."
                hash -r
            fi
        fi
    fi

    echo "✅ System ready. Launching installer..."
    echo ""

    # --- EXTRACTION LOGIC ---
    TMP_DIR=$(mktemp -d -t basecamp.XXXXXX)
    cleanup() {
        rm -rf "$TMP_DIR"
    }
    trap cleanup EXIT

    # We use a HEREDOC to extract the payload.
    base64 --decode << 'BASECAMP_PAYLOAD' > "$TMP_DIR/installer.mjs"
{{PAYLOAD}}
BASECAMP_PAYLOAD

    # --- EXECUTION ---
    # If we are interactive, attach node to terminal for prompts
    if [ "$IS_INTERACTIVE" -eq 1 ]; then
        node "$TMP_DIR/installer.mjs" "$@" < /dev/tty
    else
        node "$TMP_DIR/installer.mjs" "$@"
    fi

    exit $?
}

# Execute main function with all arguments
main "$@"
