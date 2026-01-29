export type MatchedText = {
	text: string;
	word?: {
		start: number;
		end: number;
	};
};

/**
 * This isn't used for the actual search but rather just a naive implementation to show in the UI.
 *
 * @param text
 * @param query
 */
export function createMatch(text: string, query: string): MatchedText {
	// First, try to match the entire phrase
	const lowerText = text.toLowerCase();
	const lowerQuery = query.toLowerCase();
	const phraseIndex = lowerText.indexOf(lowerQuery);

	if (phraseIndex !== -1) {
		return {
			text,
			word: {
				start: phraseIndex,
				end: phraseIndex + query.length
			}
		};
	}

	// Fall back to individual word matching
	const queryWords = query.split(' ');
	const textWords = text.split(' ');

	for (const word of textWords) {
		for (const queryWord of queryWords) {
			if (word.toLowerCase().startsWith(queryWord.toLowerCase())) {
				const start = text.indexOf(word);
				return {
					text,
					word: {
						start,
						end: start + queryWord.length
					}
				};
			}
		}
	}

	return {
		text,
		word: undefined
	};
}
