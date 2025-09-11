"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TimeDisplay() {
	const [currentTime, setCurrentTime] = useState<Date | null>(null);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const tick = () => {
			// Update the time
			const now = new Date();
			setCurrentTime(now);

			// Calculate milliseconds until next second boundary
			const msUntilNextSecond = 1000 - now.getMilliseconds();

			// Schedule next tick
			timeoutId = setTimeout(tick, msUntilNextSecond);
		};

		// Start ticking immediately
		tick();

		return () => {
			clearTimeout(timeoutId);
		};
	}, []);

	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle className="text-foreground">Current Time</CardTitle>
			</CardHeader>
			<CardContent>
				{currentTime ? (
					<>
						<div className="text-3xl font-bold text-foreground">
							{currentTime.toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
								hour12: false,
							})}
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{currentTime.toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</>
				) : (
					<>
						<div className="text-3xl font-bold text-foreground">--:--:--</div>
						<p className="text-sm text-muted-foreground mt-1">Loading...</p>
					</>
				)}
			</CardContent>
		</Card>
	);
}
