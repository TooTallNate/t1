import ms from 'ms';
import {
	Flex,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
} from '@chakra-ui/react';

import useNow from '@lib/use-now';
import { LatestReading } from '@lib/types';
import { formatHoursMinutes } from '@lib/format';

interface ClockProps {
	latestReading?: LatestReading;
}

export default function Clock({ latestReading }: ClockProps) {
	const { now } = useNow();
	let ago = '-';
	let unit = 'minutes';
	if (latestReading) {
		const formatted = ms(now - latestReading.date, { long: true });
		if (typeof formatted === 'string') {
			[ago, unit] = formatted.split(' ');
		}
	}

	return (
		<Flex alignItems="center">
			<Stat>
				<StatLabel>Current Time</StatLabel>
				<StatNumber>{formatHoursMinutes(new Date(now))}</StatNumber>
				<StatHelpText>
					<span>{ago}</span> {unit} ago
				</StatHelpText>
			</Stat>
		</Flex>
	);
}
