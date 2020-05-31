import ms from 'ms';
import { formatHoursMinutes } from '../lib/format';
import { LatestReading } from '../lib/types';

interface ClockProps {
	now: number;
	latestReading?: LatestReading;
}

export default function Clock({ now, latestReading }: ClockProps) {
	let ago = '-';
	let unit = 'minutes';
	if (latestReading) {
		const formatted = ms(now - latestReading.date, { long: true });
		if (typeof formatted === 'string') {
			[ago, unit] = formatted.split(' ');
		}
	}

	return (
		<div className="clock">
			<div className="time">{formatHoursMinutes(new Date(now))}</div>
			<div className="ago"><span>{ago}</span> {unit} ago</div>
			<style jsx>{`
				.clock {
					height: 20%;
					width: 20%;
					text-align: center;
				}

				.time {
					font-size: 6em;
				}

				.ago {
					font-size: 1.5em;
				}
			`}</style>
		</div>
	)
}
