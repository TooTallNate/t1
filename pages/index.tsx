import ms from 'ms';
import Head from 'next/head';
import { useState } from 'react';

import favicon from '@lib/favicon';
import useInterval from '@lib/use-interval';
import useReadings from '@lib/use-readings';
import { arrow } from '@lib/trend';
import { formatTitle } from '@lib/format';

import Clock from '@components/clock';
import MainChart from '@components/chart-main';
import ExtendedChart from '@components/chart-extended';
import LatestReading from '@components/latest-reading';

export default function Index() {
	const [ maxCount, setMaxCount ] = useState(300);
	const [ now, setNow ] = useState(Date.now());
	const { data, error } = useReadings(maxCount);
	const latestReading = data?.latestReading;

	// Refresh the timeline on the chart every 5 seconds
	useInterval(() => setNow(Date.now()), ms('1s'));

	return (
		<>
			<Head>
				<title>{formatTitle(latestReading)}</title>
				<link rel="icon" href={favicon()} />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
				/>
			</Head>

			<div className="top">
				<LatestReading {...data} />
				<Clock now={now} latestReading={latestReading} />
			</div>

			<MainChart {...data} now={now} />

			<ExtendedChart {...data} now={now} />

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
