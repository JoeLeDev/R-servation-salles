#!/usr/bin/env node
const major = Number(process.versions.node.split(".")[0]);

if (major >= 25) {
  console.error(`
❌ Node.js ${process.version} n'est pas compatible avec Next.js 16.

Utilisez Node.js 22 LTS :

  # Avec Homebrew (macOS)
  brew install node@22
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

  # Ou avec nvm
  nvm install 22
  nvm use 22

Puis relancez : npm run dev
`);
  process.exit(1);
}
