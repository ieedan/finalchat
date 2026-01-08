import z from 'zod';
import { tool } from 'ai';
import { env } from '../env.convex';

export const fetchLinkContentTool = tool({
	name: 'fetch-link-content',
	description: 'Fetch the text content of a link',
	inputSchema: z.object({
		link: z.string()
	}),
	execute: async ({ link }, { abortSignal }) => {
		try {
			// any custom link handlers will run before the default handler
			const handlers = [githubLinkHandler, svelteDevLinkHandler];
			for (const handler of handlers) {
				if (handler.matches(link)) {
					return await handler.handler(link);
				}
			}

			const response = await fetch(link, {
				method: 'GET',
				signal: abortSignal
			});
			if (!response.ok) {
				throw new Error(`${response.status} ${response.statusText}`);
			}
			const contentType = response.headers.get('content-type');
			const allowedTypes = ['text/plain', 'text/markdown'];
			if (allowedTypes.some((type) => contentType?.includes(type))) {
				return await response.text();
			}
			throw new Error(
				'Link response was not markdown. Maybe you need to add .md or .mdx to the end of the link?'
			);
		} catch (error) {
			return `Error reading link content: ${error instanceof Error ? error.message : error}`;
		}
	}
});

type CustomLinkHandler = {
	matches: (link: string) => boolean;
	handler: (link: string) => Promise<string>;
};

const githubLinkHandler: CustomLinkHandler = {
	matches: (link) => link.startsWith('https://github.com'),
	handler: async (link) => {
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
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'finalchat'
			};
			if (env.GITHUB_TOKEN) {
				headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
			}

			// Case 1: Repo homepage (e.g., https://github.com/owner/repo)
			if (pathParts.length === 2) {
				const [repoResponse, readmeResponse] = await Promise.all([
					fetch(`${apiBase}/repos/${owner}/${repo}`, {
						headers
					}),
					fetch(`${apiBase}/repos/${owner}/${repo}/readme`, {
						headers
					})
				]);

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

				if (readmeResponse.ok) {
					const readmeData = await readmeResponse.json();
					const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
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

				const response = await fetch(
					`${apiBase}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
					{
						headers
					}
				);

				if (!response.ok) {
					return `Error fetching file: ${response.status} ${response.statusText}`;
				}

				const fileData = await response.json();

				if (fileData.type !== 'file') {
					return 'URL points to a directory, not a file';
				}

				const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
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

const svelteDevLinkHandler: CustomLinkHandler = {
	matches: (link) => link.startsWith('https://svelte.dev/docs/'),
	handler: async (link) => {
		try {
			const url = new URL(link);
			// Remove trailing slash if present
			const pathname = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;

			// Construct the llms.txt URL
			const llmsUrl = `${url.origin}${pathname}/llms.txt`;

			const response = await fetch(llmsUrl, {
				headers: {
					'User-Agent': 'finalchat'
				}
			});

			if (!response.ok) {
				return `Error fetching llms.txt: ${response.status} ${response.statusText}`;
			}

			return await response.text();
		} catch (error) {
			return `Error processing Svelte.dev link: ${error instanceof Error ? error.message : String(error)}`;
		}
	}
};
