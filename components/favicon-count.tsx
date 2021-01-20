import { useState, useEffect } from 'react';

import styles from '@styles/favicon.module.css';

export default function FaviconCount() {
	const [count, setCount] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setCount((count) => count + 1);
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, []);
	return <div className={styles.favicon}>{count}</div>;
}
