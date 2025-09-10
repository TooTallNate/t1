"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { ThemeProvider } from "@/components/theme-provider";
import { DashboardHeader } from "@/components/dashboard-header";
import { TimeDisplay } from "@/components/time-display";
import { LatestReadingCard } from "@/components/latest-reading-card";
import { GlucoseChart } from "@/components/glucose-chart";

interface Reading {
	date: string | Date;
	trend: string | number;
	value: number;
	delta?: number;
	delay?: number;
}

interface ReadingsData {
	expires: string | Date;
	units: string;
	readings: Reading[];
	latestReading: Reading;
}

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.statusText}`);
	}
	return response.json();
};

export default function GlucoseMonitor() {
	const [selectedRange, setSelectedRange] = useState(12);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

	// Calculate maxCount based on selected range
	const maxCount =
		selectedRange <= 3
			? 36
			: selectedRange <= 12
				? 144
				: selectedRange <= 24
					? 288
					: 864;

	// Use SWR for data fetching
	const { data, error, isLoading } = useSWR<ReadingsData>(
		`/api/readings?maxCount=${maxCount}`,
		fetcher,
		{
			refreshInterval: (data) => {
				// Calculate refresh interval based on expires time
				if (data?.expires) {
					const expiresAt = new Date(data.expires).getTime();
					const now = Date.now();
					const delay = Math.max(1000, expiresAt - now);
					return delay;
				}
				// Retry every 10 seconds on error
				return 10000;
			},
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	// Update current time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const toggleTheme = () => {
		const newTheme =
			theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
		setTheme(newTheme);

		if (newTheme === "system") {
			document.documentElement.classList.remove("light", "dark");
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			document.documentElement.classList.add(systemTheme);
		} else {
			document.documentElement.classList.remove("light", "dark", "system");
			document.documentElement.classList.add(newTheme);
		}
	};

	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<div className="min-h-screen bg-background p-4 md:p-6">
				<div className="mx-auto max-w-7xl space-y-6">
					<DashboardHeader theme={theme} onThemeToggle={toggleTheme} />

					{/* Current Time & Latest Reading */}
					<div className="grid gap-4 md:grid-cols-2">
						<TimeDisplay currentTime={currentTime} />
						<LatestReadingCard
							latestReading={data?.latestReading}
							units={data?.units}
							loading={isLoading}
							error={error?.message}
							currentTime={currentTime}
						/>
					</div>

					{/* Glucose Chart */}
					<GlucoseChart
						readings={data?.readings}
						selectedRange={selectedRange}
						onRangeChange={setSelectedRange}
						loading={isLoading}
						error={error?.message}
					/>
				</div>
			</div>
		</ThemeProvider>
	);
}
