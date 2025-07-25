#!/bin/bash

set -e

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)

echo "🚀 Creating dev release with timestamp: $TIMESTAMP"

# Version packages normally (this increments from current versions)
echo "📈 Versioning packages..."
pnpm changeset version

# Now modify all package.json files to add dev suffix
echo "🏷️  Adding dev suffix to versions..."
for pkg_file in packages/*/package.json; do
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$pkg_file', 'utf8'));
    if (pkg.version && !pkg.version.includes('dev')) {
      pkg.version = pkg.version + '-dev-$TIMESTAMP';
      fs.writeFileSync('$pkg_file', JSON.stringify(pkg, null, 2) + '\n');
      console.log('  ' + pkg.name + ': ' + pkg.version);
    }
  "
done

# Build packages (commented out - prepublishOnly will handle this)
# echo "🔨 Building packages..."
# pnpm build

# Publish with dev tag (commented out for testing)
# echo "📦 Publishing dev release..."
# pnpm changeset publish --tag dev

echo "✅ Dev release versions prepared: 1.1.1-dev-$TIMESTAMP"
echo "🚀 To actually publish, uncomment the publish lines in scripts/release-dev.sh" 