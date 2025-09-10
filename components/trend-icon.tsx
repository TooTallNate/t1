import {
	ArrowUp,
	ArrowDown,
	ArrowRight,
	TrendingUp,
	TrendingDown,
	Minus,
} from "lucide-react";

interface TrendIconProps {
	trend: string | number;
	className?: string;
}

export function TrendIcon({ trend, className = "h-4 w-4" }: TrendIconProps) {
	// Convert numeric trend values from Dexcom API
	// 1 = DoubleUp, 2 = SingleUp, 3 = FortyFiveUp, 4 = Flat,
	// 5 = FortyFiveDown, 6 = SingleDown, 7 = DoubleDown
	const trendValue = typeof trend === "number" ? trend : trend;

	switch (trendValue) {
		case 1:
		case "DoubleUp":
			return <ArrowUp className={`${className} text-red-600`} />;
		case 2:
		case "SingleUp":
			return <ArrowUp className={`${className} text-red-500`} />;
		case 3:
		case "FortyFiveUp":
			return <TrendingUp className={`${className} text-red-500`} />;
		case 4:
		case "Flat":
			return <ArrowRight className={`${className} text-muted-foreground`} />;
		case 5:
		case "FortyFiveDown":
			return <TrendingDown className={`${className} text-blue-500`} />;
		case 6:
		case "SingleDown":
			return <ArrowDown className={`${className} text-blue-500`} />;
		case 7:
		case "DoubleDown":
			return <ArrowDown className={`${className} text-blue-600`} />;
		default:
			return <Minus className={`${className} text-muted-foreground`} />;
	}
}
