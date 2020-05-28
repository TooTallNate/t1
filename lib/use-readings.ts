import useSWR from 'swr';
import fetch from 'isomorphic-fetch';
import { ReadingsPayload } from './types';

async function fetcher(endpoint: string): Promise<ReadingsPayload> {
	const res = await fetch(endpoint);
	const body = await res.json();
	body.expires = res.headers.get('expires');
	body.latestReading.date = new Date(body.latestReading.date).getTime();
	for (const r of body.readings) {
		r.date = new Date(r.date).getTime();
	}
	return body;
}

export default function useReadings(maxCount: number) {
	return useSWR(`/api/readings?maxCount=${maxCount}`, fetcher, {
		refreshInterval: 60 * 1000,
		refreshWhenHidden: true,
	});
}
