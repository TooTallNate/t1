import {
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	Line,
} from 'recharts';

import { ReadingsPayload } from '../lib/types';
import { formatHoursMinutes } from '../lib/format';

import ReadingTooltip from '../components/tooltip';

export default function ChartMain({
	units,
	readings,
}: Partial<ReadingsPayload>) {
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
					domain={['dataMin', Date.now()]}
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
				<Line
					type="monotone"
					dataKey="value"
					stroke="#8884d8"
					isAnimationActive={true}
					animationDuration={0.8}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
