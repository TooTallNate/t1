import { Trend } from "dexcom-share";
import {
	ArrowDown,
	ArrowDownToLine,
	ArrowRight,
	ArrowUp,
	ArrowUpToLine,
	Minus,
	TrendingDown,
	TrendingUp,
} from "lucide-react";

interface TrendIconProps extends React.SVGAttributes<SVGElement> {
	trend: Trend;
}

export function TrendIcon({
	trend,
	className = "h-4 w-4",
	...rest
}: TrendIconProps) {
	switch (trend) {
		case Trend.DoubleUp:
			return (
				<ArrowUpToLine className={`${className} text-red-600`} {...rest} />
			);
		case Trend.SingleUp:
			return <ArrowUp className={`${className} text-red-500`} {...rest} />;
		case Trend.FortyFiveUp:
			return <TrendingUp className={`${className} text-red-500`} {...rest} />;
		case Trend.Flat:
			return (
				<ArrowRight
					className={`${className} text-muted-foreground`}
					{...rest}
				/>
			);
		case Trend.FortyFiveDown:
			return (
				<TrendingDown className={`${className} text-[#007bff]`} {...rest} />
			);
		case Trend.SingleDown:
			return <ArrowDown className={`${className} text-blue-500`} {...rest} />;
		case Trend.DoubleDown:
			return (
				<ArrowDownToLine className={`${className} text-blue-600`} {...rest} />
			);
		default:
			return (
				<Minus className={`${className} text-muted-foreground`} {...rest} />
			);
	}
}
