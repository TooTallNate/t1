"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeDisplayProps {
	currentTime: Date;
}

export function TimeDisplay({ currentTime }: TimeDisplayProps) {
	return (
		<Card className="bg-card border-border">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					Current Time
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
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
			</CardContent>
		</Card>
	);
}
