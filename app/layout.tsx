import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
	description: "Description",
	keywords: "Keywords",
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/apple-icon.png",
	},
};

export const viewport: Viewport = {
	themeColor: "#317EFB",
	width: "device-width",
	initialScale: 1,
	minimumScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
			</head>
			<body>{children}</body>
		</html>
	);
}
