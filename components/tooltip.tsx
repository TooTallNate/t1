import { TooltipProps } from 'recharts';

import { arrow } from '../lib/trend';
import { Reading } from '../lib/types';
import { formatDate, formatTime } from '../lib/format';

export interface ReadingTooltipProps extends TooltipProps {
	units?: string;
}

export default function ReadingTooltip({
	active,
	payload,
	units,
}: ReadingTooltipProps) {
	if (active && payload) {
		const reading: Reading = payload[0].payload;
		const date = new Date(reading.date);
		return (
			<div className="tooltip">
				<p className="date">Date: {formatDate(date)}</p>
				<p className="time">Time: {formatTime(date)}</p>
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
