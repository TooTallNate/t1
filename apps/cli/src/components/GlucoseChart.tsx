import { Box, Text, useStdout } from "ink";
import { useState, useEffect } from "react";
import type { Reading } from "../types.js";
import { TimeRangeSelector } from "./TimeRangeSelector.js";

interface GlucoseChartProps {
	readings: Reading[];
	selectedRangeIndex: number;
	height?: number;
	loading: boolean;
	error: string | null;
}

// Unicode horizontal scan line characters for line rendering
const LINE_CHARS = [
	"⎺", // top
	"⎻",
	"─", // middle
	"⎼",
	"⎽", // bottom
];

// Glucose thresholds
const LOW_THRESHOLD = 70;
const HIGH_THRESHOLD = 180;
const Y_MIN = 40;
const Y_MAX = 300;

// Y-axis width: "│" (1) + label like " 180" (4) = 5
const Y_AXIS_WIDTH = 5;

interface Cell {
	char: string;
	color?: string;
	backgroundColor?: string;
}

export function GlucoseChart({
	readings,
	selectedRangeIndex,
	height = 10,
	loading,
	error,
}: GlucoseChartProps) {
	const { stdout } = useStdout();
	const [terminalWidth, setTerminalWidth] = useState(stdout?.columns ?? 80);

	// Listen for terminal resize events
	useEffect(() => {
		if (!stdout) return;

		const handleResize = () => {
			setTerminalWidth(stdout.columns);
		};

		stdout.on("resize", handleResize);
		return () => {
			stdout.off("resize", handleResize);
		};
	}, [stdout]);

	// Calculate available width for the chart line
	// Terminal width - app padding (2) - border (2) - paddingX (2) - y-axis (5)
	const chartWidth = Math.max(20, terminalWidth - 2 - 2 - 2 - Y_AXIS_WIDTH);

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
	const rawValues = readings.map((r) => r.value);

	// Get time range info
	const firstReading = readings[0];
	const lastReading = readings[readings.length - 1];

	// Calculate duration in hours
	const durationMs = lastReading.date.getTime() - firstReading.date.getTime();
	const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

	// Calculate stats
	const min = Math.min(...rawValues);
	const max = Math.max(...rawValues);
	const avg = Math.round(rawValues.reduce((a, b) => a + b, 0) / rawValues.length);
	const inRange = rawValues.filter((v) => v >= LOW_THRESHOLD && v <= HIGH_THRESHOLD).length;
	const inRangePercent = Math.round((inRange / rawValues.length) * 100);

	// Scale data to chart width
	const values = scaleDataToWidth(rawValues, chartWidth);

	// Create the chart grid with background zones
	const grid = createChartGrid(values, chartWidth, height);

	// Create Y-axis labels (right side)
	const yLabels = createYAxisLabels(height);

	// Create X-axis time labels
	const xLabels = createTimeLabels(firstReading.date, lastReading.date, 5);

	return (
		<Box flexDirection="column" borderStyle="single" paddingX={1}>
			<Box marginBottom={1} justifyContent="space-between">
				<Box>
					<Text bold>Glucose Trend </Text>
					<Text color="gray">
						(Past {durationHours}h: {formatTime(firstReading.date)} -{" "}
						{formatTime(lastReading.date)})
					</Text>
				</Box>
				<TimeRangeSelector selectedIndex={selectedRangeIndex} />
			</Box>

			{/* Chart with Y-axis on right */}
			{grid.map((row, rowIndex) => (
				<Box key={rowIndex}>
					<Text>
						{row.map((cell, colIndex) => (
							<Text key={colIndex} color={cell.color} backgroundColor={cell.backgroundColor}>
								{cell.char}
							</Text>
						))}
					</Text>
					<Text color="gray">│</Text>
					<Text color="gray">{yLabels[rowIndex]}</Text>
				</Box>
			))}

			{/* X-axis */}
			<Box>
				<Text color="gray">{"─".repeat(chartWidth)}┘</Text>
			</Box>
			<Box>
				<Text color="gray">{formatXAxisLabels(xLabels, chartWidth)}</Text>
			</Box>

			{/* Stats */}
			<Box marginTop={1} gap={2} flexWrap="wrap">
				<Text>
					Min: <Text color={min < LOW_THRESHOLD ? "red" : "green"}>{min}</Text>
				</Text>
				<Text>
					Max: <Text color={max > HIGH_THRESHOLD ? "yellow" : "green"}>{max}</Text>
				</Text>
				<Text>
					Avg:{" "}
					<Text color={avg < LOW_THRESHOLD || avg > HIGH_THRESHOLD ? "yellow" : "green"}>
						{avg}
					</Text>
				</Text>
				<Text>
					In Range:{" "}
					<Text color={inRangePercent >= 70 ? "green" : "yellow"}>
						{inRangePercent}%
					</Text>
				</Text>
			</Box>

			{/* Legend */}
			<Box gap={2}>
				<Text>
					<Text backgroundColor="#4a1a1a">  </Text>
					<Text color="gray"> Low (&lt;{LOW_THRESHOLD})</Text>
				</Text>
				<Text>
					<Text backgroundColor="#4a3a1a">  </Text>
					<Text color="gray"> High (&gt;{HIGH_THRESHOLD})</Text>
				</Text>
			</Box>
		</Box>
	);
}

function createChartGrid(values: number[], width: number, height: number): Cell[][] {
	const totalLevels = height * 5; // 5 sub-positions per row
	const grid: Cell[][] = [];

	// Initialize grid with background zones
	for (let row = 0; row < height; row++) {
		const rowCells: Cell[] = [];

		// Calculate the Y value range for this row
		const rowTopLevel = (height - row) * 5 - 1;
		const rowBottomLevel = (height - row - 1) * 5;
		const rowTopValue = levelToValue(rowTopLevel, totalLevels);
		const rowBottomValue = levelToValue(rowBottomLevel, totalLevels);

		// Determine background color based on zone (using dark/muted colors)
		let bgColor: string | undefined;
		if (rowBottomValue < LOW_THRESHOLD && rowTopValue <= LOW_THRESHOLD + 10) {
			bgColor = "#4a1a1a"; // dark red
		} else if (rowTopValue > HIGH_THRESHOLD && rowBottomValue >= HIGH_THRESHOLD - 10) {
			bgColor = "#4a3a1a"; // dark yellow/orange
		}

		for (let col = 0; col < width; col++) {
			rowCells.push({
				char: " ",
				backgroundColor: bgColor,
			});
		}
		grid.push(rowCells);
	}

	// Plot the line
	for (let x = 0; x < values.length; x++) {
		const value = values[x];
		const level = valueToLevel(value, totalLevels);
		const row = Math.floor((totalLevels - 1 - level) / 5);
		const subPos = (totalLevels - 1 - level) % 5;

		if (row >= 0 && row < height) {
			// Determine line color based on value
			let lineColor = "cyan";
			if (value < LOW_THRESHOLD) {
				lineColor = "red";
			} else if (value > HIGH_THRESHOLD) {
				lineColor = "yellow";
			}

			// Preserve the background color from the zone
			const existingBg = grid[row][x].backgroundColor;

			grid[row][x] = {
				char: LINE_CHARS[subPos],
				color: lineColor,
				backgroundColor: existingBg,
			};
		}
	}

	return grid;
}

function valueToLevel(value: number, totalLevels: number): number {
	const normalized = (value - Y_MIN) / (Y_MAX - Y_MIN);
	const clamped = Math.max(0, Math.min(1, normalized));
	return Math.round(clamped * (totalLevels - 1));
}

function levelToValue(level: number, totalLevels: number): number {
	return Y_MIN + (level / (totalLevels - 1)) * (Y_MAX - Y_MIN);
}

function scaleDataToWidth(data: number[], targetWidth: number): number[] {
	if (data.length === targetWidth) return data;
	if (data.length === 1) return Array(targetWidth).fill(data[0]);

	const scaled: number[] = [];
	for (let i = 0; i < targetWidth; i++) {
		const sourceIndex = (i / (targetWidth - 1)) * (data.length - 1);
		const lowerIndex = Math.floor(sourceIndex);
		const upperIndex = Math.ceil(sourceIndex);
		const fraction = sourceIndex - lowerIndex;

		if (lowerIndex === upperIndex || upperIndex >= data.length) {
			scaled.push(data[lowerIndex]);
		} else {
			const interpolated = data[lowerIndex] + fraction * (data[upperIndex] - data[lowerIndex]);
			scaled.push(Math.round(interpolated));
		}
	}
	return scaled;
}

function createYAxisLabels(height: number): string[] {
	const labels: string[] = [];
	const totalLevels = height * 5;

	// Key values to show on Y-axis
	const keyValues = [Y_MAX, HIGH_THRESHOLD, 120, LOW_THRESHOLD, Y_MIN];

	for (let row = 0; row < height; row++) {
		const rowMiddleLevel = (height - row - 0.5) * 5;
		const rowValue = levelToValue(rowMiddleLevel, totalLevels);

		// Find if any key value is close to this row
		let label = "    ";
		for (const keyVal of keyValues) {
			if (Math.abs(rowValue - keyVal) < (Y_MAX - Y_MIN) / height / 2) {
				label = keyVal.toString().padStart(4);
				break;
			}
		}
		labels.push(label);
	}

	return labels;
}

function createTimeLabels(startDate: Date, endDate: Date, numLabels: number): string[] {
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

function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

function formatXAxisLabels(labels: string[], chartWidth: number): string {
	const result = Array(chartWidth).fill(" ");

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];
		const pos = Math.round((i / (labels.length - 1)) * (chartWidth - 1));
		const startPos = Math.max(0, Math.min(chartWidth - label.length, pos - Math.floor(label.length / 2)));

		for (let j = 0; j < label.length && startPos + j < chartWidth; j++) {
			result[startPos + j] = label[j];
		}
	}

	return result.join("");
}
