import {
	LineChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	Line
} from 'recharts';
import useSWR from 'swr';

export default function Index() {
	const { data, error } = useSWR('/api/latest', window.fetch)
	console.log({ data, error });

	return <div>{JSON.stringify(data)}</div>;
	/*
	return (
		<LineChart
			width={730}
			height={250}
			data={data}
			margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
		>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="name" />
			<YAxis />
			<Tooltip />
			<Legend />
			<Line type="monotone" dataKey="pv" stroke="#8884d8" />
			<Line type="monotone" dataKey="uv" stroke="#82ca9d" />
		</LineChart>
	);
	*/
}
