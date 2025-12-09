/**
 * Formats a number using SI notation (e.g., 1.2k, 5M, 7B).
 * @param num The number to format.
 * @param digits Number of decimal places to include (default: 1).
 * @returns The formatted string.
 */
export function formatNumberShort(num: number, digits: number = 1): string {
	if (num === null || num === undefined || isNaN(num)) return '0';

	const lookup = [
		{ value: 1e9, symbol: 'B' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e3, symbol: 'k' }
	];

	for (const item of lookup) {
		if (Math.abs(num) >= item.value) {
			return (
				(num / item.value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + item.symbol
			);
		}
	}
	return num.toString();
}
