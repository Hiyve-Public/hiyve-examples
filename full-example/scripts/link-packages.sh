#!/bin/bash
# Creates symlinks to local @hiyve packages for live development
# Run this after npm install to restore symlinks

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGES_DIR="$(cd "$PROJECT_DIR/../../hiyve-components/packages" && pwd)"

cd "$PROJECT_DIR"

rm -rf node_modules/@hiyve
mkdir -p node_modules/@hiyve

packages=(
  "audio-monitor"
  "chat"
  "client-provider"
  "control-bar"
  "device-selector"
  "file-manager"
  "mood-analysis"
  "participant-list"
  "recording"
  "sidebar"
  "transcription"
  "video-grid"
  "video-tile"
  "waiting-room"
  "whiteboard"
)

for pkg in "${packages[@]}"; do
  ln -s "$PACKAGES_DIR/$pkg" "node_modules/@hiyve/$pkg"
done

echo "✓ Symlinked ${#packages[@]} @hiyve packages to $PACKAGES_DIR"
