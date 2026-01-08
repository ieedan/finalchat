import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { githubLinkHandler, svelteDevLinkHandler } from './ai';

// Store original fetch before any stubbing
const originalFetch = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch : undefined;

describe('githubLinkHandler', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('matches', () => {
		it('should match GitHub URLs', () => {
			expect(githubLinkHandler.matches('https://github.com/owner/repo')).toBe(true);
			expect(githubLinkHandler.matches('https://github.com/user/project')).toBe(true);
		});

		it('should not match non-GitHub URLs', () => {
			expect(githubLinkHandler.matches('https://gitlab.com/owner/repo')).toBe(false);
			expect(githubLinkHandler.matches('https://example.com')).toBe(false);
			expect(githubLinkHandler.matches('not-a-url')).toBe(false);
		});
	});

	describe('handler - repo homepage', () => {
		it('should fetch repo info and README', async () => {
			const mockRepoData = {
				full_name: 'owner/repo',
				description: 'A test repository',
				language: 'TypeScript',
				stargazers_count: 100,
				forks_count: 20,
				open_issues_count: 5,
				license: { name: 'MIT' },
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				html_url: 'https://github.com/owner/repo'
			};

			const mockReadmeData = {
				content: Buffer.from('# Test README\n\nThis is a test.').toString('base64')
			};

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockRepoData
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockReadmeData
				} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo');

			expect(result).toContain('# owner/repo');
			expect(result).toContain('A test repository');
			expect(result).toContain('**Language:** TypeScript');
			expect(result).toContain('**Stars:** 100');
			expect(result).toContain('**Forks:** 20');
			expect(result).toContain('**Open Issues:** 5');
			expect(result).toContain('**License:** MIT');
			expect(result).toContain('## README');
			expect(result).toContain('# Test README');
			expect(result).toContain('This is a test.');

			expect(fetch).toHaveBeenCalledTimes(2);
			expect(fetch).toHaveBeenCalledWith(
				'https://api.github.com/repos/owner/repo',
				expect.objectContaining({
					headers: expect.objectContaining({
						Accept: 'application/vnd.github.v3+json',
						'User-Agent': 'finalchat'
					})
				})
			);
		});

		it('should handle repo without README', async () => {
			const mockRepoData = {
				full_name: 'owner/repo',
				description: null,
				language: null,
				stargazers_count: 0,
				forks_count: 0,
				open_issues_count: 0,
				license: null,
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				html_url: 'https://github.com/owner/repo'
			};

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockRepoData
				} as Response)
				.mockResolvedValueOnce({
					ok: false,
					status: 404
				} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo');

			expect(result).toContain('# owner/repo');
			expect(result).toContain('No description');
			expect(result).toContain('**Language:** N/A');
			expect(result).toContain('**License:** None');
			expect(result).toContain('*No README found*');
		});

		it('should handle repo fetch error', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found'
			} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo');

			expect(result).toContain('Error fetching repo: 404 Not Found');
		});
	});

	describe('handler - file in filetree', () => {
		it('should fetch file content', async () => {
			const mockFileData = {
				type: 'file',
				name: 'test.ts',
				path: 'src/test.ts',
				size: 100,
				sha: 'abc123',
				html_url: 'https://github.com/owner/repo/blob/main/src/test.ts',
				content: Buffer.from('const x = 1;').toString('base64')
			};

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: async () => mockFileData
			} as Response);

			const result = await githubLinkHandler.handler(
				'https://github.com/owner/repo/blob/main/src/test.ts'
			);

			expect(result).toContain('# test.ts');
			expect(result).toContain('**Path:** `src/test.ts`');
			expect(result).toContain('**Size:** 100 bytes');
			expect(result).toContain('**SHA:** `abc123`');
			expect(result).toContain('```ts\nconst x = 1;\n```');

			expect(fetch).toHaveBeenCalledWith(
				'https://api.github.com/repos/owner/repo/contents/src/test.ts?ref=main',
				expect.any(Object)
			);
		});

		it('should handle nested file paths', async () => {
			const mockFileData = {
				type: 'file',
				name: 'file.js',
				path: 'src/lib/utils/file.js',
				size: 200,
				sha: 'def456',
				html_url: 'https://github.com/owner/repo/blob/develop/src/lib/utils/file.js',
				content: Buffer.from('console.log("test");').toString('base64')
			};

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: async () => mockFileData
			} as Response);

			const result = await githubLinkHandler.handler(
				'https://github.com/owner/repo/blob/develop/src/lib/utils/file.js'
			);

			expect(result).toContain('# file.js');
			expect(result).toContain('**Path:** `src/lib/utils/file.js`');
			expect(result).toContain('```js\nconsole.log("test");\n```');
		});

		it('should handle file fetch error', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found'
			} as Response);

			const result = await githubLinkHandler.handler(
				'https://github.com/owner/repo/blob/main/src/test.ts'
			);

			expect(result).toContain('Error fetching file: 404 Not Found');
		});

		it('should handle directory instead of file', async () => {
			const mockDirData = {
				type: 'dir',
				name: 'src',
				path: 'src'
			};

			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: async () => mockDirData
			} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo/blob/main/src');

			expect(result).toBe('URL points to a directory, not a file');
		});
	});

	describe('handler - issues', () => {
		it('should fetch issue with comments', async () => {
			const mockIssueData = {
				number: 123,
				title: 'Test Issue',
				state: 'open',
				user: {
					login: 'testuser',
					html_url: 'https://github.com/testuser'
				},
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z',
				closed_at: null,
				labels: [{ name: 'bug' }, { name: 'urgent' }],
				html_url: 'https://github.com/owner/repo/issues/123',
				body: 'This is the issue description.'
			};

			const mockComments = [
				{
					user: {
						login: 'commenter1',
						html_url: 'https://github.com/commenter1'
					},
					created_at: '2024-01-03T00:00:00Z',
					body: 'First comment'
				},
				{
					user: {
						login: 'commenter2',
						html_url: 'https://github.com/commenter2'
					},
					created_at: '2024-01-04T00:00:00Z',
					body: 'Second comment'
				}
			];

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockIssueData
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockComments
				} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo/issues/123');

			expect(result).toContain('# Issue #123: Test Issue');
			expect(result).toContain('**State:** open');
			expect(result).toContain('**Author:** [testuser]');
			expect(result).toContain('**Labels:** bug, urgent');
			expect(result).toContain('This is the issue description.');
			expect(result).toContain('## Comments (2)');
			expect(result).toContain('### [commenter1]');
			expect(result).toContain('First comment');
			expect(result).toContain('### [commenter2]');
			expect(result).toContain('Second comment');

			expect(fetch).toHaveBeenCalledWith(
				'https://api.github.com/repos/owner/repo/issues/123/comments?per_page=5',
				expect.any(Object)
			);
		});

		it('should handle issue without comments', async () => {
			const mockIssueData = {
				number: 456,
				title: 'Another Issue',
				state: 'closed',
				user: {
					login: 'user2',
					html_url: 'https://github.com/user2'
				},
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z',
				closed_at: '2024-01-05T00:00:00Z',
				labels: [],
				html_url: 'https://github.com/owner/repo/issues/456',
				body: null
			};

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockIssueData
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => []
				} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo/issues/456');

			expect(result).toContain('# Issue #456: Another Issue');
			expect(result).toContain('**State:** closed');
			expect(result).toContain('**Labels:** None');
			expect(result).toContain('*No description*');
			expect(result).toContain('*No comments*');
		});

		it('should handle issue fetch error', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found'
			} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo/issues/999');

			expect(result).toContain('Error fetching issue: 404 Not Found');
		});
	});

	describe('handler - pull requests', () => {
		it('should fetch PR with merge info', async () => {
			const mockPRData = {
				number: 789,
				title: 'Test PR',
				state: 'closed',
				user: {
					login: 'pruser',
					html_url: 'https://github.com/pruser'
				},
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z',
				closed_at: '2024-01-10T00:00:00Z',
				merged_at: '2024-01-10T00:00:00Z',
				mergeable: true,
				pull_request: {
					merged_at: '2024-01-10T00:00:00Z'
				},
				labels: [{ name: 'feature' }],
				html_url: 'https://github.com/owner/repo/pull/789',
				body: 'PR description here'
			};

			const mockComments = [
				{
					user: {
						login: 'reviewer',
						html_url: 'https://github.com/reviewer'
					},
					created_at: '2024-01-05T00:00:00Z',
					body: 'Looks good!'
				}
			];

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockPRData
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockComments
				} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo/pull/789');

			expect(result).toContain('# Pull Request #789: Test PR');
			expect(result).toContain('**State:** closed');
			expect(result).toContain('**Merged:**');
			expect(result).toContain('**Mergeable:** Yes');
			expect(result).toContain('PR description here');
			expect(result).toContain('## Comments (1)');
			expect(result).toContain('Looks good!');
		});

		it('should handle PR fetch error', async () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found'
			} as Response);

			const result = await githubLinkHandler.handler('https://github.com/owner/repo/pull/999');

			expect(result).toContain('Error fetching PR: 404 Not Found');
		});
	});

	describe('handler - error cases', () => {
		it('should handle invalid URL (too short)', async () => {
			const result = await githubLinkHandler.handler('https://github.com/owner');

			expect(result).toBe('Invalid GitHub URL: must include owner and repository name');
		});

		it('should handle unsupported URL format', async () => {
			const result = await githubLinkHandler.handler('https://github.com/owner/repo/wiki');

			expect(result).toBe(
				'Unsupported GitHub URL format. Supported: repo homepage, files, issues, and pull requests.'
			);
		});

		it('should handle network errors', async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

			const result = await githubLinkHandler.handler('https://github.com/owner/repo');

			expect(result).toContain('Error processing GitHub link: Network error');
		});

		it('should handle invalid URL format', async () => {
			const result = await githubLinkHandler.handler('not-a-valid-url');

			expect(result).toContain('Error processing GitHub link');
		});
	});

	describe('handler - integration tests (real GitHub API)', () => {
		beforeEach(() => {
			// Restore original fetch for integration tests
			// Unstub first to remove the mock
			vi.unstubAllGlobals();
			// Restore the original fetch if it existed
			if (originalFetch) {
				globalThis.fetch = originalFetch;
			}
		});

		afterEach(() => {
			// Re-stub fetch after integration tests
			vi.stubGlobal('fetch', vi.fn());
		});

		it('should fetch real repo homepage structure', async () => {
			// Skip if fetch is not available (Node < 18)
			if (typeof globalThis.fetch === 'undefined') {
				console.warn('Skipping integration test: fetch is not available');
				return;
			}
			const result = await githubLinkHandler.handler('https://github.com/huntabyte/shadcn-svelte');

			// Check structure, not exact content
			expect(result).toContain('# huntabyte/shadcn-svelte');
			expect(result).toContain('**Language:**');
			expect(result).toContain('**Stars:**');
			expect(result).toContain('**Forks:**');
			expect(result).toContain('**Open Issues:**');
			expect(result).toContain('**License:**');
			expect(result).toContain('**Created:**');
			expect(result).toContain('**Updated:**');
			expect(result).toContain('**URL:**');
			// Should have either README section or "No README found"
			expect(result.includes('## README') || result.includes('*No README found*')).toBe(true);
		});

		it('should fetch real issue structure', async () => {
			// Skip if fetch is not available (Node < 18)
			if (typeof globalThis.fetch === 'undefined') {
				console.warn('Skipping integration test: fetch is not available');
				return;
			}
			const result = await githubLinkHandler.handler(
				'https://github.com/huntabyte/shadcn-svelte/issues/2484'
			);

			// Check structure, not exact content
			expect(result).toContain('# Issue #2484:');
			expect(result).toContain('**State:**');
			expect(result).toContain('**Author:**');
			expect(result).toContain('**Created:**');
			expect(result).toContain('**Updated:**');
			expect(result).toContain('**Labels:**');
			expect(result).toContain('**URL:**');
			expect(result).toContain('---');
			expect(result).toContain('## Description');
			// Should have either comments section or "No comments"
			expect(result.includes('## Comments') || result.includes('*No comments*')).toBe(true);
		});

		it('should fetch real PR structure', async () => {
			// Skip if fetch is not available (Node < 18)
			if (typeof globalThis.fetch === 'undefined') {
				console.warn('Skipping integration test: fetch is not available');
				return;
			}
			const result = await githubLinkHandler.handler(
				'https://github.com/huntabyte/shadcn-svelte/pull/2471'
			);

			// Check structure, not exact content
			expect(result).toContain('# Pull Request #2471:');
			expect(result).toContain('**State:**');
			expect(result).toContain('**Author:**');
			expect(result).toContain('**Created:**');
			expect(result).toContain('**Updated:**');
			expect(result).toContain('**Labels:**');
			expect(result).toContain('**URL:**');
			expect(result).toContain('---');
			expect(result).toContain('## Description');
			// Should have either comments section or "No comments"
			expect(result.includes('## Comments') || result.includes('*No comments*')).toBe(true);
		});

		it('should fetch real file structure', async () => {
			// Skip if fetch is not available (Node < 18)
			if (typeof globalThis.fetch === 'undefined') {
				console.warn('Skipping integration test: fetch is not available');
				return;
			}
			const result = await githubLinkHandler.handler(
				'https://github.com/huntabyte/shadcn-svelte/blob/main/CONTRIBUTING.md'
			);

			// Check structure, not exact content
			expect(result).toContain('# CONTRIBUTING.md');
			expect(result).toContain('**Path:** `CONTRIBUTING.md`');
			expect(result).toContain('**Size:**');
			expect(result).toContain(' bytes');
			expect(result).toContain('**SHA:** `');
			expect(result).toContain('**URL:**');
			expect(result).toContain('---');
			expect(result).toContain('## Content');
			expect(result).toContain('```md\n');
			expect(result).toContain('```');
		});
	});

	describe('svelteDevLinkHandler', () => {
		describe('matches', () => {
			it('should match Svelte.dev docs URLs', () => {
				expect(svelteDevLinkHandler.matches('https://svelte.dev/docs/kit/remote-functions')).toBe(
					true
				);
				expect(svelteDevLinkHandler.matches('https://svelte.dev/docs/routing')).toBe(true);
				expect(svelteDevLinkHandler.matches('https://svelte.dev/docs/kit/remote-functions/')).toBe(
					true
				);
			});

			it('should not match non-Svelte.dev docs URLs', () => {
				expect(svelteDevLinkHandler.matches('https://svelte.dev/')).toBe(false);
				expect(svelteDevLinkHandler.matches('https://svelte.dev/tutorial')).toBe(false);
				expect(svelteDevLinkHandler.matches('https://github.com/sveltejs/svelte')).toBe(false);
			});
		});

		describe('handler', () => {
			it('should fetch llms.txt from Svelte.dev docs route', async () => {
				const mockContent = '# Remote functions\n\nRemote functions are a tool for type-safe communication...';

				vi.mocked(fetch).mockResolvedValueOnce({
					ok: true,
					text: async () => mockContent
				} as Response);

				const result = await svelteDevLinkHandler.handler(
					'https://svelte.dev/docs/kit/remote-functions'
				);

				expect(result).toBe(mockContent);

				expect(fetch).toHaveBeenCalledWith(
					'https://svelte.dev/docs/kit/remote-functions/llms.txt',
					expect.objectContaining({
						headers: expect.objectContaining({
							'User-Agent': 'finalchat'
						})
					})
				);
			});

			it('should handle trailing slash in URL', async () => {
				const mockContent = 'Test content';

				vi.mocked(fetch).mockResolvedValueOnce({
					ok: true,
					text: async () => mockContent
				} as Response);

				const result = await svelteDevLinkHandler.handler(
					'https://svelte.dev/docs/kit/remote-functions/'
				);

				expect(result).toBe(mockContent);
				expect(fetch).toHaveBeenCalledWith(
					'https://svelte.dev/docs/kit/remote-functions/llms.txt',
					expect.any(Object)
				);
			});

			it('should handle fetch error', async () => {
				vi.mocked(fetch).mockResolvedValueOnce({
					ok: false,
					status: 404,
					statusText: 'Not Found'
				} as Response);

				const result = await svelteDevLinkHandler.handler(
					'https://svelte.dev/docs/kit/remote-functions'
				);

				expect(result).toContain('Error fetching llms.txt: 404 Not Found');
			});

			it('should handle network errors', async () => {
				vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

				const result = await svelteDevLinkHandler.handler(
					'https://svelte.dev/docs/kit/remote-functions'
				);

				expect(result).toContain('Error processing Svelte.dev link: Network error');
			});
		});

		describe('handler - integration tests (real Svelte.dev API)', () => {
			beforeEach(() => {
				// Restore original fetch for integration tests
				vi.unstubAllGlobals();
				if (originalFetch) {
					globalThis.fetch = originalFetch;
				}
			});

			afterEach(() => {
				// Re-stub fetch after integration tests
				vi.stubGlobal('fetch', vi.fn());
			});

			it('should fetch real llms.txt from Svelte.dev docs', async () => {
				// Skip if fetch is not available (Node < 18)
				if (typeof globalThis.fetch === 'undefined') {
					console.warn('Skipping integration test: fetch is not available');
					return;
				}
				const result = await svelteDevLinkHandler.handler(
					'https://svelte.dev/docs/kit/remote-functions'
				);

				// Should have some content (llms.txt is already formatted)
				expect(result.length).toBeGreaterThan(100);
				// Should be plain text/markdown content, not wrapped
				expect(result).not.toContain('# Svelte Documentation');
			});
		});
	});
});
