#!/bin/sh
# scripts/start.sh
# Runs on every container start.
# Moves persistent directories to the Railway Volume (/app/storage)
# and symlinks them back, so uploads survive redeployments.

set -e

STORAGE=/app/storage

# ── Create persistent subdirectories on the volume ──
mkdir -p "$STORAGE/original_images"
mkdir -p "$STORAGE/uploads"
mkdir -p "$STORAGE/voice-notes"
mkdir -p "$STORAGE/wishes"

# ── Symlink public media directories to the persistent volume ──
# Remove the empty dirs created by Docker and replace with symlinks

if [ ! -L /app/public/original_images ]; then
  rm -rf /app/public/original_images
  ln -s "$STORAGE/original_images" /app/public/original_images
fi

if [ ! -L /app/public/uploads ]; then
  rm -rf /app/public/uploads
  ln -s "$STORAGE/uploads" /app/public/uploads
fi

if [ ! -L /app/public/voice-notes ]; then
  rm -rf /app/public/voice-notes
  ln -s "$STORAGE/voice-notes" /app/public/voice-notes
fi

# ── Symlink wish card data directory ──
if [ ! -L /app/data/wishes ]; then
  rm -rf /app/data/wishes
  ln -s "$STORAGE/wishes" /app/data/wishes
fi

echo "✅ Persistent storage symlinks ready at $STORAGE"

# ── Start the Next.js server ──
exec node /app/server.js
