import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy manifest.json to dist
fs.copyFileSync(
  path.resolve(__dirname, '../manifest.json'),
  path.resolve(__dirname, '../dist/manifest.json')
);

// Create assets directory if it doesn't exist
const assetsDir = path.resolve(__dirname, '../dist/assets');
if (!fs.existsSync(assetsDir)){
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Copy icons to dist/assets
const iconSizes = ['16', '48', '128'];
iconSizes.forEach(size => {
  fs.copyFileSync(
    path.resolve(__dirname, `../public/icon${size}.png`),
    path.resolve(__dirname, `../dist/assets/icon${size}.png`)
  );
});

console.log('Build script completed successfully!');