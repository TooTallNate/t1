import {
	LineChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	Line
} from 'recharts';
import useSWR from 'swr';
import fetch from 'isomorphic-fetch';

export default function Index() {
	const maxCount = 100;
	const { data, error } = useSWR(`/api/readings?maxCount=${maxCount}`, async (endpoint: string) => {
		const res = await fetch(endpoint);
		const body = await res.json();
		return body;
	});

	if (!data) {
		return null;
	}

	for (const r of data.readings) {
		r.date = new Date(r.date);
	}
	console.log(data.readings);

	return (
		<ResponsiveContainer aspect={4.0/3.0} width="100%">
			<LineChart
				data={data.readings}
				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="date" />
				<YAxis />
				<Tooltip />
				<Legend />
				<Line type="monotone" dataKey="value" stroke="#8884d8" />
			</LineChart>
		</ResponsiveContainer>
	);
}
