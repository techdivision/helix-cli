#!/bin/bash

cat << "EOF"
  _____         _     ____  _       _     _
 |_   _|__  ___| |__ |  _ \(_)_   _(_)___(_) ___  _ __
   | |/ _ \/ __| '_ \| | | | \ \ / / / __| |/ _ \| '_ \
   | |  __/ (__| | | | |_| | |\ V /| \__ \ | (_) | | | |
   |_|\___|\___|_| |_|____/|_| \_/ |_|___/_|\___/|_| |_|

EOF

echo "Installing helix-cli from TechDivision fork..."
echo ""

# Define installation directory (use npm's global lib directory)
NPM_PREFIX=$(npm prefix -g)
INSTALL_DIR="$NPM_PREFIX/lib/helix-cli-source"

# Clone or update repository
if [ -d "$INSTALL_DIR" ]; then
  echo "Updating existing installation in $INSTALL_DIR..."
  cd "$INSTALL_DIR" || exit 1
  git pull origin main
else
  echo "Cloning repository to $INSTALL_DIR..."
  git clone https://github.com/techdivision/helix-cli.git "$INSTALL_DIR" || exit 1
  cd "$INSTALL_DIR" || exit 1
fi

echo ""
echo "Preparing environment..."
npm install -g husky
npm uninstall -g @adobe/aem-cli 2>/dev/null

echo ""
echo "Installing dependencies and linking globally..."
npm install || exit 1
npm link || exit 1

echo ""
echo " Installation complete!"
echo ""
echo "You can now use the following commands:"
echo "  - aem"
echo "  - hlx"
echo ""
