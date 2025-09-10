"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Spacer } from "@chakra-ui/react";

import useReadings from "@lib/use-readings";
import { formatReading } from "@lib/format";

import Clock from "@components/clock";
import Header from "@components/header";
import Favicon from "@components/favicon";
import FaviconContents from "@components/favicon-contents";
import MainChart from "@components/chart-main";
import ExtendedChart from "@components/chart-extended";
import LatestReading from "@components/latest-reading";

export default function HomePage() {
	const [maxCount] = useState(300);
	const [favicon, setFavicon] = useState("");
	const { data } = useReadings(maxCount);
	const latestReading = data?.latestReading;

	// Update document title dynamically
	useEffect(() => {
		if (latestReading) {
			document.title = formatReading(latestReading);
		}
	}, [latestReading]);

	// Update favicon dynamically
	useEffect(() => {
		if (favicon) {
			const link =
				(document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
				document.createElement("link");
			link.type = "image/x-icon";
			link.rel = "icon";
			link.href = favicon;
			document.getElementsByTagName("head")[0].appendChild(link);
		}
	}, [favicon]);

	return (
		<>
			<Favicon setFavicon={setFavicon} width={34} height={34}>
				<FaviconContents latestReading={latestReading} />
			</Favicon>

			<Header />

			<Box px={6}>
				<Flex>
					<Clock latestReading={latestReading} />
					<Spacer />
					<LatestReading {...data} />
				</Flex>
			</Box>

			<MainChart {...data} />

			<ExtendedChart {...data} />
		</>
	);
}
