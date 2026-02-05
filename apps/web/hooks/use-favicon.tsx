"use client";

import { useCallback, useEffect } from "react";

interface FaviconParams {
	bgl: number;
	delta: number;
	trend: string;
	dark?: boolean;
}

export function useFavicon() {
	const setFavicon = useCallback((params: FaviconParams) => {
		const { bgl, delta, trend, dark } = params;

		// Construct the favicon URL with query parameters
		const searchParams = new URLSearchParams({
			bgl: bgl.toString(),
			delta: delta.toString(),
			trend: trend,
		});

		if (dark) {
			searchParams.append("dark", "");
		}

		const faviconUrl = `/favicon.ico?${searchParams.toString()}`;

		// Find existing favicon link or create a new one
		let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}

		// Update the href
		link.href = faviconUrl;
	}, []);

	// Clean up on unmount (optional - you might want to keep the last favicon)
	useEffect(() => {
		return () => {
			// Optionally reset to default favicon on unmount
			// const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
			// if (link) {
			//   link.href = "/favicon.ico";
			// }
		};
	}, []);

	return { setFavicon };
}
