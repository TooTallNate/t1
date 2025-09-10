"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

interface Reading {
	date: string | Date;
	trend: string | number;
	value: number;
	delta?: number;
	delay?: number;
}

interface GlucoseChartProps {
	readings?: Reading[];
	selectedRange: number;
	onRangeChange: (hours: number) => void;
	loading: boolean;
	error?: string | null;
}

const timeRanges = [
	{ label: "3H", hours: 3 },
	{ label: "12H", hours: 12 },
	{ label: "24H", hours: 24 },
	{ label: "3D", hours: 72 },
];

export function GlucoseChart({
	readings,
	selectedRange,
	onRangeChange,
	loading,
	error,
}: GlucoseChartProps) {
	const formatChartData = (readings: Reading[]) => {
		if (!readings || readings.length === 0) return [];

		const now = Date.now();
		const rangeStart = now - selectedRange * 60 * 60 * 1000;

		return readings
			.filter((reading) => new Date(reading.date).getTime() >= rangeStart)
			.map((reading) => ({
				timestamp: new Date(reading.date).toISOString(),
				glucose: reading.value,
				time: new Date(reading.date).toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				}),
			}));
	};

	const chartData = readings ? formatChartData(readings) : [];

	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-foreground">Glucose Trend</CardTitle>
						<CardDescription>Blood glucose levels over time</CardDescription>
					</div>
					<div className="flex gap-1">
						{timeRanges.map((range) => (
							<Button
								key={range.hours}
								variant={selectedRange === range.hours ? "default" : "outline"}
								size="sm"
								onClick={() => onRangeChange(range.hours)}
								className="h-8 px-3"
							>
								{range.label}
							</Button>
						))}
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0 sm:p-6">
				{loading ? (
					<div className="h-[400px] flex items-center justify-center text-muted-foreground">
						Loading chart data...
					</div>
				) : error ? (
					<div className="h-[400px] flex items-center justify-center text-red-500">
						{error}
					</div>
				) : chartData.length > 0 ? (
					<>
						<ChartContainer
							config={{
								glucose: {
									label: "Glucose",
									color: "hsl(var(--chart-1))",
								},
							}}
							className="h-[400px] w-full"
						>
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={chartData}
									margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke="hsl(var(--border))"
									/>
									<XAxis
										dataKey="time"
										stroke="hsl(var(--muted-foreground))"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										domain={[60, 250]}
										stroke="hsl(var(--muted-foreground))"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<ChartTooltip
										content={<ChartTooltipContent />}
										labelFormatter={(value) => `Time: ${value}`}
										formatter={(value) => [`${value} mg/dL`, "Glucose"]}
									/>
									{/* Target range indicators */}
									<ReferenceLine
										y={70}
										stroke="hsl(var(--destructive))"
										strokeDasharray="5 5"
									/>
									<ReferenceLine
										y={180}
										stroke="hsl(var(--destructive))"
										strokeDasharray="5 5"
									/>
									<Line
										type="monotone"
										dataKey="glucose"
										stroke="var(--color-chart-1)"
										strokeWidth={2}
										dot={false}
										activeDot={{ r: 4, fill: "var(--color-chart-1)" }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</ChartContainer>
						<div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground px-6">
							<div className="flex items-center gap-2">
								<div className="h-2 w-4 bg-destructive rounded opacity-60"></div>
								<span>Target Range: 70-180 mg/dL</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-4 bg-chart-1 rounded"></div>
								<span>Current Glucose Level</span>
							</div>
						</div>
					</>
				) : (
					<div className="h-[400px] flex items-center justify-center text-muted-foreground">
						No data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
