import { execSync } from 'child_process';

// Default value `unknown` if no args provided via CLI.
const arg = process.argv[2] || 'unknown';

const deployDir = `gh-pages/${arg}`;
const options = { stdio: [0, 1, 2] };

// generate typedoc
const typedocDir = `${deployDir}/docs/`;
execSync(`npx typedoc --out ${typedocDir} --entryPointStrategy expand --entryPoints ./src`, options);
console.log(`Typedoc generated at ${process.cwd()}/${typedocDir}`);
