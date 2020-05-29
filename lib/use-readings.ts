import ms from 'ms';
import useSWR from 'swr';
import fetch from 'isomorphic-fetch';
import { ReadingsPayload } from './types';

async function fetcher(endpoint: string): Promise<ReadingsPayload> {
	const res = await fetch(endpoint);
	const body = await res.json();
	body.expires = res.headers.get('expires');
	const { readings, latestReading } = body;
	latestReading.date = new Date(latestReading.date).getTime();
	for (const r of readings) {
		r.date = new Date(r.date).getTime();
	}

	// Add projected readings
	for (let i = 0; i < 4; i++) {
		body.readings.push({
			date: latestReading.date + (i * ms('5m')),
			projectedUpper: latestReading.value + (i * 5),
			projectedLower: latestReading.value - (i * 5),
		});
	}

	return body;
}

export default function useReadings(maxCount: number) {
	return useSWR<ReadingsPayload>(
		`/api/readings?maxCount=${maxCount}`,
		fetcher,
		{
			refreshInterval: ms('1m'),
			refreshWhenHidden: true,
		}
	);
}
