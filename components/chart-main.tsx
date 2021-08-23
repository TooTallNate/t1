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
import { useTheme, useColorModeValue } from '@chakra-ui/react';

import useNow from '@lib/use-now';
import { ReadingsPayload } from '@lib/types';
import { formatHoursMinutes } from '@lib/format';

import ReadingTooltip from '@components/tooltip';

interface MainChartProps extends Partial<ReadingsPayload> {}

export default function MainChart({ units, readings }: MainChartProps) {
	const { now } = useNow();
	const theme = useTheme();
	const xDomain = [now - ms('3h'), now + ms('30m')];
	const refLineDarkStroke = useColorModeValue(
		theme.colors.gray[400],
		theme.colors.gray[600]
	);
	const refLineLightStroke = useColorModeValue(
		theme.colors.gray[400],
		theme.colors.gray[600]
	);
	const lineStroke = useColorModeValue(
		theme.colors.green[500],
		theme.colors.green[300]
	);
	const lineFill = useColorModeValue(
		theme.colors.gray[50],
		theme.colors.gray[800]
	);
	const projectedStroke = useColorModeValue(
		theme.colors.gray[300],
		theme.colors.gray[600]
	);
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
				<ReferenceLine
					y={55}
					stroke={refLineLightStroke}
					strokeDasharray="1 5"
				/>
				<ReferenceLine
					y={80}
					stroke={refLineDarkStroke}
					strokeDasharray="4 3"
				/>
				<ReferenceLine
					y={180}
					stroke={refLineDarkStroke}
					strokeDasharray="4 3"
				/>
				<ReferenceLine
					y={240}
					stroke={refLineLightStroke}
					strokeDasharray="1 5"
				/>
				<Line
					type="monotone"
					dataKey="projectedUpper"
					fill={lineFill}
					stroke={projectedStroke}
					isAnimationActive={false}
				/>
				<Line
					type="monotone"
					dataKey="projectedLower"
					fill={lineFill}
					stroke={projectedStroke}
					isAnimationActive={false}
				/>
				<Line
					type="monotone"
					dataKey="value"
					fill={lineFill}
					stroke={lineStroke}
					isAnimationActive={false}
				/>
				<ReferenceLine x={now} stroke={refLineDarkStroke} />
			</LineChart>
		</ResponsiveContainer>
	);
}
