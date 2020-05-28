import { Trend } from 'dexcom-share';

export function arrow(trend: Trend): string {
	switch (trend) {
		case Trend.None:
			return '⇼';
		case Trend.DoubleUp:
			return '⇈';
		case Trend.SingleUp:
			return '↑';
		case Trend.FortyFiveUp:
			return '↗';
		case Trend.Flat:
			return '→';
		case Trend.FortyFiveDown:
			return '↘';
		case Trend.SingleDown:
			return '↓';
		case Trend.DoubleDown:
			return '⇊';
		default:
			return '-';
	}
}
