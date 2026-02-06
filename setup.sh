#!/bin/bash

# Hiyve Examples - Setup Script
#
# This script sets up everything needed to run the hiyve-examples project
# after downloading (via git clone or zip download).
#
# Usage:
#   ./setup.sh                    # Full interactive setup (all examples)
#   ./setup.sh --quick            # Skip prompts, use defaults
#   ./setup.sh basic-example      # Setup only basic-example
#   ./setup.sh full-example       # Setup only full-example
#   ./setup.sh token-room-example # Setup only token-room-example
#   ./setup.sh nextjs-example     # Setup only nextjs-example

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASIC_EXAMPLE_DIR="$SCRIPT_DIR/basic-example"
FULL_EXAMPLE_DIR="$SCRIPT_DIR/full-example"
TOKEN_EXAMPLE_DIR="$SCRIPT_DIR/token-room-example"
NEXTJS_EXAMPLE_DIR="$SCRIPT_DIR/nextjs-example"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Credentials (collected early, used throughout)
HIYVE_APIKEY=""
HIYVE_CLIENT_SECRET=""

# Parse arguments
QUICK_MODE=false
TARGET_EXAMPLE=""

for arg in "$@"; do
    case $arg in
        --quick|-q)
            QUICK_MODE=true
            ;;
        basic-example|full-example|token-room-example|nextjs-example)
            TARGET_EXAMPLE="$arg"
            ;;
    esac
done

print_banner() {
    echo ""
    echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}${BOLD}║              Hiyve Examples - Setup Script                 ║${NC}"
    echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_step() {
    echo -e "\n${CYAN}▶${NC} ${BOLD}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "  $1"
}

# Check Node.js version
check_node() {
    print_step "Checking Node.js version..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        echo ""
        echo "  Please install Node.js 18 or later:"
        echo "    - macOS: brew install node"
        echo "    - Linux: https://nodejs.org/en/download/"
        echo "    - Windows: https://nodejs.org/en/download/"
        echo ""
        exit 1
    fi

    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ required (found $(node -v))"
        echo ""
        echo "  Please upgrade Node.js to version 18 or later"
        echo ""
        exit 1
    fi

    print_status "Node.js $(node -v) detected"
}

# Check pnpm
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        exit 1
    fi
    print_status "pnpm $(pnpm -v) detected"
}

# Collect and validate Hiyve credentials
collect_credentials() {
    print_step "Hiyve API Credentials"
    echo ""
    echo -e "  Get your credentials at: ${CYAN}https://console.hiyve.dev${NC}"
    echo ""

    if [ "$QUICK_MODE" = true ]; then
        print_warning "Quick mode: skipping credential collection."
        print_warning "You'll need to configure credentials manually."
        return 0
    fi

    # Collect API Key
    read -p "  Enter your API Key: " HIYVE_APIKEY
    echo ""

    if [ -z "$HIYVE_APIKEY" ]; then
        print_error "API Key is required"
        echo ""
        echo "  Get your API key at: https://console.hiyve.dev"
        echo ""
        exit 1
    fi

    # Validate API Key by authenticating with the registry
    print_info "Validating API Key..."
    if npx hiyve-cli login --key "$HIYVE_APIKEY" 2>/dev/null; then
        print_status "API Key validated and npm registry configured"
    else
        print_error "Invalid API Key"
        echo ""
        echo "  Please check your API key and try again."
        echo "  Get your API key at: https://console.hiyve.dev"
        echo ""
        exit 1
    fi

    # Collect Client Secret
    read -p "  Enter your Client Secret: " HIYVE_CLIENT_SECRET
    echo ""

    if [ -z "$HIYVE_CLIENT_SECRET" ]; then
        print_error "Client Secret is required"
        echo ""
        echo "  Get your credentials at: https://console.hiyve.dev"
        echo ""
        exit 1
    fi
}

# Install dependencies for a single example
install_example_dependencies() {
    local EXAMPLE_DIR="$1"
    local EXAMPLE_NAME="$(basename "$EXAMPLE_DIR")"

    print_info "Installing $EXAMPLE_NAME frontend dependencies..."
    cd "$EXAMPLE_DIR"
    pnpm install
    print_status "$EXAMPLE_NAME frontend dependencies installed"

    if [ -d "$EXAMPLE_DIR/server" ]; then
        print_info "Installing $EXAMPLE_NAME server dependencies..."
        cd "$EXAMPLE_DIR/server"
        pnpm install
        print_status "$EXAMPLE_NAME server dependencies installed"
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."

    if [ -n "$TARGET_EXAMPLE" ]; then
        # Install only the specified example
        install_example_dependencies "$SCRIPT_DIR/$TARGET_EXAMPLE"
    else
        # Install all examples
        install_example_dependencies "$BASIC_EXAMPLE_DIR"
        install_example_dependencies "$FULL_EXAMPLE_DIR"
        install_example_dependencies "$TOKEN_EXAMPLE_DIR"
        install_example_dependencies "$NEXTJS_EXAMPLE_DIR"
    fi
}

# Setup environment file for a single example
setup_example_env() {
    local EXAMPLE_DIR="$1"
    local EXAMPLE_NAME="$(basename "$EXAMPLE_DIR")"

    # Determine env file location (server/.env for Vite examples, .env for Next.js)
    local ENV_FILE=""
    local ENV_EXAMPLE=""

    if [ -d "$EXAMPLE_DIR/server" ]; then
        ENV_FILE="$EXAMPLE_DIR/server/.env"
        ENV_EXAMPLE="$EXAMPLE_DIR/server/.env.example"
    elif [ -f "$EXAMPLE_DIR/.env.example" ]; then
        ENV_FILE="$EXAMPLE_DIR/.env"
        ENV_EXAMPLE="$EXAMPLE_DIR/.env.example"
    else
        return 0
    fi

    # Create env file from template if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        print_info "Created $EXAMPLE_NAME environment file"
    fi

    # Update with credentials if provided
    if [ -n "$HIYVE_APIKEY" ] && [ -n "$HIYVE_CLIENT_SECRET" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/APIKEY=.*/APIKEY=$HIYVE_APIKEY/" "$ENV_FILE"
            sed -i '' "s/CLIENT_SECRET=.*/CLIENT_SECRET=$HIYVE_CLIENT_SECRET/" "$ENV_FILE"
        else
            sed -i "s/APIKEY=.*/APIKEY=$HIYVE_APIKEY/" "$ENV_FILE"
            sed -i "s/CLIENT_SECRET=.*/CLIENT_SECRET=$HIYVE_CLIENT_SECRET/" "$ENV_FILE"
        fi
        print_status "$EXAMPLE_NAME environment configured"
    else
        print_warning "$EXAMPLE_NAME .env needs APIKEY and CLIENT_SECRET"
    fi
}

# Setup environment files
setup_env() {
    print_step "Setting up environment files..."

    if [ -n "$TARGET_EXAMPLE" ]; then
        setup_example_env "$SCRIPT_DIR/$TARGET_EXAMPLE"
    else
        setup_example_env "$BASIC_EXAMPLE_DIR"
        setup_example_env "$FULL_EXAMPLE_DIR"
        setup_example_env "$TOKEN_EXAMPLE_DIR"
        setup_example_env "$NEXTJS_EXAMPLE_DIR"
    fi
}

# Print final instructions
print_success() {
    echo ""
    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                    Setup Complete!                         ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check if credentials are configured
    NEEDS_CREDS=false
    for ENV_FILE in "$BASIC_EXAMPLE_DIR/server/.env" "$FULL_EXAMPLE_DIR/server/.env" "$TOKEN_EXAMPLE_DIR/server/.env" "$NEXTJS_EXAMPLE_DIR/.env"; do
        if [ -f "$ENV_FILE" ] && grep -q "your-api-key-here\|your-client-secret-here" "$ENV_FILE" 2>/dev/null; then
            NEEDS_CREDS=true
            break
        fi
    done

    if [ "$NEEDS_CREDS" = true ]; then
        echo -e "${YELLOW}Before starting, configure your API credentials:${NC}"
        echo ""
        echo "  Edit the .env file in the example you want to run:"
        echo "  - basic-example/server/.env"
        echo "  - full-example/server/.env"
        echo "  - token-room-example/server/.env"
        echo "  - nextjs-example/.env"
        echo ""
        echo "  Set APIKEY and CLIENT_SECRET in the .env file."
        echo "  Get credentials at https://console.hiyve.dev"
        echo ""
    fi

    echo -e "${BOLD}Available Examples:${NC}"
    echo ""
    echo -e "  ${CYAN}Basic Example${NC} - Minimal video room (Vite + Express)"
    echo -e "    cd basic-example && pnpm run dev"
    echo ""
    echo -e "  ${CYAN}Full Example${NC} - Feature-rich video conferencing app"
    echo -e "    cd full-example && pnpm run dev"
    echo ""
    echo -e "  ${CYAN}Token Room Example${NC} - Token-based room joining with invite links"
    echo -e "    cd token-room-example && pnpm run dev"
    echo ""
    echo -e "  ${CYAN}Next.js Example${NC} - Next.js App Router integration"
    echo -e "    cd nextjs-example && pnpm run dev"
    echo ""
    echo "  Vite examples start frontend (5173) + backend (3001)."
    echo "  Next.js runs on port 3000 with API routes built-in."
    echo ""
    echo -e "  Open ${CYAN}http://localhost:5173${NC} (Vite) or ${CYAN}http://localhost:3000${NC} (Next.js)"
    echo ""
}

# Main execution
main() {
    print_banner

    check_node
    check_pnpm
    collect_credentials
    install_dependencies
    setup_env

    print_success
}

main
