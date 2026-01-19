#!/bin/bash
# ---------------------------------------------------------------------------
# Documentation Generation Script for Hiyve Examples
# ---------------------------------------------------------------------------
#
# This script generates API documentation using TypeDoc and optionally serves
# it for preview. Run from the project root directory.
#
# Usage:
#   ./generate-docs.sh [options]
#
# Options:
#   --serve    Start a local server to preview docs after generation
#   --clean    Remove existing docs before generating
#   --json     Also generate JSON output for programmatic use
#   --help     Show this help message
#
# Examples:
#   ./generate-docs.sh              # Generate docs only
#   ./generate-docs.sh --serve      # Generate and preview
#   ./generate-docs.sh --clean      # Clean and regenerate
#   ./generate-docs.sh --json       # Generate with JSON output
# ---------------------------------------------------------------------------

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCS_DIR="./docs"
TYPEDOC_CONFIG="./typedoc.json"
SERVE_PORT=3032

# Parse arguments
SERVE=false
CLEAN=false
JSON_OUTPUT=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --serve) SERVE=true ;;
        --clean) CLEAN=true ;;
        --json) JSON_OUTPUT=true ;;
        --help)
            head -25 "$0" | tail -20
            exit 0
            ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
    shift
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Hiyve Examples - Documentation Generator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if typedoc is installed
if ! npx typedoc --version > /dev/null 2>&1; then
    echo -e "${RED}Error: TypeDoc is not installed.${NC}"
    echo -e "Run: ${YELLOW}npm install${NC}"
    exit 1
fi

# Check if config file exists
if [ ! -f "$TYPEDOC_CONFIG" ]; then
    echo -e "${RED}Error: TypeDoc config not found at $TYPEDOC_CONFIG${NC}"
    exit 1
fi

# Clean if requested
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}Cleaning existing documentation...${NC}"
    rm -rf "$DOCS_DIR" 2>/dev/null || true
    echo -e "${GREEN}✓ Cleaned${NC}"
fi

# Generate documentation
echo -e "${YELLOW}Generating documentation...${NC}"
echo ""

# Run TypeDoc
TYPEDOC_ARGS=""
if [ "$JSON_OUTPUT" = true ]; then
    TYPEDOC_ARGS="--json $DOCS_DIR/api.json"
fi

npx typedoc $TYPEDOC_ARGS

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Documentation generated successfully!${NC}"
    echo -e "  Output: ${BLUE}$DOCS_DIR${NC}"

    # Count documented items
    if [ -d "$DOCS_DIR" ]; then
        HTML_COUNT=$(find "$DOCS_DIR" -name "*.html" 2>/dev/null | wc -l | tr -d ' ')
        MD_COUNT=$(find "$DOCS_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$HTML_COUNT" -gt 0 ]; then
            echo -e "  Generated: ${BLUE}$HTML_COUNT${NC} HTML files"
        fi
        if [ "$MD_COUNT" -gt 0 ]; then
            echo -e "  Generated: ${BLUE}$MD_COUNT${NC} Markdown files"
        fi

        # Inject custom CSS for wider navigation
        echo -e "${YELLOW}Injecting custom CSS for wider navigation...${NC}"
        CUSTOM_CSS='<style>.site-menu{width:320px!important}.col-content{margin-left:320px!important}@media(min-width:1400px){.site-menu{width:360px!important}.col-content{margin-left:360px!important}}</style>'
        for htmlfile in "$DOCS_DIR"/*.html "$DOCS_DIR"/**/*.html; do
            if [ -f "$htmlfile" ]; then
                sed -i.bak "s|</head>|${CUSTOM_CSS}</head>|g" "$htmlfile"
                rm -f "$htmlfile.bak"
            fi
        done 2>/dev/null
    fi
else
    echo -e "${RED}✗ Documentation generation failed${NC}"
    exit 1
fi

# Serve documentation if requested
if [ "$SERVE" = true ]; then
    echo ""
    echo -e "${YELLOW}Starting documentation server...${NC}"
    echo -e "  URL: ${BLUE}http://localhost:$SERVE_PORT${NC}"
    echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop"
    echo ""

    # Check if serve is available
    if npx serve --version > /dev/null 2>&1; then
        npx serve "$DOCS_DIR" -l $SERVE_PORT
    else
        echo -e "${YELLOW}Installing serve...${NC}"
        npm install -g serve
        npx serve "$DOCS_DIR" -l $SERVE_PORT
    fi
fi

echo ""
echo -e "${GREEN}Done!${NC}"
