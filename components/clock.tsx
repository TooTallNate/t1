import ms from 'ms';
import { Flex, Box } from '@chakra-ui/react';

import useNow from '@lib/use-now';
import { Reading } from '@lib/types';
import { formatHoursMinutes } from '@lib/format';

interface ClockProps {
	latestReading?: Reading;
}

export default function Clock({ latestReading }: ClockProps) {
	const { now } = useNow();
	let ago = '-';
	let unit = 'minutes';

	if (latestReading) {
		const formatted = ms(now - latestReading.date, { long: true });
		[ago, unit] = formatted.split(' ');
	}

	return (
		<Flex alignItems="center" justifyContent="center" direction="column">
			<Box fontSize="lg">Current Time</Box>
			<Box fontSize="6xl">{formatHoursMinutes(new Date(now))}</Box>
			<Box fontSize="xl">
				<span>{ago}</span> {unit} ago
			</Box>
		</Flex>
	);
}
