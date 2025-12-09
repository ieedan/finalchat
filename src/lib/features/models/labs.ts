import {
	Amazon,
	Anthropic,
	Deepseek,
	Google,
	IBM,
	Meta,
	Microsoft,
	Mistral,
	Nvidia,
	OpenAI,
	Perplexity,
	Qwen,
	XAI,
	AllenAI,
	AI21,
	AIONLabs,
	Bytedance,
	Baidu,
	Cohere,
	Inflection,
	Kwaipilot,
	Minimax,
	Moonshot,
	Stepfun,
	Tencent,
	Zai
} from '$lib/components/logos';

export type Lab = {
	name: string;
	logo: typeof Amazon;
};

export const LABS: Lab[] = [
	{
		name: 'AllenAI',
		logo: AllenAI
	},
	{
		name: 'AI21',
		logo: AI21
	},
	{
		name: 'AIONLabs',
		logo: AIONLabs
	},
	{
		name: 'Kwaipilot',
		logo: Kwaipilot
	},
	{
		name: 'Inflection',
		logo: Inflection
	},
	{
		name: 'Minimax',
		logo: Minimax
	},
	{
		name: 'Tencent',
		logo: Tencent
	},
	{
		name: 'Cohere',
		logo: Cohere
	},
	{
		name: 'Bytedance',
		logo: Bytedance
	},
	{
		name: 'Baidu',
		logo: Baidu
	},
	{
		name: 'Amazon',
		logo: Amazon
	},
	{
		name: 'Anthropic',
		logo: Anthropic
	},
	{
		name: 'MoonshotAI',
		logo: Moonshot
	},
	{
		name: 'Stepfun',
		logo: Stepfun
	},
	{
		name: 'DeepSeek',
		logo: Deepseek
	},
	{
		name: 'Google',
		logo: Google
	},
	{
		name: 'IBM',
		logo: IBM
	},
	{
		name: 'Meta',
		logo: Meta
	},
	{
		name: 'Microsoft',
		logo: Microsoft
	},
	{
		name: 'Mistral',
		logo: Mistral
	},
	{
		name: 'NVIDIA',
		logo: Nvidia
	},
	{
		name: 'OpenAI',
		logo: OpenAI
	},
	{
		name: 'Perplexity',
		logo: Perplexity
	},
	{
		name: 'Qwen',
		logo: Qwen
	},
	{
		name: 'xAI',
		logo: XAI
	},
	{
		name: 'Z.ai',
		logo: Zai
	}
];
