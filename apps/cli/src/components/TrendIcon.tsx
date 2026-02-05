import { Text } from "ink";
import dexcom from "dexcom-share";

const { Trend } = dexcom;

interface TrendIconProps {
	trend: number;
}

export function TrendIcon({ trend }: TrendIconProps) {
	switch (trend) {
		case Trend.DoubleUp:
			return <Text color="red">^^</Text>;
		case Trend.SingleUp:
			return <Text color="red">^</Text>;
		case Trend.FortyFiveUp:
			return <Text color="red">/</Text>;
		case Trend.Flat:
			return <Text color="gray">-</Text>;
		case Trend.FortyFiveDown:
			return <Text color="blue">\</Text>;
		case Trend.SingleDown:
			return <Text color="blue">v</Text>;
		case Trend.DoubleDown:
			return <Text color="blue">vv</Text>;
		default:
			return <Text color="gray">?</Text>;
	}
}

export function getTrendArrow(trend: number): string {
	switch (trend) {
		case Trend.DoubleUp:
			return "^^";
		case Trend.SingleUp:
			return "^";
		case Trend.FortyFiveUp:
			return "/";
		case Trend.Flat:
			return "-";
		case Trend.FortyFiveDown:
			return "\\";
		case Trend.SingleDown:
			return "v";
		case Trend.DoubleDown:
			return "vv";
		default:
			return "?";
	}
}
