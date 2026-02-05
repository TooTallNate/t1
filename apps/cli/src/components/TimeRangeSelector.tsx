import { Box, Text } from "ink";

export const TIME_RANGES = [
	{ label: "3H", hours: 3 },
	{ label: "6H", hours: 6 },
	{ label: "12H", hours: 12 },
	{ label: "24H", hours: 24 },
] as const;

interface TimeRangeSelectorProps {
	selectedIndex: number;
}

export function TimeRangeSelector({ selectedIndex }: TimeRangeSelectorProps) {
	return (
		<Box gap={1}>
			<Text color="gray">←</Text>
			{TIME_RANGES.map((range, index) => (
				<Text
					key={range.label}
					bold={index === selectedIndex}
					color={index === selectedIndex ? "green" : "gray"}
				>
					{index === selectedIndex ? `[${range.label}]` : ` ${range.label} `}
				</Text>
			))}
			<Text color="gray">→</Text>
		</Box>
	);
}
