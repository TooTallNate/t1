export interface Reading {
	date: Date;
	trend: number;
	value: number;
	delta?: number;
	delay?: number;
}

export interface ReadingsData {
	expires: Date;
	units: string;
	readings: Reading[];
	latestReading: Reading;
}
