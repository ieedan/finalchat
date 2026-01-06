#!/usr/bin/env tsx

/**
 * This script creates a GitHub release after changesets has updated the version.
 * It reads the version from package.json and extracts the changelog for that version.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Octokit } from '@octokit/rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// GitHub token from environment (provided by GitHub Actions)
const token = process.env.GITHUB_TOKEN;
if (!token) {
	console.error('GITHUB_TOKEN environment variable is required');
	process.exit(1);
}

// Parse repo info from git remote
function getRepoInfo(): { owner: string; repo: string } {
	try {
		const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
		// Handle both HTTPS and SSH URLs
		// https://github.com/owner/repo.git
		// git@github.com:owner/repo.git
		const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
		if (match) {
			return { owner: match[1], repo: match[2] };
		}
	} catch {
		// Fall back to hardcoded values
	}
	return { owner: 'ieedan', repo: 'finalchat' };
}

// Read package.json to get the version
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const version: string = packageJson.version;
const tagName = `v${version}`;

const { owner, repo } = getRepoInfo();
const octokit = new Octokit({ auth: token });

// Check if this release already exists
async function releaseExists(): Promise<boolean> {
	try {
		await octokit.repos.getReleaseByTag({ owner, repo, tag: tagName });
		return true;
	} catch (error) {
		if ((error as { status?: number }).status === 404) {
			return false;
		}
		throw error;
	}
}

// Extract changelog for this version
function getChangelogForVersion(): string {
	const changelogPath = join(rootDir, 'CHANGELOG.md');
	if (!existsSync(changelogPath)) {
		return '';
	}

	const changelog = readFileSync(changelogPath, 'utf-8');

	// Find the section for this version
	// Changesets format: ## X.Y.Z or ## X.Y.Z - date
	const versionRegex = new RegExp(`## ${version.replace(/\./g, '\\.')}[^#]*`, 's');
	const match = changelog.match(versionRegex);

	if (match) {
		let releaseNotes = match[0].trim();
		// Remove the version header since GitHub release will show it
		releaseNotes = releaseNotes.replace(/^## [^\n]+\n*/, '').trim();
		return releaseNotes;
	}

	return '';
}

async function createRelease(): Promise<void> {
	// Check if release already exists
	if (await releaseExists()) {
		console.log(`Release ${tagName} already exists, skipping.`);
		return;
	}

	let releaseNotes = getChangelogForVersion();

	// If no release notes found, create a basic one
	if (!releaseNotes) {
		releaseNotes = 'See the [CHANGELOG](./CHANGELOG.md) for details.';
	}

	console.log(`Creating release ${tagName}...`);
	console.log('Release notes:');
	console.log(releaseNotes);
	console.log('---');

	try {
		const response = await octokit.repos.createRelease({
			owner,
			repo,
			tag_name: tagName,
			name: tagName,
			body: releaseNotes,
			draft: false,
			prerelease: false
		});

		console.log(`Successfully created release ${tagName}`);
		console.log(`Release URL: ${response.data.html_url}`);
	} catch (error) {
		console.error('Failed to create release:', error);
		process.exit(1);
	}
}

createRelease();
