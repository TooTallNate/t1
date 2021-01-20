import ms from 'ms';
import Head from 'next/head';
import { useState } from 'react';

import { arrow } from '@lib/trend';
import favicon from '@lib/favicon';
import useInterval from '@lib/use-interval';
import useReadings from '@lib/use-readings';
import { formatPlus, formatTitle } from '@lib/format';

import Clock from '@components/clock';
import Favicon from '@components/favicon';
import MainChart from '@components/chart-main';
import ExtendedChart from '@components/chart-extended';
import LatestReading from '@components/latest-reading';

export default function Index() {
	const [maxCount, setMaxCount] = useState(300);
	const [favicon, setFavicon] = useState('');
	const { data, error } = useReadings(maxCount);
	const latestReading = data?.latestReading;

	let faviconContents = null;
	if (latestReading) {
		faviconContents = (
			<>
				<style>{`
				  .favicon {
				    font-weight: bold;
				    color: black;
				    width: 100%;
				    height: 100%;
				    text-align: center;
				    font-family: sans-serif;
				  }
				  .bottom {
				    font-size: 87%;
				  }
				  @media (prefers-color-scheme: dark) {
				    .favicon { color: white; }
				  }
				`}</style>
				<div className="favicon">
					<div className="top">{latestReading.value}</div>
					<div className="bottom">{`${formatPlus(
						latestReading.delta
					)} ${arrow(latestReading.trend)}`}</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Head>
				<title>{formatTitle(latestReading)}</title>
				{favicon && <link rel="icon" href={favicon} />}
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
				/>
			</Head>

			<Favicon setFavicon={setFavicon} width={34} height={34}>
				{faviconContents}
			</Favicon>

			<div className="top">
				<LatestReading {...data} />
				<Clock latestReading={latestReading} />
			</div>

			<MainChart {...data} />

			<ExtendedChart {...data} />

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
