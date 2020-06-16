import { timeFormat } from 'd3-time-format';

import { arrow } from '@lib/trend';
import { LatestReading } from '@lib/types';

export const formatHoursMinutes = timeFormat('%H:%M');
export const formatDate = timeFormat('%-m/%-d/%Y');
export const formatTime = timeFormat('%H:%M:%S');

export function formatPlus(value: number): string {
	if (value >= 0) {
		return `+${value}`;
	}
	return String(value);
}

export function formatTitle(reading?: LatestReading): string {
	if (!reading) return '';
	const { value, delta, trend } = reading;
	return `${value} ${formatPlus(delta)} ${arrow(trend)}`;
}
