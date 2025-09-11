import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { GeistMono } from "geist/font/mono";
import type { Viewport } from "next";

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
		<html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
			<head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<link rel="icon" href="/favicon.ico?bgl=100&delta=0&trend=Flat&dark" />
			</head>
			<body className={GeistSans.className}>{children}</body>
		</html>
	);
}
