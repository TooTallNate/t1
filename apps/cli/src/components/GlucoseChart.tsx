import { Box, Text } from "ink";
import { LineGraph } from "@pppp606/ink-chart";
import type { Reading } from "../types.js";

interface GlucoseChartProps {
	readings: Reading[];
	chartWidth: number;
	height?: number;
	loading: boolean;
	error: string | null;
}

export function GlucoseChart({
	readings,
	chartWidth,
	height = 10,
	loading,
	error,
}: GlucoseChartProps) {
	if (loading) {
		return (
			<Box flexDirection="column" borderStyle="single" paddingX={1}>
				<Text bold>Glucose Trend</Text>
				<Text color="gray">Loading chart data...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box flexDirection="column" borderStyle="single" paddingX={1}>
				<Text bold>Glucose Trend</Text>
				<Text color="red">{error}</Text>
			</Box>
		);
	}

	if (!readings || readings.length === 0) {
		return (
			<Box flexDirection="column" borderStyle="single" paddingX={1}>
				<Text bold>Glucose Trend</Text>
				<Text color="gray">No data available</Text>
			</Box>
		);
	}

	// Get glucose values
	const values = readings.map((r) => r.value);

	// Get time range info
	const firstReading = readings[0];
	const lastReading = readings[readings.length - 1];

	// Calculate duration in hours
	const durationMs = lastReading.date.getTime() - firstReading.date.getTime();
	const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

	// Create x-axis time labels
	const xLabels = createTimeLabels(firstReading.date, lastReading.date, 5);

	// Calculate stats
	const min = Math.min(...values);
	const max = Math.max(...values);
	const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
	const inRange = values.filter((v) => v >= 70 && v <= 180).length;
	const inRangePercent = Math.round((inRange / values.length) * 100);

	// Determine line color based on latest reading
	const latestValue = values[values.length - 1];
	const colorName =
		latestValue < 70 ? "red" : latestValue > 180 ? "yellow" : "cyan";

	return (
		<Box flexDirection="column" borderStyle="single" paddingX={1}>
			<Box marginBottom={1}>
				<Text bold>Glucose Trend </Text>
				<Text color="gray">
					(Past {durationHours}h: {formatTime(firstReading.date)} -{" "}
					{formatTime(lastReading.date)})
				</Text>
			</Box>

			<LineGraph
				data={[{ values, color: colorName }]}
				width={chartWidth}
				height={height}
				yDomain={[40, 300]}
				showYAxis={true}
				yLabels={[70, 120, 180, 250]}
				xLabels={xLabels}
			/>

			<Box marginTop={1} gap={2} flexWrap="wrap">
				<Text>
					Min: <Text color={min < 70 ? "red" : "green"}>{min}</Text>
				</Text>
				<Text>
					Max: <Text color={max > 180 ? "yellow" : "green"}>{max}</Text>
				</Text>
				<Text>
					Avg:{" "}
					<Text color={avg < 70 || avg > 180 ? "yellow" : "green"}>{avg}</Text>
				</Text>
				<Text>
					In Range:{" "}
					<Text color={inRangePercent >= 70 ? "green" : "yellow"}>
						{inRangePercent}%
					</Text>
				</Text>
			</Box>
			<Box gap={2}>
				<Text color="red">--- 70 mg/dL (Low)</Text>
				<Text color="yellow">--- 180 mg/dL (High)</Text>
			</Box>
		</Box>
	);
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

function createTimeLabels(
	startDate: Date,
	endDate: Date,
	numLabels: number
): string[] {
	const startTime = startDate.getTime();
	const endTime = endDate.getTime();
	const timeSpan = endTime - startTime;

	const labels: string[] = [];

	for (let i = 0; i < numLabels; i++) {
		const fraction = i / (numLabels - 1);
		const time = new Date(startTime + fraction * timeSpan);
		labels.push(formatTime(time));
	}

	return labels;
}
