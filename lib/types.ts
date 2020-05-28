import { Trend } from 'dexcom-share';

export interface Reading {
	date: number;
	value: number;
}

export interface LatestReading extends Reading {
	delta: number;
}

export interface ReadingsPayload {
	expires: number;
	units: string;
	readings: Reading[];
	latestReading: LatestReading;
}
