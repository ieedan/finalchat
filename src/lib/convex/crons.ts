import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
	'poll workos events',
	{
		seconds: 5
	},
	internal.workosEvents.pollEvents
);

export default crons;
