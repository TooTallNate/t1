import { Box, Text, useApp, useInput, useStdout } from "ink";
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchReadings, getRefreshDelay } from "../dexcom.js";
import type { ReadingsData } from "../types.js";
import { GlucoseChart } from "./GlucoseChart.js";
import { LatestReading } from "./LatestReading.js";
import { TimeRangeSelector, TIME_RANGES } from "./TimeRangeSelector.js";

export function App() {
	const { exit } = useApp();
	const { stdout } = useStdout();
	const [data, setData] = useState<ReadingsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [selectedRangeIndex, setSelectedRangeIndex] = useState(1); // Default to 6H
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const selectedRange = TIME_RANGES[selectedRangeIndex];

	// Calculate chart width from terminal
	const terminalWidth = stdout?.columns ?? 80;
	const chartWidth = Math.max(20, terminalWidth - 8);

	// Calculate readings needed for selected time range
	// Each reading is 5 minutes apart
	const readingsNeeded = (selectedRange.hours * 60) / 5;

	const refresh = useCallback(async () => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		setLoading(true);
		setError(null);
		try {
			const result = await fetchReadings(readingsNeeded);
			setData(result);
			setLastUpdated(new Date());

			// Schedule next refresh based on expires time
			const delay = getRefreshDelay(result.expires);
			timeoutRef.current = setTimeout(refresh, delay);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			// Retry after 10 seconds on error
			timeoutRef.current = setTimeout(refresh, 10000);
		} finally {
			setLoading(false);
		}
	}, [readingsNeeded]);

	useEffect(() => {
		refresh();
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [refresh]);

	// Handle keyboard input
	useInput((input, key) => {
		if (input.toLowerCase() === "q" || key.escape) {
			exit();
		}
		if (input.toLowerCase() === "r") {
			refresh();
		}
		if (key.leftArrow) {
			setSelectedRangeIndex((i) => Math.max(0, i - 1));
		}
		if (key.rightArrow) {
			setSelectedRangeIndex((i) => Math.min(TIME_RANGES.length - 1, i + 1));
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box marginBottom={1} justifyContent="space-between">
				<Text bold color="cyan">
					t1 - Blood Glucose Monitor
				</Text>
				<TimeRangeSelector
					selectedIndex={selectedRangeIndex}
				/>
			</Box>

			{/* Latest Reading */}
			<LatestReading
				reading={data?.latestReading ?? null}
				units={data?.units ?? "mg/dL"}
				loading={loading && !data}
				error={error}
			/>

			{/* Chart */}
			<Box marginTop={1}>
				<GlucoseChart
					readings={data?.readings ?? []}
					chartWidth={chartWidth}
					height={12}
					loading={loading && !data}
					error={error}
				/>
			</Box>

			{/* Footer */}
			<Box marginTop={1} gap={2}>
				{lastUpdated && (
					<Text color="gray">
						Last updated: {lastUpdated.toLocaleTimeString()}
					</Text>
				)}
				<Text color="gray">
					[←/→] time range | [r] refresh | [q] quit
				</Text>
			</Box>
		</Box>
	);
}
