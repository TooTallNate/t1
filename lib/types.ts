import { Trend } from 'dexcom-share';

export interface Reading {
	date: number;
	trend: Trend;
	value: number;
}

export interface ProjectedReading {
	date: number;
	projectedUpper: number;
	projectedLower: number;
}

export interface LatestReading extends Reading {
	delta: number;
}

export interface ReadingsPayload {
	expires: number;
	cache: string;
	units: string;
	readings: (Reading | ProjectedReading)[];
	latestReading: LatestReading;
}
