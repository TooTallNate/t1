import { arrow } from '@lib/trend';
import { formatPlus } from '@lib/format';
import { LatestReading } from '@lib/types';

import styles from '@styles/favicon.module.css';

interface FaviconContentsProps {
	lastestReading?: LatestReading;
}

export default function FaviconContents({
	latestReading,
}: FaviconContentsProps) {
	const delta = formatPlus(latestReading.delta);
	const trend = arrow(latestReading.trend);
	const bottom = `${delta} ${trend}`;
	return (
		<div className={styles.favicon}>
			<div className={styles.top}>{latestReading.value}</div>
			<div className={styles.bottom}>{bottom}</div>
		</div>
	);
}
