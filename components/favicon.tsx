import { useEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

export default function Favicon({
	width = 32,
	height = 32,
	children,
	setFavicon,
}: any) {
	useEffect(() => {
		const el = document.createElement('div');
		render(children, el, () => {
			const svg = `<svg fill="none" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
	  <foreignObject width="100%" height="100%">
		<div xmlns="http://www.w3.org/1999/xhtml">${el.innerHTML}</div>
	  </foreignObject>
	</svg>`;
			const favicon = `data:image/svg+xml,${encodeURIComponent(svg)}`;
			setFavicon(favicon);
			unmountComponentAtNode(el);
		});
	});

	return null;
}
