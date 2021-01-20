import createDebug from 'debug';
import { useEffect, useRef, useState } from 'react';

const debug = createDebug('t1:components:favicon');

function removeSourceMappingURL(input: string): string {
	return input
		.trim()
		.split('\n')
		.filter(
			(l) =>
				!l.startsWith('/*# sourceMappingURL=') &&
				!l.startsWith('/*@ sourceURL=')
		)
		.join('\n');
}

function getClassNames(el: Element, classNames: string[] = []): string[] {
	const className = typeof el.className === 'string' && el.className.trim();
	if (className) {
		classNames.push(...className.split(/\s+/));
	}

	for (const child of el.children) {
		getClassNames(child, classNames);
	}

	return classNames;
}

export default function Favicon({
	width = 32,
	height = 32,
	children,
	setFavicon,
}: any) {
	const div = useRef<HTMLDivElement | null>(null);
	const [styles, setStyles] = useState('');
	const [stylesheets, setStylesheets] = useState<string[]>([]);

	useEffect(() => {
		if (!div.current) return;
		debug('useEffect');

		const classNames = getClassNames(div.current);

		const styles = [...document.querySelectorAll('style')].filter((el) => {
			const css = el.innerHTML;
			return classNames.some((c) => css.includes(`.${c}`));
		});

		const css = styles
			.map((el) => removeSourceMappingURL(el.innerHTML))
			.join('\n');
		setStyles(css);

		const stylesheets: string[] = [];
		for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
			const href = link.getAttribute('href');
			if (href) {
				stylesheets.push(href);
			}
		}
		console.log({ stylesheets });
		setStylesheets(stylesheets);

		const observer = new MutationObserver(update);
		observer.observe(div.current, {
			subtree: true,
			childList: true,
			attributes: true,
			characterData: true,
		});

		let previousHtml = '';

		function update() {
			const html = div.current?.innerHTML;
			if (!html || html === previousHtml) return;

			const favicon = `data:image/svg+xml,${encodeURIComponent(html)}`;
			previousHtml = html;
			setFavicon(favicon);
		}

		update();

		return () => {
			debug('Disconnect');
			observer.disconnect();
		};
	}, []);

	return (
		<div ref={div} style={{ display: 'none', position: 'absolute' }}>
			<svg
				fill="none"
				viewBox={`0 0 ${width} ${height}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				<foreignObject width="100%" height="100%">
					{stylesheets.map((href) => (
						<link rel="stylesheet" href={href} key={href} />
					))}
					<style>{styles}</style>
					<div
						// @ts-ignore
						xmlns="http://www.w3.org/1999/xhtml"
						style={{ width: '100%', height: '100%' }}
					>
						{children}
					</div>
				</foreignObject>
			</svg>
		</div>
	);
}
