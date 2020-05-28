import {
	LineChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	TickFormatterFunction,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	Line
} from 'recharts';
import useSWR from 'swr';
import fetch from 'isomorphic-fetch';
import Head from 'next/head';

import { arrow } from '../lib/trend';
import {
	formatHoursMinutes,
	formatDate,
	formatTime,
	formatPlus
} from '../lib/format';

import LatestReading from '../components/latest-reading';

export default function Index() {
	const maxCount = 36;
	const { data, error } = useSWR(
		`/api/readings?maxCount=${maxCount}`,
		async (endpoint: string) => {
			const res = await fetch(endpoint);
			const body = await res.json();
			return body;
		}
	);

	let title = null;
	let mainChart = null;
	if (data) {
		const { units, readings, latestReading } = data;
		for (const r of readings) {
			r.date = new Date(r.date).getTime();
		}

		const titleTrend = `${latestReading.value} ${formatPlus(
			latestReading.delta
		)} ${arrow(latestReading.trend)}`;
		title = <title>{titleTrend}</title>;

		const tickFormatter: TickFormatterFunction = value => {
			return formatHoursMinutes(value);
		};

		const CustomTooltip = ({ active, payload, label }: any) => {
			if (active) {
				const reading = payload[0].payload;
				return (
					<div className="custom-tooltip">
						<p className="date">Date: {formatDate(label)}</p>
						<p className="time">Time: {formatTime(label)}</p>
						<p className="trend">Trend: {arrow(reading.trend)}</p>
						<p className="value">
							{data.units}:{' '}
							<span className="value">{reading.value}</span>
						</p>
					</div>
				);
			}

			return null;
		};

		mainChart = (
			<ResponsiveContainer height="50%" width="100%">
				<LineChart
					data={readings}
					margin={{ top: 5, right: 0, left: 30, bottom: 5 }}
				>
					<XAxis dataKey="date" tickFormatter={tickFormatter} />
					<YAxis
						orientation="right"
						type="number"
						scale="log"
						domain={[30, 400]}
					/>
					<Tooltip content={<CustomTooltip />} />
					<ReferenceLine y={55} stroke="red" strokeDasharray="1 4" />
					<ReferenceLine y={80} stroke="red" strokeDasharray="3 9" />
					<ReferenceLine y={180} stroke="red" strokeDasharray="3 9" />
					<ReferenceLine y={240} stroke="red" strokeDasharray="1 4" />
					<Line type="monotone" dataKey="value" stroke="#8884d8" />
				</LineChart>
			</ResponsiveContainer>
		);
	}

	return (
		<>
			<Head>
				{title}
				<meta
					name="viewport"
					content="initial-scale=1.0, width=device-width"
				/>
			</Head>
			<div className="top">
				<LatestReading {...data} />
			</div>
			{mainChart}
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
