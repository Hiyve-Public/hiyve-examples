#!/bin/bash

# Toggle between local development packages and registry production packages
#
# Usage:
#   ./toggle-packages.sh dev    # Use local packages from hiyve-sdk
#   ./toggle-packages.sh prod   # Use registry packages
#   ./toggle-packages.sh status # Show current mode
#
# IMPORTANT: Always run `./toggle-packages.sh prod` before committing to the public
# examples repo, so it references the registry packages (not local file paths).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASIC_EXAMPLE_DIR="$SCRIPT_DIR/basic-example"
FULL_EXAMPLE_DIR="$SCRIPT_DIR/full-example"
TOKEN_ROOM_EXAMPLE_DIR="$SCRIPT_DIR/token-room-example"
NEXTJS_EXAMPLE_DIR="$SCRIPT_DIR/nextjs-example"
COMPONENTS_DIR="$SCRIPT_DIR/../hiyve-sdk"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    echo ""
    echo -e "${CYAN}Toggle Packages - Switch between local and registry packages${NC}"
    echo ""
    echo "Usage: ./toggle-packages.sh <command>"
    echo ""
    echo "Commands:"
    echo "  dev     Switch to local packages and rebuild"
    echo "  prod    Switch to registry packages and reinstall"
    echo "  status  Show current mode for all examples"
    echo ""
    echo -e "${YELLOW}IMPORTANT:${NC} Always run './toggle-packages.sh prod' before committing!"
    echo ""
}

do_status() {
    echo ""
    echo -e "${CYAN}=== basic-example ===${NC}"
    cd "$BASIC_EXAMPLE_DIR"
    node scripts/toggle-packages.js status

    echo -e "${CYAN}=== full-example ===${NC}"
    cd "$FULL_EXAMPLE_DIR"
    node scripts/toggle-packages.js status

    echo -e "${CYAN}=== token-room-example ===${NC}"
    cd "$TOKEN_ROOM_EXAMPLE_DIR"
    node scripts/toggle-packages.js status

    echo -e "${CYAN}=== nextjs-example ===${NC}"
    cd "$NEXTJS_EXAMPLE_DIR"
    node scripts/toggle-packages.js status
}

toggle_example() {
    local example_dir="$1"
    local example_name="$2"
    local mode="$3"

    print_status "[$example_name] Updating package.json..."
    cd "$example_dir"
    node scripts/toggle-packages.js "$mode"

    if [ "$mode" = "prod" ]; then
        # Clean pnpm store to ensure fresh packages
        pnpm store prune 2>/dev/null || true
    fi

    print_status "[$example_name] Cleaning node_modules and pnpm-lock.yaml..."
    rm -rf node_modules pnpm-lock.yaml

    print_status "[$example_name] Installing dependencies..."
    pnpm install
}

do_dev() {
    echo ""
    print_status "Switching to DEV mode (local packages)"
    echo ""

    # Check if hiyve-sdk exists
    if [ ! -d "$COMPONENTS_DIR" ]; then
        print_error "hiyve-sdk not found at: $COMPONENTS_DIR"
        exit 1
    fi

    # Build hiyve-sdk first
    print_status "Building hiyve-sdk packages..."
    cd "$COMPONENTS_DIR"
    pnpm build

    # Toggle all examples
    toggle_example "$BASIC_EXAMPLE_DIR" "basic-example" "dev"
    toggle_example "$FULL_EXAMPLE_DIR" "full-example" "dev"
    toggle_example "$TOKEN_ROOM_EXAMPLE_DIR" "token-room-example" "dev"
    toggle_example "$NEXTJS_EXAMPLE_DIR" "nextjs-example" "dev"

    echo ""
    print_status "DEV mode ready!"
    echo ""
    echo -e "  Run ${CYAN}pnpm run dev${NC} in any example to start the app"
    echo -e "  Run ${CYAN}pnpm dev${NC} in hiyve-sdk for watch mode"
    echo ""
    print_warning "Remember to run './toggle-packages.sh prod' before committing!"
    echo ""
}

do_prod() {
    echo ""
    print_status "Switching to PROD mode (registry packages)"
    echo ""

    # Toggle all examples
    toggle_example "$BASIC_EXAMPLE_DIR" "basic-example" "prod"
    toggle_example "$FULL_EXAMPLE_DIR" "full-example" "prod"
    toggle_example "$TOKEN_ROOM_EXAMPLE_DIR" "token-room-example" "prod"
    toggle_example "$NEXTJS_EXAMPLE_DIR" "nextjs-example" "prod"

    echo ""
    print_status "PROD mode ready!"
    echo ""
    echo -e "  Run ${CYAN}pnpm run dev${NC} in any example to start the app"
    echo ""
}

# Main
case "${1:-}" in
    dev)
        do_dev
        ;;
    prod)
        do_prod
        ;;
    status)
        do_status
        ;;
    *)
        show_usage
        ;;
esac
