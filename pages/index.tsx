import {
	LineChart,
	CartesianGrid,
	ResponsiveContainer,
	TooltipFormatter,
	TickFormatterFunction,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	Line
} from 'recharts';
import useSWR from 'swr';
import fetch from 'isomorphic-fetch';
import { timeFormat } from 'd3-time-format';

const f = timeFormat('%H:%M:%S');

export default function Index() {
	//const maxCount = 100;
	const maxCount = 36;
	const { data, error } = useSWR(`/api/readings?maxCount=${maxCount}`, async (endpoint: string) => {
		const res = await fetch(endpoint);
		const body = await res.json();
		return body;
	});

	let mainChart = null;
	if (data) {
		for (const r of data.readings) {
			r.date = new Date(r.date).getTime();
		}
		console.log(data.readings);

		const tooltipFormatter: TooltipFormatter = (value, name, entry, index) => {
			return [ value, data.units ];
		};

		const tickFormatter: TickFormatterFunction = (value) => {
			return f(value);
		};

		const CustomTooltip = ({ active, payload, label }: any) => {
			if (active) {
				return (
					<div className="custom-tooltip">
						<p className="time">Time: {f(label)}</p>
						<p className="value">{data.units}: <span className="value">{payload[0].value}</span></p>
					</div>
				);
			}

			return null;
		};

		mainChart=
			<ResponsiveContainer height="50%" width="100%">
				<LineChart
					data={data.readings}
					margin={{ top: 5, right: 0, left: 30, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 9" />
					<XAxis dataKey="date" tickFormatter={tickFormatter} />
					<YAxis orientation="right" />
					<Tooltip content={<CustomTooltip />}/>
					<Line type="monotone" dataKey="value" stroke="#8884d8" />
				</LineChart>
			</ResponsiveContainer>
	}

	return (
		<>
			{mainChart}
			<style jsx global>{`
			  html, body, #__next {
				margin: 0px;
				padding: 0px;
				width: 100%;
				height: 100%;
				font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
			  }
			`}</style>
		</>
	);
}
