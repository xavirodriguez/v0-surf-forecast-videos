#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('Installing Remotion dependencies...');

try {
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('✓ Dependencies installed successfully');
} catch (error) {
  console.error('✗ Failed to install dependencies');
  process.exit(1);
}

console.log('\n✓ Setup complete! You can now render videos with:');
console.log('  pnpm remotion render src/index.ts SurfForecast output.mp4');
