import { getLocalTimeZone, today } from '@internationalized/date';

type AgeGroups = Record<string, number | null>;

export const DEFAULT_AGE_GROUPS = {
	Today: today(getLocalTimeZone()).toDate(getLocalTimeZone()).valueOf(),
	Yesterday: today(getLocalTimeZone()).subtract({ days: 1 }).toDate(getLocalTimeZone()).valueOf(),
	'Last 7 Days': today(getLocalTimeZone())
		.subtract({ days: 7 })
		.toDate(getLocalTimeZone())
		.valueOf(),
	'Last 30 Days': today(getLocalTimeZone())
		.subtract({ days: 30 })
		.toDate(getLocalTimeZone())
		.valueOf(),
	Other: null
} as const satisfies AgeGroups;

export function getAgedGroups<T, Group extends AgeGroups>(
	items: T[],
	{
		groups,
		getAge
	}: {
		groups: Group;
		getAge: (item: T) => number;
	}
): Record<keyof Group, T[]> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sortedItems: Record<keyof Group, T[]> = {} as any;

	// initialize arrays
	for (const [k] of Object.entries(groups)) {
		const key = k as keyof Group;

		sortedItems[key] = [];
	}

	for (const item of items) {
		const age = getAge(item);

		for (const [k, value] of Object.entries(groups).sort((a, b) => {
			// sort by age so that things work properly
			const aKey = a[0] as keyof Group;
			const bKey = b[0] as keyof Group;

			return (groups[bKey] ?? 0) - (groups[aKey] ?? 0);
		})) {
			const key = k as keyof Group;

			if (value === null) {
				sortedItems[key].push(item);
				break;
			} else if (age >= value) {
				sortedItems[key].push(item);
				break;
			}
		}
	}

	return sortedItems;
}
