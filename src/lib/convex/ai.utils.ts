import { ConvexError } from 'convex/values';
import { z } from 'zod';
import { tool } from 'ai';
import type { ActionCtx } from './_generated/server';
import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import Exa from 'exa-js';
import { env } from '../env.convex';

const exa = new Exa(env.EXA_API_KEY);

const MARKDOWN_NEW_ORIGIN = 'https://markdown.new';

export type ContextType = {
	env: {
		GITHUB_TOKEN: string | undefined;
	};
	ctx: ActionCtx;
	chatId: Id<'chats'>;
};

export const fetchLinkContentTool = tool({
	description: 'Fetch the text content of a link',
	inputSchema: z.object({
		link: z.string()
	}),
	execute: async ({ link }, { abortSignal, experimental_context }) => {
		try {
			// any custom link handlers will run before the default handler
			const handlers = [githubLinkHandler, svelteDevLinkHandler];
			for (const handler of handlers) {
				if (handler.matches(link)) {
					return await handler.handler(link, {
						experimental_context: experimental_context as ContextType
					});
				}
			}

			if (link.startsWith(`${MARKDOWN_NEW_ORIGIN}/`)) {
				throw new ConvexError('Refusing to fetch markdown.new recursively');
			}

			let text = await tryFetchMarkdownDirect(link, abortSignal);
			if (text !== null) return text;

			for (const variant of markdownPathVariants(link)) {
				text = await tryFetchMarkdownDirect(variant, abortSignal);
				if (text !== null) return text;
			}

			return await fetchViaMarkdownNew(link, abortSignal);
		} catch (error) {
			return `Error reading link content: ${error instanceof Error ? error.message : error}`;
		}
	}
});

function isMarkdownLikeContentType(contentType: string | null): boolean {
	if (!contentType) return false;
	const ct = contentType.toLowerCase();
	return ['text/plain', 'text/markdown', 'text/x-markdown'].some((t) => ct.includes(t));
}

async function tryFetchMarkdownDirect(
	url: string,
	abortSignal: AbortSignal | undefined
): Promise<string | null> {
	const response = await fetch(url, { method: 'GET', signal: abortSignal });
	if (!response.ok) return null;
	if (!isMarkdownLikeContentType(response.headers.get('content-type'))) return null;
	return await response.text();
}

/** Tries pathname.md and pathname.mdx for doc sites that expose raw markdown beside HTML. */
function markdownPathVariants(link: string): string[] {
	try {
		const base = new URL(link);
		let pathname = base.pathname;
		if (pathname.length > 1 && pathname.endsWith('/')) {
			pathname = pathname.slice(0, -1);
		}
		if (!pathname || pathname === '/') {
			return [];
		}
		const lower = pathname.toLowerCase();
		if (lower.endsWith('.md') || lower.endsWith('.mdx') || lower.endsWith('.markdown')) {
			return [];
		}
		return ['.md', '.mdx'].map((ext) => {
			const u = new URL(link);
			u.pathname = pathname + ext;
			return u.toString();
		});
	} catch {
		return [];
	}
}

async function fetchViaMarkdownNew(
	link: string,
	abortSignal: AbortSignal | undefined
): Promise<string> {
	// Prepends https://markdown.new/ to the URL; Accept returns markdown (not HTML UI).
	const response = await fetch(`${MARKDOWN_NEW_ORIGIN}/${link}`, {
		method: 'GET',
		headers: { Accept: 'text/markdown' },
		signal: abortSignal
	});
	if (!response.ok) {
		throw new ConvexError(`markdown.new: ${response.status} ${response.statusText}`);
	}
	return await response.text();
}

type CustomLinkHandler = {
	matches: (link: string) => boolean;
	handler: (link: string, opts: { experimental_context: ContextType }) => Promise<string>;
};

export const githubLinkHandler: CustomLinkHandler = {
	matches: (link) => link.startsWith('https://github.com'),
	handler: async (link, opts) => {
		const env = opts.experimental_context.env;
		try {
			const url = new URL(link);
			const pathParts = url.pathname.split('/').filter(Boolean);

			// Need at least owner and repo
			if (pathParts.length < 2) {
				return 'Invalid GitHub URL: must include owner and repository name';
			}

			const owner = pathParts[0];
			const repo = pathParts[1];
			const apiBase = 'https://api.github.com';

			// Build headers with optional GitHub token for higher rate limits
			const headers: HeadersInit = {
				Accept: 'application/vnd.github.v3+json'
			};
			if (env.GITHUB_TOKEN) {
				headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
			}

			// Case 1: Repo homepage (e.g., https://github.com/owner/repo)
			if (pathParts.length === 2) {
				const repoResponse = await fetch(`${apiBase}/repos/${owner}/${repo}`, {
					headers
				});

				if (!repoResponse.ok) {
					return `Error fetching repo: ${repoResponse.status} ${repoResponse.statusText}`;
				}

				const repoData = await repoResponse.json();
				let markdown = `# ${repoData.full_name}\n\n`;
				markdown += `${repoData.description || 'No description'}\n\n`;
				markdown += `**Language:** ${repoData.language || 'N/A'}\n`;
				markdown += `**Stars:** ${repoData.stargazers_count}\n`;
				markdown += `**Forks:** ${repoData.forks_count}\n`;
				markdown += `**Open Issues:** ${repoData.open_issues_count}\n`;
				markdown += `**License:** ${repoData.license?.name || 'None'}\n`;
				markdown += `**Created:** ${new Date(repoData.created_at).toLocaleDateString()}\n`;
				markdown += `**Updated:** ${new Date(repoData.updated_at).toLocaleDateString()}\n\n`;
				markdown += `**URL:** ${repoData.html_url}\n\n`;

				// Fetch raw README content
				const defaultBranch = repoData.default_branch || 'main';
				const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`;
				const readmeResponse = await fetch(readmeUrl, {
					headers
				});

				if (readmeResponse.ok) {
					const readmeContent = await readmeResponse.text();
					markdown += `---\n\n## README\n\n${readmeContent}`;
				} else {
					markdown += '---\n\n*No README found*';
				}

				return markdown;
			}

			// Case 2: Issue or PR (e.g., https://github.com/owner/repo/issues/123 or /pull/123)
			if (pathParts.length === 4 && (pathParts[2] === 'issues' || pathParts[2] === 'pull')) {
				const number = pathParts[3];
				const isPR = pathParts[2] === 'pull';

				const [issueResponse, commentsResponse] = await Promise.all([
					fetch(`${apiBase}/repos/${owner}/${repo}/issues/${number}`, {
						headers
					}),
					fetch(`${apiBase}/repos/${owner}/${repo}/issues/${number}/comments?per_page=5`, {
						headers
					})
				]);

				if (!issueResponse.ok) {
					return `Error fetching ${isPR ? 'PR' : 'issue'}: ${issueResponse.status} ${issueResponse.statusText}`;
				}

				const issueData = await issueResponse.json();
				let markdown = `# ${isPR ? 'Pull Request' : 'Issue'} #${issueData.number}: ${issueData.title}\n\n`;
				markdown += `**State:** ${issueData.state}${issueData.state === 'closed' ? ` (${issueData.closed_at ? new Date(issueData.closed_at).toLocaleDateString() : ''})` : ''}\n`;
				markdown += `**Author:** [${issueData.user.login}](${issueData.user.html_url})\n`;
				markdown += `**Created:** ${new Date(issueData.created_at).toLocaleDateString()}\n`;
				markdown += `**Updated:** ${new Date(issueData.updated_at).toLocaleDateString()}\n`;

				if (isPR && issueData.pull_request) {
					markdown += `**Merged:** ${issueData.merged_at ? new Date(issueData.merged_at).toLocaleDateString() : 'No'}\n`;
					if (issueData.pull_request.merged_at) {
						markdown += `**Mergeable:** ${issueData.mergeable ? 'Yes' : 'No'}\n`;
					}
				}

				markdown += `\n**Labels:** ${issueData.labels.length > 0 ? issueData.labels.map((l: { name: string }) => l.name).join(', ') : 'None'}\n\n`;
				markdown += `**URL:** ${issueData.html_url}\n\n`;
				markdown += `---\n\n## Description\n\n${issueData.body || '*No description*'}\n\n`;

				if (commentsResponse.ok) {
					const comments = await commentsResponse.json();
					if (comments.length > 0) {
						markdown += `---\n\n## Comments (${comments.length})\n\n`;
						for (const comment of comments) {
							markdown += `### [${comment.user.login}](${comment.user.html_url}) - ${new Date(comment.created_at).toLocaleDateString()}\n\n`;
							markdown += `${comment.body}\n\n---\n\n`;
						}
					} else {
						markdown += '---\n\n*No comments*';
					}
				}

				return markdown;
			}

			// Case 3: File in filetree (e.g., https://github.com/owner/repo/blob/branch/path/to/file)
			if (pathParts.length >= 4 && pathParts[2] === 'blob') {
				const branch = pathParts[3];
				const filePath = pathParts.slice(4).join('/');

				// Fetch file metadata first
				const metadataResponse = await fetch(
					`${apiBase}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
					{
						headers
					}
				);

				if (!metadataResponse.ok) {
					return `Error fetching file: ${metadataResponse.status} ${metadataResponse.statusText}`;
				}

				const fileData = await metadataResponse.json();

				if (fileData.type !== 'file') {
					return 'URL points to a directory, not a file';
				}

				// Fetch raw file content directly
				const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
				const contentResponse = await fetch(rawUrl, {
					headers
				});

				if (!contentResponse.ok) {
					return `Error fetching file content: ${contentResponse.status} ${contentResponse.statusText}`;
				}

				const content = await contentResponse.text();
				let markdown = `# ${fileData.name}\n\n`;
				markdown += `**Path:** \`${fileData.path}\`\n`;
				markdown += `**Size:** ${fileData.size} bytes\n`;
				markdown += `**SHA:** \`${fileData.sha}\`\n`;
				markdown += `**URL:** ${fileData.html_url}\n\n`;
				markdown += `---\n\n## Content\n\n\`\`\`${fileData.name.split('.').pop() || 'text'}\n${content}\n\`\`\``;

				return markdown;
			}

			return 'Unsupported GitHub URL format. Supported: repo homepage, files, issues, and pull requests.';
		} catch (error) {
			return `Error processing GitHub link: ${error instanceof Error ? error.message : String(error)}`;
		}
	}
};

export const svelteDevLinkHandler: CustomLinkHandler = {
	matches: (link) => link.startsWith('https://svelte.dev/docs/'),
	handler: async (link) => {
		try {
			const url = new URL(link);
			// Remove trailing slash if present
			const pathname = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;

			// Construct the llms.txt URL
			const llmsUrl = `${url.origin}${pathname}/llms.txt`;

			const response = await fetch(llmsUrl);

			if (!response.ok) {
				return `Error fetching llms.txt: ${response.status} ${response.statusText}`;
			}

			return await response.text();
		} catch (error) {
			return `Error processing Svelte.dev link: ${error instanceof Error ? error.message : String(error)}`;
		}
	}
};

export const chatSearchTool = tool({
	description: 'Search previous chats with the user',
	inputSchema: z.object({
		query: z.string(),
		excludeChatIds: z.optional(z.array(z.string()))
	}),
	execute: async ({ query, excludeChatIds }, { experimental_context }) => {
		const context = experimental_context as ContextType;

		const results = await context.ctx.runQuery(api.chats.search, {
			query,
			excludeChatIds: [context.chatId, ...(excludeChatIds ?? [])] as Id<'chats'>[]
		});

		return results;
	}
});

export const getChat = tool({
	description: 'Get a chat by its ID',
	inputSchema: z.object({
		chatId: z.string()
	}),
	execute: async ({ chatId }, { experimental_context }) => {
		const context = experimental_context as ContextType;
		return await context.ctx.runQuery(api.chats.get, { chatId: chatId as Id<'chats'> });
	}
});

export const webSearch = tool({
	description:
		'Search the web for information. The tool response includes todaysDate (ISO 8601, UTC) from the server at request time—use it to interpret "today", "this week", and recent events.',
	inputSchema: z.object({
		query: z.string(),
		excludeDomains: z.optional(z.array(z.string()))
	}),
	execute: async ({ query, excludeDomains }) => {
		const result = await exa.search(query, {
			type: 'instant',
			excludeDomains: excludeDomains ?? [],
			numResults: 4
		});

		return {
			// return todaysDate so that the AI knows what today is
			todaysDate: new Date().toISOString(),
			results: result.results
		};
	}
});
