import { describe, it, expect, vi } from 'vitest';
import { appendChunk, deserializeStreamBody } from './reasoning-custom-protocol';

describe('custom reasoning protocol', () => {
	it('should serialize chunks correctly', () => {
		let serializedContent = '';

		const textChunks = ['Hello', ', world!'];
		const reasoningChunks = ['How should I', ' greet the user?'];

		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		for (let i = 0; i < textChunks.length; i++) {
			appendChunk({ chunk: textChunks[i], type: 'text', append: customAppend });
			appendChunk({ chunk: reasoningChunks[i], type: 'reasoning', append: customAppend });
		}

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: textChunks.join(''),
			reasoning: reasoningChunks.join('')
		});
	});

	it('should handle empty chunks', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		appendChunk({ chunk: '', type: 'text', append: customAppend });
		appendChunk({ chunk: '', type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: '',
			reasoning: ''
		});
	});

	it('should handle chunks containing colons', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		appendChunk({ chunk: 'Hello:world', type: 'text', append: customAppend });
		appendChunk({ chunk: 'Reason:thinking', type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: 'Hello:world',
			reasoning: 'Reason:thinking'
		});
	});

	it('should handle chunks containing newlines and special characters', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		const textWithSpecialChars = 'Hello\nWorld\tTab\r\n';
		const reasoningWithSpecialChars = 'Think\nAbout\tThis\r\n';

		appendChunk({ chunk: textWithSpecialChars, type: 'text', append: customAppend });
		appendChunk({ chunk: reasoningWithSpecialChars, type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: textWithSpecialChars,
			reasoning: reasoningWithSpecialChars
		});
	});

	it('should handle unicode and multibyte characters', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		const unicodeText = 'Hello 🌍 世界 🚀';
		const unicodeReasoning = '思考 💭 について';

		appendChunk({ chunk: unicodeText, type: 'text', append: customAppend });
		appendChunk({ chunk: unicodeReasoning, type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: unicodeText,
			reasoning: unicodeReasoning
		});
	});

	it('should handle only text chunks with no reasoning', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		appendChunk({ chunk: 'Hello', type: 'text', append: customAppend });
		appendChunk({ chunk: ' World', type: 'text', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: 'Hello World',
			reasoning: ''
		});
	});

	it('should handle only reasoning chunks with no text', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		appendChunk({ chunk: 'Think', type: 'reasoning', append: customAppend });
		appendChunk({ chunk: ' about this', type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: '',
			reasoning: 'Think about this'
		});
	});

	it('should handle very long chunks', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		const longText = 'a'.repeat(10000);
		const longReasoning = 'b'.repeat(5000);

		appendChunk({ chunk: longText, type: 'text', append: customAppend });
		appendChunk({ chunk: longReasoning, type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: longText,
			reasoning: longReasoning
		});
	});

	it('should handle multiple chunks of the same type in sequence', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		appendChunk({ chunk: 'First', type: 'text', append: customAppend });
		appendChunk({ chunk: 'Second', type: 'text', append: customAppend });
		appendChunk({ chunk: 'Third', type: 'text', append: customAppend });
		appendChunk({ chunk: 'Reason1', type: 'reasoning', append: customAppend });
		appendChunk({ chunk: 'Reason2', type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: 'FirstSecondThird',
			reasoning: 'Reason1Reason2'
		});
	});

	it('should handle chunks with numbers in content', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		appendChunk({ chunk: 'Count: 12345', type: 'text', append: customAppend });
		appendChunk({ chunk: 'Calculate: 67890', type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: 'Count: 12345',
			reasoning: 'Calculate: 67890'
		});
	});

	it('should handle single character chunks', () => {
		let serializedContent = '';
		const customAppend = vi.fn((serializedChunk: string) => {
			serializedContent += serializedChunk;
		});

		appendChunk({ chunk: 'a', type: 'text', append: customAppend });
		appendChunk({ chunk: 'b', type: 'text', append: customAppend });
		appendChunk({ chunk: 'c', type: 'reasoning', append: customAppend });

		expect(deserializeStreamBody(serializedContent)).toEqual({
			text: 'ab',
			reasoning: 'c'
		});
	});
});
