"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, Clock } from "lucide-react";

interface DashboardHeaderProps {
	theme: "light" | "dark" | "system";
	onThemeToggle: () => void;
}

export function DashboardHeader({
	theme,
	onThemeToggle,
}: DashboardHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Nate's Glucose Monitor
				</h1>
				<p className="text-muted-foreground">
					Continuous glucose monitoring dashboard
				</p>
			</div>
			<Button
				variant="outline"
				size="icon"
				onClick={onThemeToggle}
				className="h-9 w-9 bg-transparent"
			>
				{theme === "dark" ? (
					<Sun className="h-4 w-4" />
				) : theme === "light" ? (
					<Moon className="h-4 w-4" />
				) : (
					<Clock className="h-4 w-4" />
				)}
			</Button>
		</div>
	);
}
