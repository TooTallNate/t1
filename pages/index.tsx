import ms from 'ms';
import Head from 'next/head';
import { useState } from 'react';

import useInterval from '../lib/use-interval';
import useReadings from '../lib/use-readings';
import { arrow } from '../lib/trend';
import { formatTitle } from '../lib/format';

import Clock from '../components/clock';
import MainChart from '../components/chart-main';
import LatestReading from '../components/latest-reading';

export default function Index() {
	const [ maxCount, setMaxCount ] = useState(40);
	const [ now, setNow ] = useState(Date.now());
	const { data, error } = useReadings(maxCount);
	const latestReading = data?.latestReading;

	// Refresh the timeline on the chart every 5 seconds
	useInterval(() => setNow(Date.now()), ms('1s'));

	return (
		<>
			<Head>
				<title>{formatTitle(latestReading)}</title>
				<meta
					name="viewport"
					content="initial-scale=1.0, width=device-width"
				/>
			</Head>

			<div className="top">
				<LatestReading {...data} />
				<Clock now={now} latestReading={latestReading} />
			</div>

			<MainChart {...data} now={now} />

			<style jsx global>{`
				html,
				body,
				#__next {
					margin: 0px;
					padding: 0px;
					width: 100%;
					height: 100%;
					font-family: 'Inter', -apple-system, BlinkMacSystemFont,
						'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
						'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
				}
			`}</style>
		</>
	);
}
