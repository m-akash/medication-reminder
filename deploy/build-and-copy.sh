#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# build-and-copy.sh
#
# Builds the Angular production bundle and merges it into the ASP.NET Core
# backend's wwwroot. This enables a single-domain deploy where the Angular
# UI and the API are served from the same host.
#
# Usage:
#   ./deploy/build-and-copy.sh
#
# Steps:
#   1. Production build of angular-client (output: dist/angular-client/browser/)
#   2. Copy the Angular output into the backend wwwroot, preserving ABP's own
#      assets (libs/, images/, global-styles.css).
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

# Resolve repo root from the script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ANGULAR_DIR="$REPO_ROOT/angular-client"
WWWROOT="$REPO_ROOT/aspnet-core/src/MedicineReminder.HttpApi.Host/wwwroot"

echo "> Building Angular production bundle..."
cd "$ANGULAR_DIR"
npm run build:prod

BUILD_OUT="$ANGULAR_DIR/dist/angular-client/browser"
if [ ! -f "$BUILD_OUT/index.html" ]; then
  echo "ERROR: build output not found: $BUILD_OUT/index.html" >&2
  exit 1
fi

echo "> Copying Angular output into backend wwwroot..."
mkdir -p "$WWWROOT"

# Remove stale Angular build artifacts (hashed names leave old files behind).
# ABP's own assets (libs/, images/, global-styles.css) are kept intact.
find "$WWWROOT" -maxdepth 1 \( -name "*.js" -o -name "*.js.map" -o -name "*.css" -o -name "*.css.map" -o -name "index.html" -o -name "favicon.ico" -o -name "prerendered-routes.json" \) -delete 2>/dev/null || true

# Copy all content of dist/angular-client/browser/ into wwwroot.
# - index.html is overwritten (SPA entry point).
# - ABP's libs/, images/, global-styles.css have distinct names so they do not
#   collide with Angular's output; they remain untouched.
cp -R "$BUILD_OUT/." "$WWWROOT/"

echo "DONE. Angular is now served from wwwroot."
echo "  wwwroot: $WWWROOT"
