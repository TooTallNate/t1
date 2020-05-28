import Head from 'next/head';

import useReadings from '../lib/use-readings';
import { arrow } from '../lib/trend';
import { formatTitle } from '../lib/format';

import MainChart from '../components/chart-main';
import LatestReading from '../components/latest-reading';

export default function Index() {
	const maxCount = 36;
	const { data, error } = useReadings(maxCount);

	return (
		<>
			<Head>
				<title>{formatTitle(data?.latestReading)}</title>
				<meta
					name="viewport"
					content="initial-scale=1.0, width=device-width"
				/>
			</Head>

			<div className="top">
				<LatestReading {...data} />
			</div>

			<MainChart {...data} />

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
