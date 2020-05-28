import { arrow } from '../lib/trend';
import { formatDate, formatTime } from '../lib/format';

export default function ReadingTooltip({ active, payload, label, units }: any) {
	if (active) {
		const reading = payload[0].payload;
		return (
			<div className="tooltip">
				<p className="date">Date: {formatDate(label)}</p>
				<p className="time">Time: {formatTime(label)}</p>
				<p className="value">
					{units}:{' '}
					<span className="value">
						{reading.value} {arrow(reading.trend)}
					</span>
				</p>
				<style jsx>{`
					.tooltip {
						background-color: rgba(255, 255, 255, 0.8);
						border: solid 1px #bbb;
						padding: 0.5em;
					}
				`}</style>
			</div>
		);
	}

	return null;
}
