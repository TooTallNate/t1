import Head from 'next/head';
import { useState } from 'react';
import { Flex, Spacer } from '@chakra-ui/react';

import useReadings from '@lib/use-readings';
import { formatTitle } from '@lib/format';

import Clock from '@components/clock';
import Header from '@components/header';
import Favicon from '@components/favicon';
import FaviconContents from '@components/favicon-contents';
import MainChart from '@components/chart-main';
import ExtendedChart from '@components/chart-extended';
import LatestReading from '@components/latest-reading';

export default function Index() {
	const [maxCount] = useState(300);
	const [favicon, setFavicon] = useState('');
	const { data } = useReadings(maxCount);
	const latestReading = data?.latestReading;

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
				<FaviconContents latestReading={latestReading} />
			</Favicon>

			<Header />
			<Flex>
				<Clock latestReading={latestReading} />
				<Spacer />
				<LatestReading {...data} />
			</Flex>

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
				}
			`}</style>
		</>
	);
}
