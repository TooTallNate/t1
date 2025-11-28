"use client";

import type { Trend } from "dexcom-share";
import {
	LabelList,
	Line,
	LineChart,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { TrendIcon } from "@/components/trend-icon";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getDelta } from "@/lib/delta";

interface Reading {
	date: string | Date;
	trend: Trend;
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
	{ label: "6H", hours: 6 },
	{ label: "12H", hours: 12 },
	{ label: "24H", hours: 24 },
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
			.map((reading, index, filteredReadings) => {
				const prevReading = index > 0 ? filteredReadings[index - 1] : null;
				return {
					timestamp: new Date(reading.date).toISOString(),
					glucose: reading.value,
					time: new Date(reading.date).toLocaleTimeString("en-US", {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					}),
					trend: reading.trend,
					delta: prevReading ? reading.value - prevReading.value : undefined,
				};
			});
	};

	const chartData = readings ? formatChartData(readings) : [];

	return (
		<Card className="bg-card border-border h-full flex flex-col">
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
			<CardContent className="p-0 sm:p-6 flex-1 flex flex-col">
				{loading ? (
					<div className="flex-1 flex items-center justify-center text-muted-foreground">
						Loading chart data...
					</div>
				) : error ? (
					<div className="flex-1 flex items-center justify-center text-red-500">
						{error}
					</div>
				) : chartData.length > 0 ? (
					<div className="flex-1 flex flex-col overflow-hidden">
						<div className="flex-1 w-full min-h-[300px] relative [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border text-xs">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={chartData}
									margin={{ top: 0, right: 0, left: 20, bottom: 10 }}
								>
									<XAxis
										dataKey="time"
										tick={{ fontSize: 12 }}
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										domain={[60, 250]}
										tick={{ fontSize: 12 }}
										tickLine={false}
										axisLine={false}
										orientation="right"
									/>
									{/* Reference areas - only for low and high ranges */}
									<ReferenceArea
										y1={60}
										y2={70}
										fill="#ef4444"
										fillOpacity={0.15}
									/>
									<ReferenceArea
										y1={180}
										y2={250}
										fill="#eab308"
										fillOpacity={0.15}
									/>
									{/* Reference lines */}
									<ReferenceLine
										y={70}
										stroke="#ef4444"
										strokeOpacity={0.4}
										strokeDasharray="5 5"
										strokeWidth={1}
									/>
									<ReferenceLine
										y={180}
										stroke="#eab308"
										strokeOpacity={0.4}
										strokeDasharray="5 5"
										strokeWidth={1}
									/>
									<Tooltip
										cursor={{
											stroke: "hsl(var(--muted-foreground))",
											strokeOpacity: 0.5,
										}}
										content={({ active, payload, label }) => {
											if (!active || !payload || !payload[0]) return null;
											const data = payload[0].payload;
											const delta = getDelta(data.delta);
											return (
												<div className="rounded-lg border-2 border-border bg-popover p-2 shadow-md">
													<div className="grid grid-cols-2 gap-2">
														<span className="text-[0.70rem] uppercase text-muted-foreground">
															Time
														</span>
														<span className="text-[0.70rem] font-medium">
															{label}
														</span>
														<span className="text-[0.70rem] uppercase text-muted-foreground">
															Glucose
														</span>
														<span className="text-[0.70rem] font-medium flex items-center gap-1">
															{data.glucose} mg/dL
															<TrendIcon
																trend={data.trend}
																className="h-3 w-3"
															/>
														</span>
														{delta && (
															<>
																<span className="text-[0.70rem] uppercase text-muted-foreground">
																	Change
																</span>
																<span className="text-[0.70rem] font-medium">
																	{delta} mg/dL
																</span>
															</>
														)}
													</div>
												</div>
											);
										}}
									/>
									<Line
										type="monotone"
										dataKey="glucose"
										stroke="var(--color-chart-1)"
										strokeWidth={2}
										dot={false}
										activeDot={{ r: 4, fill: "var(--color-chart-1)" }}
									>
										<LabelList
											dataKey="glucose"
											position="top"
											offset={20}
											style={{
												fontSize: "12px",
												fill: "hsl(var(--foreground))",
											}}
											content={(props) => {
												// Show labels for every nth point based on range
												const interval =
													selectedRange <= 3
														? 3
														: selectedRange <= 6
															? 6
															: selectedRange <= 12
																? 12
																: 24;
												const { index, x, y, value } = props as {
													index: number;
													x: number;
													y: number;
													value: number;
												};
												if (index % interval === 0) {
													return (
														<text
															x={x}
															y={y}
															textAnchor="middle"
															className="fill-black stroke-white/50 dark:fill-white dark:stroke-black/50"
															style={{
																fontSize: "11px",
																fontWeight: 600,
																strokeWidth: 2,
																paintOrder: "stroke",
															}}
														>
															{value}
														</text>
													);
												}
												return null;
											}}
										/>
									</Line>
								</LineChart>
							</ResponsiveContainer>
						</div>
						<div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground px-6">
							<div className="flex items-center gap-2">
								<div className="h-2 w-4 bg-destructive rounded opacity-40"></div>
								<span>Low/High Range</span>
							</div>
							<div className="flex items-center gap-2">
								<svg
									width="16"
									height="8"
									className="mt-0.5"
									aria-hidden="true"
								>
									<line
										x1="0"
										y1="4"
										x2="16"
										y2="4"
										stroke="hsl(var(--destructive))"
										strokeWidth="2"
										strokeDasharray="3,2"
									/>
								</svg>
								<span>Target Boundaries: 70 & 180 mg/dL</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-4 bg-chart-1 rounded"></div>
								<span>Current Glucose Level</span>
							</div>
						</div>
					</div>
				) : (
					<div className="flex-1 flex items-center justify-center text-muted-foreground">
						No data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
