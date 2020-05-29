import ms from 'ms';
import useSWR from 'swr';
import { useEffect } from 'react';
import fetch from 'isomorphic-fetch';
import { ReadingsPayload } from './types';

async function fetcher(endpoint: string): Promise<ReadingsPayload> {
	const res = await fetch(endpoint);
	const body = await res.json();
	body.expires = new Date(res.headers.get('expires')).getTime();
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
	console.log('useReadings(%d)', maxCount);

	const result = useSWR<ReadingsPayload>(
		`/api/readings?maxCount=${maxCount}`,
		fetcher,
		{
			refreshInterval: ms('1m'),
			refreshWhenHidden: true,
		}
	);

	useEffect(() => {
		if (!result.data) return;
		const sleepTime = result.data.expires - Date.now();
		console.log('Sleeping for %dms', sleepTime);
		const timer = setTimeout(() => {
			console.log('Timeout called!');
			result.revalidate();
		}, sleepTime);
		return () => {
			console.log('clearTimeout()', timer);
			clearTimeout(timer)
		};
	}, [result.data?.expires]);

	return result;
}
