export function appendChunk({chunk, type, append}: {chunk: string, type: 'text' | 'reasoning', append: (chunk: string) => void}) {
    const serialized = serializeChunk({chunk, type});
    append(serialized);
}

export function serializeChunk({chunk, type}: {chunk: string, type: 'text' | 'reasoning'}) {
    const t = type === 'text' ? 't' : 'r';
    return `${t}${chunk.length}:${chunk}`;
}

export function deserializeStreamBody(body: string): {text: string, reasoning: string} {
    let textContent = '';
    let reasoningContent = '';

    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        const type = char;
        const nextColonIndex = body.indexOf(':', i);
        const length = parseInt(body.slice(i + 1, nextColonIndex));
        const chunk = body.slice(nextColonIndex + 1, nextColonIndex + 1 + length);
        i = nextColonIndex + length;
        if (type === 't') {
            textContent += chunk;
        } else if (type === 'r') {
            reasoningContent += chunk;
        }
    }

    return {
        text: textContent,
        reasoning: reasoningContent
    }
}