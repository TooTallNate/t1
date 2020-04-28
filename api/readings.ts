import ms from 'ms';
import createDexcomIterator, {
	Reading as DexcomReading,
	Trend
} from 'dexcom-share';
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

	res.send({
		units: 'mg/dL',
		readings,
		latestReading
	});
};
