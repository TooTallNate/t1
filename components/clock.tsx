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
		<div className="left">
			<div className="time">{formatHoursMinutes(new Date(now))}</div>
			<div className="ago"><span>{ago}</span> {unit} ago</div>
			<style jsx>{`
				.left {
					height: 20%;
					width: 30%;
				}

				.time {
					font-size: 5em;
					text-align: center;
				}

				.ago {
					text-align: center;
				}
			`}</style>
		</div>
	)
}
