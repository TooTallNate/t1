"use client";

import { Trend } from "dexcom-share";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { DashboardHeader } from "@/components/dashboard-header";
import { GlucoseChart } from "@/components/glucose-chart";
import { LatestReadingCard } from "@/components/latest-reading-card";
import { ThemeProvider } from "@/components/theme-provider";
import { TimeDisplay } from "@/components/time-display";
import { useFavicon } from "@/hooks/use-favicon";

interface Reading {
	date: string | Date;
	trend: number;
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
	const [selectedRange, setSelectedRange] = useState(6);
	const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
	const { setFavicon } = useFavicon();

	// Always fetch 24h of data (288 data points at 5-minute intervals)
	const maxCount = 288;

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
			refreshWhenHidden: true,
			refreshWhenOffline: true,
		},
	);

	// Update favicon when glucose data changes
	useEffect(() => {
		if (data?.latestReading) {
			const { value, delta, trend } = data.latestReading;

			// Determine if dark mode is active
			const isDark =
				theme === "dark" ||
				(theme === "system" &&
					window.matchMedia("(prefers-color-scheme: dark)").matches);

			setFavicon({
				bgl: value,
				delta: delta || 0,
				trend: Trend[trend],
				dark: isDark,
			});
		}
	}, [data?.latestReading, theme, setFavicon]);

	// Listen for system theme changes when in "system" mode
	useEffect(() => {
		if (theme !== "system" || !data?.latestReading) return;

		const updateFaviconForSystemTheme = (e: MediaQueryListEvent) => {
			const { value, delta, trend } = data.latestReading;

			setFavicon({
				bgl: value,
				delta: delta || 0,
				trend: Trend[trend],
				dark: e.matches,
			});
		};

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", updateFaviconForSystemTheme);

		return () => {
			mediaQuery.removeEventListener("change", updateFaviconForSystemTheme);
		};
	}, [theme, data?.latestReading, setFavicon]);

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
			<div className="h-screen overflow-hidden bg-background p-4 md:p-6">
				<div className="mx-auto max-w-7xl h-full flex flex-col gap-4 md:gap-6">
					<DashboardHeader theme={theme} onThemeToggle={toggleTheme} />

					{/* Current Time & Latest Reading */}
					<div className="grid gap-4 md:grid-cols-2">
						<TimeDisplay />
						<LatestReadingCard
							latestReading={data?.latestReading}
							units={data?.units}
							loading={isLoading}
							error={error?.message}
						/>
					</div>

					{/* Glucose Chart */}
					<div className="flex-1 min-h-0">
						<GlucoseChart
							readings={data?.readings}
							selectedRange={selectedRange}
							onRangeChange={setSelectedRange}
							loading={isLoading}
							error={error?.message}
						/>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
