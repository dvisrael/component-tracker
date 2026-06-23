// Compile src/app.jsx -> app.js using the local @babel/standalone (classic
// JSX runtime, so it runs against the vendored global React with no imports).
// Usage: node tools/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const Babel = require(join(here, 'babel.min.js'));

const src = readFileSync(join(root, 'src', 'app.jsx'), 'utf8');
const { code } = Babel.transform(src, {
  presets: [['react', { runtime: 'classic' }]],
});
const banner = '/* Auto-generated from src/app.jsx by tools/build.mjs — do not edit directly. */\n';
writeFileSync(join(root, 'app.js'), banner + code + '\n');
console.log('built app.js (' + code.length + ' bytes of JS)');
