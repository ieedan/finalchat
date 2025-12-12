import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { query } from './_generated/server';
import { mutation } from './functions';

export const getAll = query({
	handler: async (ctx): Promise<Doc<'agents'>[]> => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return [];

		const agents = await ctx.db
			.query('agents')
			.withIndex('by_user', (q) => q.eq('userId', user.subject))
			.collect();

		return agents;
	}
});

export const create = mutation({
	args: {
		name: v.string(),
		modelId: v.string(),
		systemPrompt: v.string(),
		color: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		const agentId = await ctx.db.insert('agents', {
			userId: user.subject,
			name: args.name,
			modelId: args.modelId,
			systemPrompt: args.systemPrompt,
			color: args.color
		});

		return { agentId };
	}
});

export const remove = mutation({
	args: {
		agentId: v.id('agents')
	},
	handler: async (ctx, args) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		const agent = await ctx.db.get(args.agentId);
		if (!agent || agent.userId !== user.subject) throw new Error('Unauthorized');

		await ctx.db.delete(args.agentId);
	}
});
