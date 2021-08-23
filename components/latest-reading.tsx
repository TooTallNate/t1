import {
	Flex,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
} from '@chakra-ui/react';
import { arrow } from '@lib/trend';
import { formatPlus } from '@lib/format';

export default function LatestReading({ units, latestReading }: any) {
	if (!latestReading) return null;
	return (
		<Flex>
			<Stat>
				<StatLabel>Latest Reading</StatLabel>
				<StatNumber>
					{latestReading.value} {arrow(latestReading.trend)}
				</StatNumber>
				<StatHelpText>
					{formatPlus(latestReading.delta)} {units}
				</StatHelpText>
			</Stat>
		</Flex>
	);
}
