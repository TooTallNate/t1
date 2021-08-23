import { Box, useColorModeValue } from '@chakra-ui/react';
import { TooltipProps } from 'recharts';

import { Reading } from '@lib/types';
import { formatTime, formatReading } from '@lib/format';

export interface ReadingTooltipProps extends TooltipProps<number, string> {
	units?: string;
}

export default function ReadingTooltip({
	active,
	payload,
}: ReadingTooltipProps) {
	if (!active || !Array.isArray(payload) || payload.length === 0) return null;
	const bg = useColorModeValue('gray.100', 'gray.700');

	const reading: Reading = payload[0].payload;
	if (!reading.value) return null;
	const date = new Date(reading.date);
	return (
		<Box
			borderWidth="1px"
			borderRadius="lg"
			overflow="hidden"
			p={2}
			bg={bg}
		>
			<p>{formatTime(date)}</p>
			<p>{formatReading(reading)}</p>
		</Box>
	);
}
