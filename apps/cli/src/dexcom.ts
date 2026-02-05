import dexcom from "dexcom-share";
import type { Reading, ReadingsData } from "./types.js";

const createDexcomIterator = dexcom;

interface DexcomReading {
	Date: number;
	Trend: number;
	Value: number;
}

const READING_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms

let iterator: ReturnType<typeof createDexcomIterator> | null = null;

function getIterator() {
	if (!iterator) {
		const username = process.env.DEXCOM_USERNAME;
		const password = process.env.DEXCOM_PASSWORD;

		if (!username || !password) {
			throw new Error(
				"DEXCOM_USERNAME and DEXCOM_PASSWORD environment variables are required"
			);
		}

		iterator = createDexcomIterator({ username, password });
	}
	return iterator;
}

function toReading(
	r: DexcomReading,
	index: number,
	readings: DexcomReading[]
): Reading {
	const prev = index > 0 ? readings[index - 1] : null;
	const date = new Date(r.Date);
	return {
		date,
		trend: r.Trend,
		value: r.Value,
		delta: prev ? r.Value - prev.Value : undefined,
		delay: prev ? date.getTime() - new Date(prev.Date).getTime() : undefined,
	};
}

export async function fetchReadings(maxCount = 36): Promise<ReadingsData> {
	const iter = getIterator();
	iter.reset();

	const result = await iter.read({ maxCount });
	const readings: Reading[] = result.map(toReading);
	const latestReading = readings[readings.length - 1];

	const now = Date.now();
	const expires = latestReading.date.valueOf() + READING_INTERVAL;
	let expiresDate = new Date(expires);

	if (expires <= now) {
		// If the expected next reading is in the past, set a short expiration
		expiresDate = new Date(now + 3000);
	}

	return {
		expires: expiresDate,
		units: "mg/dL",
		readings,
		latestReading,
	};
}

export function getRefreshDelay(expiresDate: Date): number {
	const now = Date.now();
	const expires = expiresDate.getTime();
	return Math.max(1000, expires - now);
}
