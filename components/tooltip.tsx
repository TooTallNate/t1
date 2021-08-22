import { Box, useColorModeValue } from '@chakra-ui/react';
import { TooltipProps } from 'recharts';

import { arrow } from '@lib/trend';
import { Reading } from '@lib/types';
import { formatDate, formatTime } from '@lib/format';

export interface ReadingTooltipProps extends TooltipProps<number, string> {
	units?: string;
}

export default function ReadingTooltip({
	active,
	payload,
	units,
}: ReadingTooltipProps) {
	if (!active || !Array.isArray(payload) || payload.length === 0) return null;
	const bg = useColorModeValue('gray.100', 'gray.700');

	const reading: Reading = payload[0].payload;
	const date = new Date(reading.date);
	return (
		<Box
			borderWidth="1px"
			borderRadius="lg"
			overflow="hidden"
			p={2}
			bg={bg}
		>
			<p className="date">Date: {formatDate(date)}</p>
			<p className="time">Time: {formatTime(date)}</p>
			<p className="value">
				{units}:{' '}
				<span className="value">
					{Math.round(reading.value)} {arrow(reading.trend)}
				</span>
			</p>
		</Box>
	);
}
