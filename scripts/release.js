#!/usr/bin/env node

/**
 * This script creates a GitHub release after changesets has updated the version.
 * It reads the version from package.json and extracts the changelog for that version.
 */

import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read package.json to get the version
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const version = packageJson.version;
const tagName = `v${version}`;

// Check if this tag already exists
try {
	const existingTags = execSync('git tag -l', { encoding: 'utf-8' });
	if (existingTags.split('\n').includes(tagName)) {
		console.log(`Tag ${tagName} already exists, skipping release.`);
		process.exit(0);
	}
} catch {
	// If git tag fails, continue anyway
}

// Extract changelog for this version
let releaseNotes = '';

const changelogPath = join(rootDir, 'CHANGELOG.md');
if (existsSync(changelogPath)) {
	const changelog = readFileSync(changelogPath, 'utf-8');

	// Find the section for this version
	// Changesets format: ## X.Y.Z or ## X.Y.Z - date
	const versionRegex = new RegExp(`## ${version.replace(/\./g, '\\.')}[^#]*`, 's');
	const match = changelog.match(versionRegex);

	if (match) {
		releaseNotes = match[0].trim();
		// Remove the version header since GitHub release will show it
		releaseNotes = releaseNotes.replace(/^## [^\n]+\n*/, '').trim();
	}
}

// If no release notes found, create a basic one
if (!releaseNotes) {
	releaseNotes = 'See the [changelog](./CHANGELOG.md) for details.';
}

console.log(`Creating release ${tagName}...`);
console.log('Release notes:');
console.log(releaseNotes);
console.log('---');

// Write release notes to a temp file to avoid shell escaping issues
const tempNotesFile = join(rootDir, '.release-notes-temp.md');
try {
	writeFileSync(tempNotesFile, releaseNotes);

	execSync(`gh release create "${tagName}" --title "${tagName}" --notes-file "${tempNotesFile}"`, {
		stdio: 'inherit',
		cwd: rootDir
	});
	console.log(`Successfully created release ${tagName}`);
} catch (error) {
	console.error('Failed to create release:', error.message);
	process.exit(1);
} finally {
	// Clean up temp file
	try {
		unlinkSync(tempNotesFile);
	} catch {
		// Ignore cleanup errors
	}
}
