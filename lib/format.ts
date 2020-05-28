import { timeFormat } from 'd3-time-format';

export const formatHoursMinutes = timeFormat('%H:%M');
export const formatDate = timeFormat('%-m/%-d/%Y');
export const formatTime = timeFormat('%H:%M:%S');

export function formatPlus(value: number): string {
	if (value >= 0) {
		return `+${value}`;
	}
	return String(value);
}
