"use client";

import { useEffect, useState } from "react";
import { TrendIcon } from "@/components/trend-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Reading {
	date: string | Date;
	trend: string | number;
	value: number;
	delta?: number;
	delay?: number;
}

interface LatestReadingCardProps {
	latestReading?: Reading;
	units?: string;
	loading: boolean;
	error?: string | null;
}

export function LatestReadingCard({
	latestReading,
	units,
	loading,
	error,
}: LatestReadingCardProps) {
	const [minutesAgo, setMinutesAgo] = useState<number | null>(null);

	useEffect(() => {
		if (!latestReading) return;

		const updateMinutesAgo = () => {
			const now = Date.now();
			const readingTime = new Date(latestReading.date).getTime();
			setMinutesAgo(Math.floor((now - readingTime) / 60000));
		};

		// Update immediately
		updateMinutesAgo();

		// Update every minute
		const interval = setInterval(updateMinutesAgo, 60000);

		return () => clearInterval(interval);
	}, [latestReading]);

	const getGlucoseStatus = (glucose: number) => {
		if (glucose < 70) return { status: "Low", color: "bg-red-500" };
		if (glucose > 180) return { status: "High", color: "bg-orange-500" };
		return { status: "Normal", color: "bg-green-500" };
	};

	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle className="text-foreground">Latest Reading</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="text-3xl font-bold text-muted-foreground">
						Loading...
					</div>
				) : error ? (
					<div className="text-sm text-red-500">{error}</div>
				) : latestReading ? (
					<>
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold text-foreground">
								{latestReading.value}
							</span>
							<span className="text-lg text-muted-foreground">
								{units || "mg/dL"}
							</span>
							<TrendIcon trend={latestReading.trend} />
							<Badge
								className={`${getGlucoseStatus(latestReading.value).color} text-white`}
							>
								{getGlucoseStatus(latestReading.value).status}
							</Badge>
						</div>
						<div className="flex items-center gap-2 mt-1">
							<p className="text-sm text-muted-foreground">
								{minutesAgo === null
									? "Loading..."
									: minutesAgo === 0
										? "Just now"
										: `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`}
							</p>
							{latestReading.delta !== undefined && (
								<span
									className={`text-sm font-medium ${
										latestReading.delta > 0
											? "text-red-500"
											: latestReading.delta < 0
												? "text-blue-500"
												: "text-muted-foreground"
									}`}
								>
									{latestReading.delta > 0 ? "+" : ""}
									{latestReading.delta} mg/dL
								</span>
							)}
						</div>
					</>
				) : (
					<div className="text-3xl font-bold text-muted-foreground">
						No data
					</div>
				)}
			</CardContent>
		</Card>
	);
}
