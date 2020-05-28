import ms from 'ms';
import { isDate } from 'util';
import createDexcomIterator, {
	Reading as DexcomReading,
	Trend
} from 'dexcom-share';
import { snakeCase } from 'snake-case';
import { NowRequest, NowResponse } from '@now/node';

const READING_INTERVAL = ms('5m');

interface Reading {
	date: Date;
	trend: Trend;
	value: number;
}

interface LatestReading extends Reading {
	delta: number;
}

function toReading(r: DexcomReading): Reading {
	return {
		date: new Date(r.Date),
		trend: r.Trend,
		value: r.Value
	};
}

function toShell(value: any, prefix = 't1'): string {
	let str = '';
	if (typeof value === 'string' || typeof value === 'number') {
		str += `${prefix}=${JSON.stringify(value)}\n`;
	} else if (isDate(value)) {
		str += `${prefix}=${value.valueOf()}\n`;
	} else if (Array.isArray(value)) {
		str += `${prefix}_count=${value.length}\n`;
		for (let i = 0; i < value.length; i++) {
			str += toShell(value[i], `${prefix}_${i}`);
		}
	} else {
		// Assume "object"
		for (const [key, val] of Object.entries(value)) {
			str += toShell(val, `${prefix}_${snakeCase(key)}`);
		}
	}
	return str;
}

export default async (req: NowRequest, res: NowResponse) => {
	const iterator = createDexcomIterator({
		username: process.env.DEXCOM_USERNAME,
		password: process.env.DEXCOM_PASSWORD
	});
	const maxCount =
		parseInt(
			Array.isArray(req.query.maxCount)
				? req.query.maxCount[0]
				: req.query.maxCount,
			10
		) || 2;
	const result = await iterator.read({ maxCount });
	const readings: Reading[] = result.map(toReading);
	const o1 = result[result.length - 1];
	const o2 = result[result.length - 2];
	const latestReading: LatestReading = {
		...toReading(o1),
		delta: o1.Value - o2.Value
	};

	const expires = latestReading.date.valueOf() + READING_INTERVAL + ms('10s');
	let seconds = Math.round((expires - Date.now()) / ms('1s'));
	if (seconds <= 0) {
		// If the expected next reading is in the past, then set a default 10
		// seconds CDN expiration time. It's possible that the sensor is out
		// of range or warming up, in which case we shouldn't slam the Dexcom
		// server too aggressively.
		seconds = 10;
	}

	res.setHeader('Expires', new Date(expires).toUTCString());
	res.setHeader(
		'Cache-Control',
		`s-maxage=${seconds}, immutable, must-revalidate, stale-while-revalidate`
	);

	const data = {
		units: 'mg/dL',
		readings,
		latestReading
	};
	const format = typeof req.query.format === 'string' ? req.query.format : 'json';
	if (format === 'json') {
		res.send(data);
	} else if (format === 'shell') {
		res.setHeader('Content-Type', 'text/plain; charset=utf8');
		res.end(toShell(data));
	} else {
		res.statusCode = 400;
		res.send({
			error: `Invalid "format": ${format}`
		});
	}
};
