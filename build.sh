#!/bin/bash
# Build and package wp-feed-display plugin for distribution.
# Usage: ./build.sh

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$(dirname "$PLUGIN_DIR")"
PLUGIN_NAME="wp-feed-display"
ZIP_FILE="$DIST_DIR/$PLUGIN_NAME.zip"

echo "==> Building block..."
cd "$PLUGIN_DIR"
npm run build

echo "==> Creating $ZIP_FILE..."
rm -f "$ZIP_FILE"
cd "$DIST_DIR"
zip -r "$ZIP_FILE" \
  "$PLUGIN_NAME/wp-feed-display.php" \
  "$PLUGIN_NAME/includes/" \
  "$PLUGIN_NAME/assets/" \
  "$PLUGIN_NAME/build/" \
  -x "*.DS_Store"

SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo "==> Done: $ZIP_FILE ($SIZE)"
