import { arrow } from '../lib/trend';
import { formatPlus } from '../lib/format';

export default function LatestReading({ units, latestReading }: any) {
	if (latestReading) {
		return (
			<div className="latest">
				<div className="value">
					{latestReading.value} {arrow(latestReading.trend)}
				</div>
				<div className="delta">
					{formatPlus(latestReading.delta)} {units}
				</div>
			</div>
		);
	}
	return null;
}
