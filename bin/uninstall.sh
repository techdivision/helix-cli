#!/bin/bash

cat << "EOF"
  _____         _     ____  _       _     _
 |_   _|__  ___| |__ |  _ \(_)_   _(_)___(_) ___  _ __
   | |/ _ \/ __| '_ \| | | | \ \ / / / __| |/ _ \| '_ \
   | |  __/ (__| | | | |_| | |\ V /| \__ \ | (_) | | | |
   |_|\___|\___|_| |_|____/|_| \_/ |_|___/_|\___/|_| |_|

EOF

echo "Uninstalling helix-cli from TechDivision fork..."
echo ""

# Define installation directory (use npm's global lib directory)
NPM_PREFIX=$(npm prefix -g)
INSTALL_DIR="$NPM_PREFIX/lib/helix-cli-source"

# Unlink globally
echo "Removing global links..."
npm unlink -g @adobe/aem-cli 2>/dev/null || true

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
  echo "Removing installation directory $INSTALL_DIR..."
  rm -rf "$INSTALL_DIR"
  echo "✓ Directory removed"
else
  echo "Installation directory not found"
fi

echo ""
echo "✓ Uninstallation complete!"
echo ""
