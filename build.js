const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'frontend');
const dest = path.join(__dirname, 'public');

try {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.cpSync(src, dest, { recursive: true });
  console.log('Build completed: frontend synced to public output directory.');
} catch (err) {
  console.error('Build error:', err);
  process.exit(1);
}
