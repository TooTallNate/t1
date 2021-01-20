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

import useNow from '@lib/use-now';
import { ReadingsPayload } from '@lib/types';
import { formatHoursMinutes } from '@lib/format';

import ReadingTooltip from '@components/tooltip';

interface ExtendedChartProps extends Partial<ReadingsPayload> {}

export default function ExtendedChart({ units, readings }: ExtendedChartProps) {
	const { now } = useNow();
	const xDomain: [AxisDomain, AxisDomain] = [() => now - ms('1d'), () => now];
	const dotStyle = {
		stroke: '#8884d8',
		r: 1.5,
	};
	return (
		<ResponsiveContainer height="20%" width="100%" className="container">
			<LineChart
				data={readings || []}
				margin={{ top: 5, right: 0, left: 30, bottom: 5 }}
				syncId="t1-chart"
			>
				<XAxis
					dataKey="date"
					type="number"
					allowDataOverflow={true}
					domain={xDomain}
				/>
				<YAxis
					orientation="right"
					type="number"
					scale="log"
					hide={true}
					domain={[35, 400]}
				/>
				<Tooltip
					isAnimationActive={false}
					content={<ReadingTooltip units={units} />}
				/>
				<ReferenceLine y={80} stroke="#666" strokeDasharray="3 3" />
				<ReferenceLine y={180} stroke="#666" strokeDasharray="3 3" />
				<Line
					type="monotone"
					dataKey="value"
					stroke="none"
					dot={dotStyle}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
