const fs = require('fs');
const path = require('path');

// A previous deployment committed Windows-built dependencies below the backend.
// Never allow a restored Vercel build cache to package those binaries.
if (process.env.VERCEL) {
  fs.rmSync(path.join(__dirname, '..', 'Source Code', 'backend', 'node_modules'), {
    recursive: true,
    force: true,
  });
}
