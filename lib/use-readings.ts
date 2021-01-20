import ms from 'ms';
import useSWR from 'swr';
import createDebug from 'debug';
import { useEffect } from 'react';
import fetch from 'isomorphic-fetch';
import { ReadingsPayload } from '@lib/types';

const debug = createDebug('t1:lib:use-readings');

async function fetcher(endpoint: string): Promise<ReadingsPayload> {
	const res = await fetch(endpoint);
	const body = await res.json();

	const { readings, latestReading } = body;
	latestReading.date = new Date(latestReading.date).getTime();
	for (const r of readings) {
		r.date = new Date(r.date).getTime();
	}

	// Add projected readings
	for (let i = 0; i < 10; i++) {
		body.readings.push({
			date: latestReading.date + i * ms('5m'),
			projectedUpper: latestReading.value + i * 5,
			projectedLower: latestReading.value - i * 5,
		});
	}

	const expires = res.headers.get('expires');
	body.expires =
		typeof expires === 'string' ? new Date(expires).getTime() : 0;

	const cache = res.headers.get('x-vercel-cache');
	body.cache = typeof cache === 'string' ? cache : 'MISS';

	debug('Expires: %o - Cache: %o', body.expires, body.cache);

	return body;
}

export default function useReadings(maxCount: number) {
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
		let sleepTime = result.data.expires - Date.now();
		if (sleepTime < 0) {
			sleepTime = ms('3s');
		}
		debug('Sleeping for %o', ms(sleepTime));
		const timer = setTimeout(() => {
			debug('Timeout called!');
			result.revalidate();
		}, sleepTime);
		return () => {
			debug('clearTimeout(%o)', timer);
			clearTimeout(timer);
		};
	}, [result.data?.expires, result.data?.cache]);

	return result;
}
