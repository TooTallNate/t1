import { Box, Text } from "ink";
import type { Reading } from "../types.js";
import { TrendIcon } from "./TrendIcon.js";

interface LatestReadingProps {
	reading: Reading | null;
	units: string;
	loading: boolean;
	error: string | null;
}

function getDelta(delta: number): string {
	if (delta === 0) return "+-0";
	if (delta > 0) return `+${delta}`;
	return `${delta}`;
}

function getGlucoseStatus(glucose: number): { status: string; color: string } {
	if (glucose < 70) return { status: "LOW", color: "red" };
	if (glucose > 180) return { status: "HIGH", color: "yellow" };
	return { status: "OK", color: "green" };
}

function getMinutesAgo(date: Date): number {
	return Math.floor((Date.now() - date.getTime()) / 60000);
}

export function LatestReading({
	reading,
	units,
	loading,
	error,
}: LatestReadingProps) {
	if (loading) {
		return (
			<Box flexDirection="column" borderStyle="single" paddingX={1}>
				<Text bold>Latest Reading</Text>
				<Text color="gray">Loading...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box flexDirection="column" borderStyle="single" paddingX={1}>
				<Text bold>Latest Reading</Text>
				<Text color="red">{error}</Text>
			</Box>
		);
	}

	if (!reading) {
		return (
			<Box flexDirection="column" borderStyle="single" paddingX={1}>
				<Text bold>Latest Reading</Text>
				<Text color="gray">No data</Text>
			</Box>
		);
	}

	const status = getGlucoseStatus(reading.value);
	const minutesAgo = getMinutesAgo(reading.date);

	return (
		<Box flexDirection="column" borderStyle="single" paddingX={1}>
			<Text bold>Latest Reading</Text>
			<Box gap={1}>
				<Text bold>{reading.value}</Text>
				<Text color="gray">{units}</Text>
				<TrendIcon trend={reading.trend} />
				<Text color={status.color as "red" | "yellow" | "green"}>
					[{status.status}]
				</Text>
			</Box>
			<Box gap={1}>
				<Text color="gray">
					{minutesAgo === 0
						? "Just now"
						: `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`}
				</Text>
				{reading.delta !== undefined && (
					<Text
						color={
							reading.delta > 0 ? "red" : reading.delta < 0 ? "blue" : "gray"
						}
					>
						{getDelta(reading.delta)} {units}
					</Text>
				)}
			</Box>
		</Box>
	);
}
