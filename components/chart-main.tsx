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
import createTrend from '@lib/trendline';

import { ReadingsPayload } from '@lib/types';
import { formatHoursMinutes } from '@lib/format';

import ReadingTooltip from '@components/tooltip';

interface MainChartProps extends Partial<ReadingsPayload> {
	now: number;
}

export default function MainChart({
	now,
	units,
	readings,
	latestReading
}: MainChartProps) {
	const xDomain: [AxisDomain, AxisDomain] = [
		() => now - ms('3h'),
		() => now + ms('30m')
	];
	const data = readings ? readings.slice(0) : [];
	if (data.length > 0) {
		const trend = createTrend(data.slice(data.length - 5), 'date', 'value');
		//console.log(trend);
		const projected = [
			latestReading.date + ms('5m'),
			latestReading.date + ms('10m'),
			latestReading.date + ms('15m'),
			latestReading.date + ms('20m'),
			latestReading.date + ms('25m'),
			latestReading.date + ms('30m'),
			latestReading.date + ms('35m'),
			latestReading.date + ms('40m')
		].map(x => {
			return {
				date: x,
				value: trend.calcY(x),
				projected: true
			}
		});
		//console.log({ projected });
		data.push(...projected);
	}
	return (
		<ResponsiveContainer height="50%" width="100%">
			<LineChart
				data={data}
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
				<Tooltip isAnimationActive={false} content={<ReadingTooltip units={units} />} />
				<ReferenceLine y={55} stroke="#666" strokeDasharray="1 5" />
				<ReferenceLine y={80} stroke="#333" strokeDasharray="4 3" />
				<ReferenceLine y={180} stroke="#333" strokeDasharray="4 3" />
				<ReferenceLine y={240} stroke="#666" strokeDasharray="1 5" />
				/*
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
				*/
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
