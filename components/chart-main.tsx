import ms from 'ms';
import {
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	Line,
} from 'recharts';

import useNow from '@lib/use-now';
import { ReadingsPayload } from '@lib/types';
import { formatHoursMinutes } from '@lib/format';

import ReadingTooltip from '@components/tooltip';

interface MainChartProps extends Partial<ReadingsPayload> {}

export default function MainChart({ units, readings }: MainChartProps) {
	const { now } = useNow();
	const xDomain = [now - ms('3h'), now + ms('30m')];
	return (
		<ResponsiveContainer height="50%" width="100%">
			<LineChart
				data={readings || []}
				margin={{ top: 5, right: 0, left: 30, bottom: 5 }}
				syncId="t1-chart"
			>
				<XAxis
					dataKey="date"
					type="number"
					tickFormatter={formatHoursMinutes}
					allowDataOverflow={true}
					domain={xDomain}
				/>
				<YAxis
					orientation="right"
					type="number"
					scale="log"
					domain={[35, 400]}
				/>
				<Tooltip
					isAnimationActive={false}
					content={<ReadingTooltip units={units} />}
				/>
				<ReferenceLine y={55} stroke="#666" strokeDasharray="1 5" />
				<ReferenceLine y={80} stroke="#333" strokeDasharray="4 3" />
				<ReferenceLine y={180} stroke="#333" strokeDasharray="4 3" />
				<ReferenceLine y={240} stroke="#666" strokeDasharray="1 5" />
				<Line
					type="monotone"
					dataKey="projectedUpper"
					stroke="#ccc"
					isAnimationActive={false}
				/>
				<Line
					type="monotone"
					dataKey="projectedLower"
					stroke="#ccc"
					isAnimationActive={false}
				/>
				<Line
					type="monotone"
					dataKey="value"
					stroke="green"
					isAnimationActive={false}
				/>
				<ReferenceLine x={now} stroke="#333" />
			</LineChart>
		</ResponsiveContainer>
	);
}
