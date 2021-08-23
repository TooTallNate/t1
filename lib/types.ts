import { Trend } from 'dexcom-share';

export interface Reading {
	date: number;
	trend: Trend;
	value: number;
	delta?: number;
}

export interface ProjectedReading {
	date: number;
	projectedUpper: number;
	projectedLower: number;
}

export interface ReadingsPayload {
	expires: number;
	cache: string;
	units: string;
	readings: (Reading | ProjectedReading)[];
	latestReading: Reading;
}
