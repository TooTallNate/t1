import ms from 'ms';
import { types } from 'node:util';
import createDexcomIterator, {
	type Reading as DexcomReading,
	type Trend,
} from 'dexcom-share';
import { snakeCase } from 'snake-case';
import createFetchServer from 'fetch-server';

interface Reading {
	date: Date;
	trend: Trend;
	value: number;
	delta?: number;
	delay?: DateDiff;
}

const READING_INTERVAL = ms('5m');

const iterator = createDexcomIterator({
	username: process.env.DEXCOM_USERNAME,
	password: process.env.DEXCOM_PASSWORD,
});

class DateDiff {
	from: Date;
	to: Date;

	constructor(from: Date, to: Date) {
		this.from = from;
		this.to = to;
	}

	get diff() {
		return this.to.getTime() - this.from.getTime();
	}

	toJSON() {
		return this.diff;
	}

	toShell() {
		// Return time difference as seconds
		return this.diff / 1000;
	}
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
		delay: prev ? new DateDiff(new Date(prev.Date), date) : undefined,
	};
}

function toShell(value: any, prefix = 't1'): string {
	let str = '';
	if (typeof value === 'undefined') {
		return str;
	}
	if (typeof value === 'string' || typeof value === 'number') {
		str += `${prefix}=${JSON.stringify(value)}\n`;
	} else if (types.isDate(value)) {
		str += `${prefix}=${Math.round(value.valueOf() / 1000)}\n`;
	} else if (Array.isArray(value)) {
		str += `${prefix}_count=${value.length}\n`;
		for (let i = 0; i < value.length; i++) {
			str += toShell(value[i], `${prefix}_${i}`);
		}
	} else if (typeof value.toShell === 'function') {
		str += `${prefix}=${value.toShell()}\n`;
	} else {
		// Assume "object"
		for (const [key, val] of Object.entries(value)) {
			str += toShell(val, `${prefix}_${snakeCase(key)}`);
		}
	}
	return str;
}

export default createFetchServer(async req => {
	const url = new URL(req.url);
	const maxCountParam = url.searchParams.get('maxCount') ?? '';
	const maxCount = Number.parseInt(maxCountParam, 10) || 2;
	iterator.reset();
	const result = await iterator.read({ maxCount });
	const readings: Reading[] = result.map(toReading);
	const latestReading = readings[readings.length - 1];

	const now = Date.now();
	const expires = latestReading.date.valueOf() + READING_INTERVAL;
	let expiresDate = new Date(expires);
	let seconds = Math.round((expires - now) / ms('1s'));
	if (seconds <= 0) {
		// If the expected next reading is in the past, then set a default of 3
		// seconds CDN expiration time. It's possible that the sensor is out
		// of range or warming up, in which case we shouldn't slam the Dexcom
		// server too aggressively.
		seconds = 3;
		expiresDate = new Date(now + ms('3s'));
	}

	const headers = new Headers();
	headers.set('Content-Type', 'application/json; charset=utf8');
	headers.set('Expires', expiresDate.toUTCString());
	headers.set('Cache-Control', `s-maxage=${seconds}, stale-while-revalidate`);

	const data = {
		expires: expiresDate,
		units: 'mg/dL',
		readings,
		latestReading,
	};
	const format = url.searchParams.get('format') || 'json';
	let status = 200;
	let body: string;
	if (format === 'json') {
		body = JSON.stringify(data);
	} else if (format === 'shell') {
		headers.set('Content-Type', 'text/plain; charset=utf8');
		body = toShell(data);
	} else {
		status = 400;
		body = JSON.stringify({
			error: `Invalid "format": ${format}`,
		});
	}
	return new Response(body, { status, headers });
});
