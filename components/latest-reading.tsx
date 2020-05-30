import { arrow } from '../lib/trend';
import { formatPlus } from '../lib/format';

export default function LatestReading({ units, latestReading }: any) {
	if (!latestReading) return null;
	return (
		<div className="latest">
			<div className="value">
				{latestReading.value} {arrow(latestReading.trend)}
			</div>
			<div className="delta">
				{formatPlus(latestReading.delta)} {units}
			</div>

			<style jsx>{`
				.latest {
					float: right;
				}
			`}</style>
		</div>
	);
}
