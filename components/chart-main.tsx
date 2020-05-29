import ms from 'ms';
import {
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
	AxisDomain,
	Tooltip,
	Line,
} from 'recharts';

import { ReadingsPayload } from '../lib/types';
import { formatHoursMinutes } from '../lib/format';

import ReadingTooltip from '../components/tooltip';

interface MainChartProps extends Partial<ReadingsPayload> {
	now: number;
}

export default function MainChart({
	now,
	units,
	readings
}: MainChartProps) {
	const xDomain: [AxisDomain, AxisDomain] = [
		() => now - ms('3h'),
		() => now + ms('15m')
	];
	return (
		<ResponsiveContainer height="50%" width="100%">
			<LineChart
				data={readings || []}
				margin={{ top: 5, right: 0, left: 30, bottom: 5 }}
			>
				<XAxis
					dataKey="date"
					type="number"
					tickFormatter={formatHoursMinutes}
					allowDataOverflow={false}
					domain={xDomain}
				/>
				<YAxis
					orientation="right"
					type="number"
					scale="log"
					domain={[35, 400]}
				/>
				<Tooltip content={<ReadingTooltip units={units} />} />
				<ReferenceLine y={55} stroke="red" strokeDasharray="1 4" />
				<ReferenceLine y={80} stroke="red" strokeDasharray="3 9" />
				<ReferenceLine y={180} stroke="red" strokeDasharray="3 9" />
				<ReferenceLine y={240} stroke="red" strokeDasharray="1 4" />
				<ReferenceLine x={now} stroke="green" />
				<Line
					type="monotone"
					dataKey="projectedUpper"
					stroke="#cccccc"
					isAnimationActive={false}
				/>
				<Line
					type="monotone"
					dataKey="projectedLower"
					stroke="#cccccc"
					isAnimationActive={false}
				/>
				<Line
					type="monotone"
					dataKey="value"
					stroke="#8884d8"
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
