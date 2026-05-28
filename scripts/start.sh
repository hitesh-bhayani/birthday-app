#!/bin/sh
# scripts/start.sh
# Runs on every container start.
# Moves persistent directories to the Railway Volume (/app/storage)
# and symlinks them back, so uploads survive redeployments.

set -e

STORAGE=/app/storage

# Helper function to initialize persistent directory by copying baked-in files
init_volume_dir() {
  SRC="$1"
  DEST="$2"

  # Create the destination directory on the volume if it doesn't exist
  mkdir -p "$DEST"

  # If the source exists, is a real directory (not a symlink)
  if [ -d "$SRC" ] && [ ! -L "$SRC" ]; then
    echo "Initializing persistent directory $DEST with default files from $SRC..."
    
    # Copy files that don't already exist in DEST (POSIX-compatible loop)
    for item in "$SRC"/*; do
      if [ -e "$item" ]; then
        name=$(basename "$item")
        if [ ! -e "$DEST/$name" ]; then
          echo "-> Copying $name to persistent storage..."
          cp -Rf "$item" "$DEST/" 2>/dev/null || true
        fi
      fi
    done
    
    # Remove the source directory
    rm -rf "$SRC"
  fi

  # Create symlink if it doesn't exist yet
  if [ ! -L "$SRC" ]; then
    ln -s "$DEST" "$SRC"
    echo "Linked $SRC -> $DEST"
  fi
}

# ── Initialize and Symlink directories to the persistent volume ──
init_volume_dir "/app/data/wishes" "$STORAGE/wishes"
init_volume_dir "/app/public/original_images" "$STORAGE/original_images"
init_volume_dir "/app/public/uploads" "$STORAGE/uploads"
init_volume_dir "/app/public/voice-notes" "$STORAGE/voice-notes"

echo "✅ Persistent storage symlinks and data initialization ready at $STORAGE"

# ── Start the Next.js server ──
exec node /app/server.js
