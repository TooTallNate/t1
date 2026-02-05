import { Box, Text, useApp, useInput, useStdout } from "ink";
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchReadings, getRefreshDelay } from "../dexcom.js";
import type { ReadingsData } from "../types.js";
import { GlucoseChart } from "./GlucoseChart.js";
import { LatestReading } from "./LatestReading.js";
import { TIME_RANGES } from "./TimeRangeSelector.js";

// Fixed heights for layout calculation
// App padding: 2, Header: 2, LatestReading: 5, margins: 2
// Chart border: 2, chart header: 2, x-axis: 2, stats: 2, legend: 1
// Footer: 2
const FIXED_HEIGHT = 22;

export function App() {
	const { exit } = useApp();
	const { stdout } = useStdout();
	const [terminalHeight, setTerminalHeight] = useState(stdout?.rows ?? 24);
	const [data, setData] = useState<ReadingsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [selectedRangeIndex, setSelectedRangeIndex] = useState(1); // Default to 6H
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const selectedRange = TIME_RANGES[selectedRangeIndex];

	// Listen for terminal resize events
	useEffect(() => {
		if (!stdout) return;

		const handleResize = () => {
			setTerminalHeight(stdout.rows);
		};

		stdout.on("resize", handleResize);
		return () => {
			stdout.off("resize", handleResize);
		};
	}, [stdout]);

	// Calculate chart height based on available terminal height
	const chartHeight = Math.max(5, terminalHeight - FIXED_HEIGHT);

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
		<Box flexDirection="column" padding={1} height={terminalHeight}>
			{/* Header */}
			<Box marginBottom={1}>
				<Text bold color="cyan">
					t1 - Blood Glucose Monitor
				</Text>
			</Box>

			{/* Latest Reading */}
			<LatestReading
				reading={data?.latestReading ?? null}
				units={data?.units ?? "mg/dL"}
				loading={loading && !data}
				error={error}
			/>

			{/* Chart - grows to fill available space */}
			<Box marginTop={1} flexGrow={1}>
				<GlucoseChart
					readings={data?.readings ?? []}
					selectedRangeIndex={selectedRangeIndex}
					height={chartHeight}
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
