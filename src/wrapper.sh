#!/usr/bin/env bash
# ⛺ Basecamp - Cross-Platform Laravel Installer
#
# This is the Bash entrypoint for the installer. It performs system checks,
# checks for updates, audits security, and executes the embedded Node.js payload.

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

echo "⛺ Basecamp - Starting system check..."
echo "------------------------------------------------"

# --- UPDATE HELPER ---
update_tool() {
    local cmd=$1
    echo "🔄 Updating $cmd..."
    case $cmd in
        composer)
            # Try normal update, fallback to sudo if needed
            composer self-update || sudo composer self-update || echo "❌ Failed to update composer."
            ;;
        laravel)
            echo "🚀 Updating Laravel environment via php.new..."
            # Using the official modern installer from php.new
            /bin/bash -c "$(curl -fsSL https://php.new/install/linux)" || echo "❌ Failed to update via php.new."
            ;;
        npm)
            npm install -g npm || sudo npm install -g npm || echo "❌ Failed to update npm."
            ;;
    esac
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
                # Fetch the latest version tag from GitHub API for Composer
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
                elif [[ "$VERBOSE" -eq 1 ]]; then
                    echo "     ✨ Composer is up to date."
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
                # Check for Laravel installer updates via composer global
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
            update_tool "$tool"
            DID_UPDATE=1
        done
    else
        echo "💡 Some tools have updates available."
        printf "Do you want to update them now? (y/N): "
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            for tool in $CAN_AUTO_UPDATE_LIST; do
                update_tool "$tool"
                DID_UPDATE=1
            done
        fi
    fi

    if [ "$DID_UPDATE" -eq 1 ]; then
        echo "✅ Updates applied successfully."
        echo "🔄 Restarting Basecamp to apply changes..."
        echo ""
        sleep 1
        hash -r
        exec "$0" "$@"
    fi
fi

echo "✅ System ready. Launching installer..."
echo ""

# --- EXTRACTION LOGIC ---
# We must ensure that the script is readable from disk ($0).
# Piped execution (like 'curl | bash') is not supported for embedded payloads.
if [ ! -f "$0" ]; then
    echo "❌ Error: Basecamp cannot be executed directly from a pipe."
    echo "💡 Please use the official one-liner:"
    echo "   curl -fsSL https://raw.githubusercontent.com/yezzmedia/basecamp/main/dist/basecamp.sh -o basecamp.sh && bash basecamp.sh"
    exit 1
fi

PAYLOAD_START=$(awk '/^__ARCHIVE__/ {print NR + 1; exit 0;}' "$0")

if [ -z "$PAYLOAD_START" ]; then
    echo "❌ Error: Could not find embedded payload in the script."
    exit 1
fi

TMP_DIR=$(mktemp -d -t basecamp.XXXXXX)
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

tail -n +"$PAYLOAD_START" "$0" | base64 --decode > "$TMP_DIR/installer.mjs"

# --- EXECUTION ---
node "$TMP_DIR/installer.mjs" "$@"

exit $?

# --- PAYLOAD MARKER ---
__ARCHIVE__
